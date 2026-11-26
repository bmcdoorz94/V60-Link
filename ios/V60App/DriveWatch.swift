import Foundation

/// Watches each reading cycle for things worth telling Kyle at once, each at most once per drive:
/// - coolant at 230 °F (110 °C) or more (the Live link gauge's red zone; re-armed once it falls below 220 °F)
/// - charging voltage under 12.6 V or over 15.2 V for a minute with the engine running (generic charging-system
///   range, not a Volvo figure; the module-voltage reading, PID 42)
/// - a new stored trouble code, or the check-engine light coming on, compared with the drive's first report (PID 01)
/// Readings are raw mode 01 bytes keyed by PID in hex, as the recorder takes them.
struct DriveWatch {
    private var hotSaid = false
    private var lowSince: Date?
    private var highSince: Date?
    private var lowSaid = false
    private var highSaid = false
    private var firstCodes: Int?
    private var firstMil: Bool?
    private var codesSaid = false
    private var milSaid = false
    private var rpm: Double = 0

    mutating func check(_ v: [String: [Int]], now: Date = Date(), alert: (String, String) -> Void) {
        if let b = v["0C"], b.count >= 2 { rpm = Double(b[0] * 256 + b[1]) / 4 }
        if let b = v["05"], let c = b.first {
            let f = Double(c - 40) * 1.8 + 32
            if f >= 230, !hotSaid {
                hotSaid = true
                alert("coolant", String(format: "Coolant is at %.0f °F, hotter than usual. Watch the temperature gauge; if it keeps climbing, pull over safely and switch off.", f))
            } else if f < 220 { hotSaid = false }
        }
        if let b = v["42"], b.count >= 2, rpm > 600 {
            let volts = Double(b[0] * 256 + b[1]) / 1000
            if volts < 12.6 { lowSince = lowSince ?? now } else { lowSince = nil }
            if volts > 15.2 { highSince = highSince ?? now } else { highSince = nil }
            if let t = lowSince, now.timeIntervalSince(t) >= 60, !lowSaid {
                lowSaid = true
                alert("charging", String(format: "Battery voltage has been %.1f V for a minute with the engine running. The alternator may not be charging.", volts))
            }
            if let t = highSince, now.timeIntervalSince(t) >= 60, !highSaid {
                highSaid = true
                alert("charging", String(format: "Battery voltage has been %.1f V for a minute, higher than normal charging.", volts))
            }
        }
        if let b = v["01"], let a = b.first {
            let mil = a & 0x80 != 0, codes = a & 0x7F
            if firstCodes == nil { firstCodes = codes; firstMil = mil; return }
            if let f = firstCodes, codes > f, !codesSaid {
                codesSaid = true
                alert("code", "The engine computer stored a new trouble code (\(codes) now, \(f) at the start of the drive). Claude will read it when the car is parked.")
            }
            if mil, firstMil == false, !milSaid {
                milSaid = true
                alert("mil", "The check-engine light just came on. If it is flashing, ease off and drive gently; a flashing light means a misfire that can damage the catalytic converter.")
            }
        }
    }
}
