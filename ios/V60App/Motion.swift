import CoreMotion
import Foundation

/// The phone's motion sensors during a recorded drive (2026-11-27), for problems no computer in the car reports:
/// vibration (tire balance, a bent wheel, a worn bearing, brake rotors), braking and cornering. Samples at 100 Hz and
/// writes one summary a second into the drive file as {"t": ms, "m": {...}} (bridge/drives.js analyses it):
///   v / h   vertical / horizontal vibration, RMS in milli-g (steady push removed)
///   vf / va strongest vertical vibration between 4 and 40 Hz: frequency (0.1 Hz) and amplitude (milli-g)
///   hf / ha the same for horizontal vibration
///   a1 a2 a3 steady push in milli-g: horizontal axis 1, horizontal axis 2, vertical (braking, accelerating, cornering)
///   yr      turning rate about the vertical, 0.1 degree per second
///   mv      how far the phone tilted this second, 0.1 degree (the phone moved: the PC ignores the second)
/// Horizontal axes are fixed to the phone, flattened to level: while the phone stays put they are fixed to the car,
/// and the PC works out which one points forward from the car's own speed changes.
final class Motion {
    static let shared = Motion()
    private let mm = CMMotionManager()
    private let queue: OperationQueue = { let q = OperationQueue(); q.maxConcurrentOperationCount = 1; q.name = "motion"; return q }()
    private var sink: ((Int, [String: Int]) -> Void)?
    private var buf: [(t: Double, v: Double, h1: Double, h2: Double, yaw: Double, g: (Double, Double, Double))] = []
    private(set) var seconds = 0
    private(set) var moved = 0

    var available: Bool { mm.isDeviceMotionAvailable }

    /// sink(ms, summary) is called on the main queue once a second.
    func start(_ sink: @escaping (Int, [String: Int]) -> Void) {
        guard mm.isDeviceMotionAvailable, !mm.isDeviceMotionActive else { return }
        self.sink = sink
        seconds = 0; moved = 0; buf = []
        mm.deviceMotionUpdateInterval = 1.0 / 100
        mm.startDeviceMotionUpdates(to: queue) { [weak self] m, _ in
            guard let self, let m else { return }
            self.take(m)
        }
    }

    func stop() {
        guard mm.isDeviceMotionActive else { return }
        mm.stopDeviceMotionUpdates()
        queue.addOperation { [weak self] in self?.buf = [] }
        sink = nil
    }

    private func take(_ m: CMDeviceMotion) {
        let g = (m.gravity.x, m.gravity.y, m.gravity.z)
        let gl = max(sqrt(g.0 * g.0 + g.1 * g.1 + g.2 * g.2), 1e-6)
        let u = (g.0 / gl, g.1 / gl, g.2 / gl) // unit "down"
        let a = (m.userAcceleration.x, m.userAcceleration.y, m.userAcceleration.z)
        let v = a.0 * u.0 + a.1 * u.1 + a.2 * u.2
        // a level basis fixed to the phone: its x axis (or y, if x points nearly straight down) flattened, then down × that
        var e1 = abs(u.0) < 0.9 ? (1 - u.0 * u.0, -u.0 * u.1, -u.0 * u.2) : (-u.1 * u.0, 1 - u.1 * u.1, -u.1 * u.2)
        let n1 = max(sqrt(e1.0 * e1.0 + e1.1 * e1.1 + e1.2 * e1.2), 1e-6)
        e1 = (e1.0 / n1, e1.1 / n1, e1.2 / n1)
        let e2 = (u.1 * e1.2 - u.2 * e1.1, u.2 * e1.0 - u.0 * e1.2, u.0 * e1.1 - u.1 * e1.0)
        let h1 = a.0 * e1.0 + a.1 * e1.1 + a.2 * e1.2
        let h2 = a.0 * e2.0 + a.1 * e2.1 + a.2 * e2.2
        let r = m.rotationRate
        let yaw = -(r.x * u.0 + r.y * u.1 + r.z * u.2) // radians/s about "up"
        buf.append((m.timestamp, v, h1, h2, yaw, u))
        if let first = buf.first, m.timestamp - first.t >= 1.0 { summarize() }
    }

    private func summarize() {
        let b = buf; buf = []
        guard b.count >= 40, let t0 = b.first?.t, let t1 = b.last?.t, t1 > t0 else { return }
        let span = t1 - t0
        func mean(_ x: [Double]) -> Double { x.reduce(0, +) / Double(x.count) }
        let vs = b.map { $0.v }, h1 = b.map { $0.h1 }, h2 = b.map { $0.h2 }
        let mv = mean(vs), m1 = mean(h1), m2 = mean(h2)
        let vd = vs.map { $0 - mv }, d1 = h1.map { $0 - m1 }, d2 = h2.map { $0 - m2 }
        func rms(_ x: [Double]) -> Double { sqrt(x.reduce(0) { $0 + $1 * $1 } / Double(x.count)) }
        let vr = rms(vd), hr = sqrt(rms(d1) * rms(d1) + rms(d2) * rms(d2))
        // strongest frequency 4-40 Hz (Hann window, plain DFT: ~37 bins × 100 samples, cheap)
        let n = b.count
        let w = (0..<n).map { 0.5 - 0.5 * cos(2 * Double.pi * Double($0) / Double(n - 1)) }
        func peak(_ series: [[Double]]) -> (Double, Double) {
            var best = (0.0, 0.0)
            let kLo = max(1, Int(ceil(4 * span))), kHi = min(n / 2 - 1, Int(floor(40 * span)))
            guard kLo <= kHi else { return best }
            for k in kLo...kHi {
                var p = 0.0
                for s in series {
                    var re = 0.0, im = 0.0
                    let step = 2 * Double.pi * Double(k) / Double(n)
                    for i in 0..<n { let x = s[i] * w[i]; re += x * cos(step * Double(i)); im -= x * sin(step * Double(i)) }
                    p += re * re + im * im
                }
                let amp = 2 * sqrt(p) / (Double(n) * 0.5) // Hann window gain 0.5
                if amp > best.1 { best = (Double(k) / span, amp) }
            }
            return best
        }
        let pv = peak([vd]), ph = peak([d1, d2])
        // how far "down" swung this second: the phone moved (picked up, slid) and the second is not usable
        let ga = b.first!.g, gb = b.last!.g
        let dot = max(-1, min(1, ga.0 * gb.0 + ga.1 * gb.1 + ga.2 * gb.2))
        let tilt = acos(dot) * 180 / Double.pi
        let yr = mean(b.map { $0.yaw }) * 180 / Double.pi
        seconds += 1
        if tilt > 3 { moved += 1 }
        let mg = { (x: Double) in Int((x * 1000).rounded()) }
        let row: [String: Int] = ["v": mg(vr), "h": mg(hr), "vf": Int((pv.0 * 10).rounded()), "va": mg(pv.1), "hf": Int((ph.0 * 10).rounded()),
                                  "ha": mg(ph.1), "a1": mg(m1), "a2": mg(m2), "a3": mg(mv), "yr": Int((yr * 10).rounded()), "mv": Int((tilt * 10).rounded())]
        let ms = Int(Date().timeIntervalSince1970 * 1000)
        DispatchQueue.main.async { [weak self] in self?.sink?(ms, row) }
    }
}
