import Foundation

/// One drive's readings in Documents/drives/<yyyyMMdd-HHmmss>.jsonl, one JSON line per reading cycle:
/// {"t": <ms since 1970>, "v": {"0C": [14, 76], "0D": [52], ...}} (mode 01 PID in hex → its data bytes, undecoded).
/// Lines with "m" instead of "v" are one second of the phone's motion sensors (Motion.swift).
/// The PC decodes them (bridge/drives.js) and builds the drive report.
final class DriveFile {
    let id: String
    let url: URL
    let started: Date
    private(set) var count = 0
    private var handle: FileHandle?

    static var dir: URL {
        let d = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("drives")
        try? FileManager.default.createDirectory(at: d, withIntermediateDirectories: true)
        return d
    }

    init() {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyyMMdd-HHmmss"
        started = Date()
        id = f.string(from: started)
        url = Self.dir.appendingPathComponent(id + ".jsonl")
        FileManager.default.createFile(atPath: url.path, contents: nil)
        handle = try? FileHandle(forWritingTo: url)
    }

    func append(ms: Int, values: [String: [Int]]) {
        let row: [String: Any] = ["t": ms, "v": values]
        guard let h = handle, let data = try? JSONSerialization.data(withJSONObject: row) else { return }
        h.seekToEndOfFile()
        h.write(data)
        h.write(Data([0x0A]))
        count += 1
    }

    /// One second of the phone's motion sensors (Motion.swift): {"t": ms, "m": {...}}. Not counted as a reading.
    func appendMotion(ms: Int, values: [String: Int]) {
        let row: [String: Any] = ["t": ms, "m": values]
        guard let h = handle, let data = try? JSONSerialization.data(withJSONObject: row) else { return }
        h.seekToEndOfFile()
        h.write(data)
        h.write(Data([0x0A]))
    }

    func close() {
        try? handle?.close()
        handle = nil
    }
}
