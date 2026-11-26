import Combine
import UIKit
import WebKit

/// The Garage page's way to the adapter inside the app (the page side is tools/gen/live_native.js).
/// postMessage({op: "status"}) → {ready, name, can}; postMessage({op: "send", cmd, timeout}) → {ok, raw | error}.
/// The app calls V60_NATIVE.onLink(true/false) when the car is ready or gone, and V60_NATIVE.onSample({v: {...}})
/// with each reading cycle while the app is on screen.
@MainActor
final class CarBridge: NSObject, WKScriptMessageHandlerWithReply {
    private weak var web: WKWebView?
    private var watch: AnyCancellable?

    func attach(_ web: WKWebView) {
        self.web = web
        watch = Car.shared.$phase
            .map { $0 == .ready }
            .removeDuplicates()
            .sink { [weak self] ready in self?.call("onLink", ready ? "true" : "false") }
        Car.shared.onSample = { [weak self] sample in
            guard UIApplication.shared.applicationState == .active,
                  let data = try? JSONSerialization.data(withJSONObject: ["v": sample]),
                  let json = String(data: data, encoding: .utf8) else { return }
            self?.call("onSample", json)
        }
    }

    private func call(_ fn: String, _ arg: String) {
        web?.evaluateJavaScript("window.V60_NATIVE && V60_NATIVE.\(fn) && V60_NATIVE.\(fn)(\(arg))", completionHandler: nil)
    }

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) async -> (Any?, String?) {
        guard let body = message.body as? [String: Any], let op = body["op"] as? String else { return (nil, "bad message") }
        let car = Car.shared
        switch op {
        case "status":
            return (["ready": car.phase == .ready, "name": car.adapterName ?? "adapter", "can": car.canBus], nil)
        case "send":
            let cmd = (body["cmd"] as? String ?? "").trimmingCharacters(in: .whitespaces)
            let timeout = min(max((body["timeout"] as? Double ?? 4000) / 1000, 0.5), 30)
            guard car.phase == .ready else { return (["ok": false, "error": "The adapter is not connected."], nil) }
            let result: Result<String, CarError> = await withCheckedContinuation { done in
                car.send(cmd, timeout: timeout) { done.resume(returning: $0) }
            }
            switch result {
            case .success(let raw): return (["ok": true, "raw": raw], nil)
            case .failure(let e): return (["ok": false, "error": e.message], nil)
            }
        default:
            return (nil, "unknown op \(op)")
        }
    }
}
