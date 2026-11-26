import Foundation
import UIKit

/// What happened, with whether the app was on screen or in the background at the time.
/// Kept in a file so it survives iOS ending and relaunching the app; the test panel copies it for Claude.
final class Journal: ObservableObject {
    static let shared = Journal()

    @Published private(set) var lines: [String] = []
    /// Each new line, so the Claude live link can send it to the PC's log (check.js and Claude read it there).
    var onAdd: ((String) -> Void)?
    private let file: URL
    private let stamp: DateFormatter

    private init() {
        file = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("journal.txt")
        stamp = DateFormatter()
        stamp.dateFormat = "MMM d HH:mm:ss"
        if let text = try? String(contentsOf: file, encoding: .utf8) {
            lines = Array(text.split(separator: "\n").map(String.init).suffix(400))
        }
    }

    func add(_ text: String) {
        let place: String
        switch UIApplication.shared.applicationState {
        case .active: place = "app open"
        case .background: place = "background"
        default: place = "opening"
        }
        let line = "\(stamp.string(from: Date())) [\(place)] \(text)"
        lines.append(line)
        if lines.count > 400 { lines.removeFirst(lines.count - 400) }
        try? lines.joined(separator: "\n").write(to: file, atomically: true, encoding: .utf8)
        onAdd?(line)
    }

    func clear() {
        lines = []
        try? FileManager.default.removeItem(at: file)
    }
}

/// Asks iOS for up to ~30 s more running time in the background after car or Claude activity,
/// so Claude's first look at the car can finish before iOS suspends the app.
enum Awake {
    private static var task: UIBackgroundTaskIdentifier = .invalid
    private static var ending: DispatchWorkItem?

    static func extend() {
        if task == .invalid {
            task = UIApplication.shared.beginBackgroundTask(withName: "V60 car link") { end() }
        }
        ending?.cancel()
        let w = DispatchWorkItem { end() }
        ending = w
        DispatchQueue.main.asyncAfter(deadline: .now() + 25, execute: w)
    }

    static func end() {
        ending?.cancel()
        ending = nil
        if task != .invalid {
            UIApplication.shared.endBackgroundTask(task)
            task = .invalid
        }
    }
}
