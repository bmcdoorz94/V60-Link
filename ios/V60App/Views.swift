import SwiftUI
import UserNotifications
import WebKit

struct RootView: View {
    @ObservedObject private var ui = UIState.shared
    @ObservedObject private var car = Car.shared
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            GarageWeb()
                .ignoresSafeArea(edges: .bottom)
            Button {
                ui.showPanel = true
            } label: {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "car.fill")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 48, height: 48)
                        .background(Circle().fill(Color.black.opacity(0.85)))
                    Circle()
                        .fill(dot)
                        .frame(width: 13, height: 13)
                        .overlay(Circle().stroke(.white, lineWidth: 2))
                }
            }
            .padding(.trailing, 14)
            .padding(.bottom, 92)
            .accessibilityLabel("Car link")
        }
        .sheet(isPresented: $ui.showPanel) { CarPanel() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { ClaudeLink.shared.wake() }
        }
    }

    private var dot: Color {
        switch car.phase {
        case .ready: return .green
        case .waiting, .connecting, .noCar: return .orange
        default: return .gray
        }
    }
}

/// The Garage website, the same pages as in Bluefy. Web Bluetooth does not exist in an app's web view, so the page's
/// Live link uses the app's own adapter link instead (tools/gen/live_native.js): it sends commands through
/// window.webkit.messageHandlers.v60car, and the app tells it when the car is ready (V60_NATIVE.onLink) and hands it
/// every reading the recorder takes (V60_NATIVE.onSample), so the gauges fill by themselves without a second poller.
struct GarageWeb: UIViewRepresentable {
    static let home = URL(string: "https://bmcdoorz94.github.io/V60-Link/")!

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        let content = config.userContentController
        // pc: Kyle's PC on Tailscale, where the drive reports and the Garage's summary.json live (bridge/drives.js)
        let pc = ClaudeLink.shared.host.filter { $0.isLetter || $0.isNumber || $0 == "." || $0 == "-" }
        content.addUserScript(WKUserScript(
            source: "window.V60_NATIVE = { app: '\(ClaudeLink.version)', pc: '\(pc)' };",
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        content.addScriptMessageHandler(context.coordinator.bridge, contentWorld: .page, name: "v60car")
        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        web.allowsBackForwardNavigationGestures = true
        if #available(iOS 16.4, *) { web.isInspectable = true }
        context.coordinator.bridge.attach(web)
        web.load(URLRequest(url: Self.home))
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    @MainActor
    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let bridge = CarBridge()

        /// The Garage stays in the app; links anywhere else open in Safari.
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if let url = action.request.url, action.navigationType == .linkActivated,
               url.host?.lowercased() != GarageWeb.home.host {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                     for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = action.request.url { UIApplication.shared.open(url) }
            return nil
        }
    }
}

struct CarPanel: View {
    @ObservedObject private var car = Car.shared
    @ObservedObject private var claude = ClaudeLink.shared
    @ObservedObject private var journal = Journal.shared
    @Environment(\.dismiss) private var dismiss
    @State private var host = ClaudeLink.shared.host
    @State private var code = ClaudeLink.shared.code
    @State private var message = ""
    @State private var notifications = "Checking"
    @State private var copied = false

    var body: some View {
        NavigationStack {
            Form {
                if !claude.asks.isEmpty { asksSection }
                adapterSection
                claudeSection
                testSection
                logSection
            }
            .navigationTitle("Car link")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
            .task {
                let s = await UNUserNotificationCenter.current().notificationSettings()
                notifications = s.authorizationStatus == .authorized ? "Allowed" : "Not allowed"
            }
        }
    }

    private var asksSection: some View {
        Section("Claude is asking") {
            ForEach(claude.asks) { a in
                VStack(alignment: .leading, spacing: 6) {
                    Text(a.title).bold()
                    if !a.body.isEmpty { Text(a.body) }
                    if !a.detail.isEmpty { Text(a.detail).font(.system(.footnote, design: .monospaced)) }
                    if !a.isPerm { Text("Only allow it with the car parked.").font(.footnote).foregroundStyle(.secondary) }
                    HStack {
                        Button("Allow once", role: .destructive) { claude.answer(a.id, yes: true) }
                        Spacer()
                        Button("No") { claude.answer(a.id, yes: false) }
                    }
                    .buttonStyle(.borderless)
                    .padding(.top, 4)
                }
            }
        }
    }

