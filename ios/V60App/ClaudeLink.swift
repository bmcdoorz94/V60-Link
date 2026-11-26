import Foundation
import UIKit
import UserNotifications

/// The link to Claude live on Kyle's PC (bridge/server.js), the same messages the web page sends
/// (tools/gen/live_claude.js): wss://<pc>.<tailnet>.ts.net/link?code=<pairing code>.
/// Claude's messages and questions arrive as notifications, so they reach Kyle with the app in the background.
/// Anything that could change the car waits for Allow, which needs the phone unlocked (Face ID).
final class ClaudeLink: NSObject, ObservableObject {
    static let shared = ClaudeLink()
    static let version = "0.1"

    struct Line: Codable, Identifiable {
        var id = UUID()
        let who: String
        let text: String
        let at: Date
    }

    struct Ask: Identifiable {
        let id: String
        let title: String
        let body: String
        let detail: String
        let isPerm: Bool
        let yes: () -> Void
        let no: () -> Void
    }

    @Published private(set) var host: String
    @Published private(set) var code: String
    @Published private(set) var isOn: Bool
    @Published private(set) var state = "Off"
    @Published private(set) var linked = false
    @Published private(set) var feed: [Line] = []
    @Published private(set) var asks: [Ask] = []

    private var session: URLSession!
    private var socket: URLSessionWebSocketTask?
    private var tries = 0
    private var retry: DispatchWorkItem?
    private var restoreWork: DispatchWorkItem?
    private var dirty = false
    private var replaced = false

    private override init() {
        let d = UserDefaults.standard
        host = d.string(forKey: "claudeHost") ?? ""
        code = d.string(forKey: "claudeCode") ?? ""
        isOn = d.bool(forKey: "claudeOn")
        super.init()
        session = URLSession(configuration: .default, delegate: self, delegateQueue: .main)
        if let data = d.data(forKey: "claudeFeed"), let saved = try? JSONDecoder().decode([Line].self, from: data) {
            feed = saved
        }
        Car.shared.onReady = { [weak self] on in self?.carChanged(on) }
        Car.shared.onLine = { [weak self] dir, text in self?.sendLine(dir, text) }
        if isOn { open() }
    }

    // MARK: settings

    func configure(host newHost: String, code newCode: String) {
        host = newHost.trimmingCharacters(in: .whitespacesAndNewlines)
        code = newCode.trimmingCharacters(in: .whitespacesAndNewlines)
        isOn = true
        let d = UserDefaults.standard
        d.set(host, forKey: "claudeHost")
        d.set(code, forKey: "claudeCode")
        d.set(true, forKey: "claudeOn")
        close()
        tries = 0
        open()
    }

    func setOn(_ on: Bool) {
        isOn = on
        UserDefaults.standard.set(on, forKey: "claudeOn")
        if on { tries = 0; open() } else { close(); state = "Off" }
    }

    /// The app came on screen: try again at once if the link is down.
    func wake() {
        replaced = false
        if isOn && socket == nil { tries = 0; open() }
    }

    // MARK: the socket

    func open() {
        retry?.cancel()
        guard isOn else { state = "Off"; return }
        guard !host.isEmpty, !code.isEmpty else { state = "Pair with your PC first (below)."; return }
        guard socket == nil else { return }
        guard let url = linkURL() else { state = "That PC address does not look right."; return }
        state = "Connecting to your PC..."
        let s = session.webSocketTask(with: url)
        socket = s
        s.resume()
        receive(s)
    }

    private func close() {
        retry?.cancel()
        let s = socket
        socket = nil
        linked = false
        s?.cancel(with: .normalClosure, reason: nil)
    }

    private func linkURL() -> URL? {
        var h = host
        for p in ["https://", "http://", "wss://", "ws://"] where h.lowercased().hasPrefix(p) { h = String(h.dropFirst(p.count)) }
        if let slash = h.firstIndex(of: "/") { h = String(h[..<slash]) }
        let local = h.hasPrefix("127.0.0.1") || h.hasPrefix("localhost")
        let c = code.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? ""
        return URL(string: (local ? "ws://" : "wss://") + h + "/link?code=" + c)
    }