    private var adapterSection: some View {
        Section {
            Text(car.status)
            if let name = car.adapterName {
                HStack { Text("Adapter"); Spacer(); Text(name).foregroundStyle(.secondary) }
            }
            if car.phase == .noCar || car.phase == .waiting {
                Button("Try again now") { car.retryNow() }
            }
            Button(car.scanning ? "Looking for adapters..." : (car.adapterName == nil ? "Choose adapter" : "Choose a different adapter")) {
                car.scan()
            }
            .disabled(car.scanning || car.bluetooth != "On")
            ForEach(car.found) { f in
                Button {
                    car.choose(f)
                } label: {
                    HStack {
                        Text(f.name)
                        Spacer()
                        Text(f.rssi == 0 ? "held by this phone" : "\(f.rssi) dBm").foregroundStyle(.secondary)
                    }
                }
            }
            Toggle("Record drives (also keeps the link alive in your pocket)", isOn: Binding(get: { car.keepAliveOn }, set: { car.setKeepAlive($0) }))
            if car.adapterName != nil {
                Button("Forget this adapter", role: .destructive) { car.forget() }
            }
        } header: {
            Text("Adapter")
        } footer: {
            Text("If your adapter is not listed: swipe Bluefy away, unplug the adapter for 10 seconds, plug it back in, and look again. Accept a pairing request if one appears.")
        }
    }

    private var claudeSection: some View {
        Section {
            Text(claude.state)
            Toggle("Let Claude watch", isOn: Binding(get: { claude.isOn }, set: { claude.setOn($0) }))
            TextField("PC address, like kitty.tail1234.ts.net", text: $host)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .keyboardType(.URL)
            TextField("Pairing code", text: $code)
                .keyboardType(.numberPad)
            Button("Save and connect") { claude.configure(host: host, code: code) }
                .disabled(host.isEmpty || code.isEmpty)
            if claude.linked {
                HStack {
                    TextField("Message Claude", text: $message)
                    Button("Send") {
                        claude.say(message)
                        message = ""
                    }
                    .buttonStyle(.borderless)
                    .disabled(message.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            ForEach(Array(claude.feed.suffix(12).reversed())) { l in
                VStack(alignment: .leading, spacing: 2) {
                    Text((l.who == "claude" ? "Claude" : "You") + " · " + l.at.formatted(date: .omitted, time: .shortened))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text(l.text)
                    if let u = l.url, let link = URL(string: u) {
                        Link("Open the drive report", destination: link)
                    }
                }
            }
        } header: {
            Text("Claude live")
        } footer: {
            Text("The PC address and pairing code are in the Claude live window on your PC. Type them once; the app keeps them.")
        }
    }

    struct Check: Identifiable {
        let id: String
        let ok: Bool
    }

    private var checks: [Check] {
        let list: [(String, Bool)] = [
            ("Bluetooth on and allowed", car.bluetooth == "On"),
            ("Adapter chosen", car.adapterName != nil),
            ("The car answered through the adapter", car.lastReady != nil),
            ("Linked to Claude live on the PC", claude.linked),
            ("Notifications allowed", notifications == "Allowed"),
            ("The car answered with the app in the background",
             journal.lines.contains { $0.contains("[background]") && $0.contains("car answered") }),
            ("Stayed linked in the background",
             journal.lines.contains { $0.contains("[background]") && $0.contains("still linked") }),
        ]
        return list.map { Check(id: $0.0, ok: $0.1) }
    }

    private var testSection: some View {
        Section {
            ForEach(checks) { c in
                Label(c.id, systemImage: c.ok ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(c.ok ? Color.green : Color.secondary)
            }
            Button(copied ? "Copied. Paste it to Claude." : "Copy the results for Claude") {
                UIPasteboard.general.string = report()
                copied = true
            }
        } header: {
            Text("Test \(ClaudeLink.version)")
        } footer: {
            Text("Connect once with the app open. Then lock the phone and put it away, and the next time you start the car, don't open the app. Claude should say hello in a notification within a minute. This journal reaches your PC by itself; Check Claude live shows it there.")
        }
    }

    private var logSection: some View {
        Section {
            ForEach(Array(journal.lines.suffix(40).reversed().enumerated()), id: \.offset) { _, line in
                Text(line).font(.system(.caption2, design: .monospaced))
            }
            if !journal.lines.isEmpty {
                Button("Clear the journal", role: .destructive) { journal.clear() }
            }
        } header: {
            Text("Journal")
        }
    }

    private func report() -> String {
        var out = ["V60 iPhone app test \(ClaudeLink.version), \(Date().formatted())", ""]
        out += checks.map { ($0.ok ? "[ok] " : "[  ] ") + $0.id }
        out += ["", "Adapter: \(car.adapterName ?? "none") · \(car.status)", "Bluetooth: \(car.bluetooth)",
                "Claude live: \(claude.state)", "Stay linked in the background: \(car.keepAliveOn ? "on" : "off")",
                "", "Journal:"]
        out += journal.lines.suffix(120)
        return out.joined(separator: "\n")
    }
}