    private func receive(_ s: URLSessionWebSocketTask) {
        s.receive { [weak self] result in
            DispatchQueue.main.async {
                guard let self, self.socket === s else { return }
                switch result {
                case .success(let message):
                    if case .string(let text) = message, let data = text.data(using: .utf8),
                       let o = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] {
                        self.handle(o)
                    }
                    self.receive(s)
                case .failure:
                    self.dropped(s)
                }
            }
        }
    }

    private func dropped(_ s: URLSessionWebSocketTask, reason given: String = "") {
        guard s === socket else { return }
        socket = nil
        let wasLinked = linked
        linked = false
        let reason = given.isEmpty ? (s.closeReason.flatMap { String(data: $0, encoding: .utf8) } ?? "") : given
        s.cancel(with: .goingAway, reason: nil)
        for a in asks where !a.isPerm { a.no() }
        asks = []
        if wasLinked { Journal.shared.add("link to the PC closed" + (reason.isEmpty ? "" : " (\(reason))")) }
        if reason.contains("pairing") { state = "The PC refused the pairing code."; return }
        if reason.contains("replaced") {
            // Another copy of V60-Link (Bluefy) took the link. Don't fight over it; try again when the app opens.
            replaced = true
            state = "Another copy of V60-Link (Bluefy?) has the link. Opening this app takes it back."
            return
        }
        guard isOn, !replaced else { return }
        state = tries == 0 ? "Lost the PC. Trying again..." : "Your PC is not answering. Is Claude live running there, and Tailscale on here?"
        let wait = [2.0, 5, 10, 20, 30][min(tries, 4)]
        tries += 1
        let w = DispatchWorkItem { [weak self] in self?.open() }
        retry = w
        DispatchQueue.main.asyncAfter(deadline: .now() + wait, execute: w)
    }

    private func send(_ o: [String: Any]) {
        guard let s = socket, JSONSerialization.isValidJSONObject(o),
              let data = try? JSONSerialization.data(withJSONObject: o),
              let text = String(data: data, encoding: .utf8) else { return }
        s.send(.string(text)) { _ in }
    }

    private func hello() {
        let car = Car.shared
        send(["t": "hello", "adapter": car.adapterName ?? "", "connected": car.phase == .ready, "can": car.canBus,
              "page": "V60 iPhone app \(Self.version)", "auto": true, "known": car.adapterName != nil])
    }

    // MARK: messages from the PC

    private func handle(_ o: [String: Any]) {
        Awake.extend()
        let id = o["id"].map { "\($0)" } ?? ""
        switch o["t"] as? String {
        case "welcome":
            linked = true
            tries = 0
            state = "Claude is watching"
            Journal.shared.add("linked to Claude live on the PC")
            if Car.shared.phase == .ready { sendLink(true) }
        case "msg":
            let text = o["text"] as? String ?? ""
            addFeed("claude", text)
            Journal.shared.add("Claude: " + String(text.prefix(80)))
            notify(title: "Claude", body: text, id: "msg-" + UUID().uuidString)
        case "cmd":
            runCommand(o, id: id)
        case "restore":
            Car.shared.restore { [weak self] ok, info in
                var r: [String: Any] = ["t": "res", "id": id, "ok": ok]
                r[ok ? "raw" : "error"] = info
                self?.send(r)
            }
        case "perm":
            let tool = o["tool"] as? String ?? "a tool"
            addAsk(Ask(id: "p:" + id, title: "Claude wants to use \(tool)", body: o["desc"] as? String ?? "",
                       detail: o["preview"] as? String ?? "", isPerm: true, yes: {}, no: {}))
        case "drop":
            removeAsk("c:" + id)
            removeAsk("p:" + id)
        default:
            break
        }
    }

    private func runCommand(_ o: [String: Any], id: String) {
        let c = (o["c"] as? String ?? "").trimmingCharacters(in: .whitespaces)
        let ms = min(max((o["timeout"] as? Double) ?? 4000, 500), 30000)
        let reply: ([String: Any]) -> Void = { [weak self] r in
            var r = r
            r["t"] = "res"
            r["id"] = id
            self?.send(r)
        }
        guard Car.shared.phase == .ready else {
            reply(["ok": false, "error": "The adapter is not connected on the phone."])
            return
        }
        let go: () -> Void = { [weak self] in
            if CarRules.dirties(c) { self?.dirty = true }
            Car.shared.send(c, timeout: ms / 1000) { r in
                switch r {
                case .success(let raw): reply(["ok": true, "raw": raw])
                case .failure(let e): reply(["ok": false, "error": e.message])
                }
                self?.scheduleRestore()
            }
        }
        if CarRules.isWrite(c) || (o["write"] as? Bool ?? false) {
            let why = (o["why"] as? String).flatMap { $0.isEmpty ? nil : $0 } ?? "No reason given."
            addAsk(Ask(id: "c:" + id, title: "Claude wants to send a command that can change the car", body: why,
                       detail: c, isPerm: false, yes: go, no: { reply(["ok": false, "error": "Kyle said no."]) }))
        } else {
            go()
        }
    }

    /// After Claude addressed other modules, set the adapter back up once it has been quiet for 30 s.
    private func scheduleRestore() {
        restoreWork?.cancel()
        guard dirty else { return }
        let w = DispatchWorkItem { [weak self] in Car.shared.restore { _, _ in self?.dirty = false } }
        restoreWork = w
        DispatchQueue.main.asyncAfter(deadline: .now() + 30, execute: w)
    }

    // MARK: asks (Allow / No)

    private func addAsk(_ a: Ask) {
        asks.append(a)
        let body = [a.body, a.detail, a.isPerm ? "" : "Only allow it with the car parked."].filter { !$0.isEmpty }.joined(separator: "\n")
        notify(title: a.title, body: body, id: "ask-" + a.id, category: "ASK", info: ["ask": a.id])
    }

    private func removeAsk(_ id: String) {
        asks.removeAll { $0.id == id }
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: ["ask-" + id])
    }

    func answer(_ id: String, yes: Bool) {
        guard let a = asks.first(where: { $0.id == id }) else { return }
        removeAsk(id)
        if a.isPerm {
            send(["t": "perm", "id": String(id.dropFirst(2)), "allow": yes])
            addFeed("you", (yes ? "Allowed: " : "Said no to: ") + a.title.replacingOccurrences(of: "Claude wants to use ", with: ""))
            return
        }
        addFeed("you", (yes ? "Allowed: " : "Said no: ") + a.body + " (" + a.detail + ")")
        if yes { a.yes() } else { a.no() }
    }

    // MARK: car and Kyle

    private func carChanged(_ on: Bool) {
        Awake.extend()
        if on, socket == nil { tries = 0; open() }
        sendLink(on)
    }

    private func sendLink(_ on: Bool) {
        guard linked else { return }
        let car = Car.shared
        send(["t": "link", "state": on ? "on" : "off", "adapter": car.adapterName ?? "adapter", "can": car.canBus, "sim": false])
    }

    private func sendLine(_ dir: String, _ text: String) {
        if linked { send(["t": "log", "d": dir, "x": text]) }
    }

    func say(_ text: String) {
        let t = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !t.isEmpty, linked else { return }
        send(["t": "say", "text": t])
        addFeed("you", t)
    }

    private func addFeed(_ who: String, _ text: String) {
        guard !text.isEmpty else { return }
        feed.append(Line(who: who, text: String(text.prefix(4000)), at: Date()))
        if feed.count > 40 { feed.removeFirst(feed.count - 40) }
        if let data = try? JSONEncoder().encode(feed) { UserDefaults.standard.set(data, forKey: "claudeFeed") }
    }

    func clearFeed() {
        feed = []
        UserDefaults.standard.removeObject(forKey: "claudeFeed")
    }

    private func notify(title: String, body: String, id: String, category: String? = nil, info: [String: String] = [:]) {
        let c = UNMutableNotificationContent()
        c.title = title
        c.body = body
        c.sound = .default
        if let category { c.categoryIdentifier = category }
        c.userInfo = info
        UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: id, content: c, trigger: nil))
    }
}

extension ClaudeLink: URLSessionWebSocketDelegate {
    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol proto: String?) {
        guard webSocketTask === socket else { return }
        hello()
    }

    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask,
                    didCloseWith closeCode: URLSessionWebSocketTask.CloseCode, reason: Data?) {
        dropped(webSocketTask, reason: reason.flatMap { String(data: $0, encoding: .utf8) } ?? "")
    }

    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        if let s = task as? URLSessionWebSocketTask { dropped(s) }
    }
}
