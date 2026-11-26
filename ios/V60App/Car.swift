import CoreBluetooth
import Foundation

struct CarError: Error { let message: String }

/// The OBD adapter over Bluetooth LE, natively, so it works with the app in the background.
/// How it stays ready: the chosen adapter's id is saved, and after any drop the app asks iOS to connect to it again.
/// iOS keeps that request open indefinitely (also while the app is suspended or relaunched by iOS through state
/// restoration), so when the ignition comes on and the adapter wakes, iOS connects and wakes the app.
/// The adapter is set up as the web page does it (src/link-legacy.html initElm, warm start): ATWS, ATE0, ATL0, ATS1,
/// ATH1, ATCAF1, ATAT1, ATSP0, then 0100 to check the car answers. Everything runs on the main queue.
final class Car: NSObject, ObservableObject {
    static let shared = Car()

    enum Phase { case noBluetooth, noAdapter, waiting, connecting, noCar, ready }

    struct Found: Identifiable {
        let id: UUID
        let name: String
        let rssi: Int
        let peripheral: CBPeripheral
    }

    @Published private(set) var phase: Phase = .noAdapter
    @Published private(set) var status = "Starting Bluetooth..."
    @Published private(set) var bluetooth = "Starting"
    @Published private(set) var adapterName: String?
    @Published private(set) var found: [Found] = []
    @Published private(set) var scanning = false
    @Published private(set) var lastReady: Date?
    @Published private(set) var keepAliveOn: Bool
    private(set) var canBus = true

    /// Called when the car is ready to talk (true) and when the link drops (false). Once per connection.
    var onReady: ((Bool) -> Void)?
    /// Every adapter line, for the PC's log: direction (">" sent, "<" reply, ".." note, "!!" problem) and text.
    var onLine: ((String, String) -> Void)?

    private var central: CBCentralManager!
    private var peripheral: CBPeripheral?
    private var rx: CBCharacteristic?
    private var tx: CBCharacteristic?
    private var servicesLeft = 0
    private var buffer = ""
    private var announced = false
    private var setupRun = 0

    private struct Job {
        let cmd: String
        let timeout: TimeInterval
        let quiet: Bool
        let done: (Result<String, CarError>) -> Void
    }
    private var jobs: [Job] = []
    private var current: Job?
    private var timer: DispatchWorkItem?
    private var keepAlive: DispatchWorkItem?
    private var supported = Set<Int>()
    private var fastList: [Int] = []
    private var slowList: [Int] = []
    private var slowAt = 0
    private var cycles = 0
    private var drive: DriveFile?

    /// Set while Claude has other modules addressed (ATSH...): the recorder waits until the adapter is set up again.
    var holdRecording = false
    /// Each reading cycle's values (PID in hex → data bytes), for the page's gauges.
    var onSample: (([String: [Int]]) -> Void)?
    /// A finished drive's id, for upload to the PC.
    var onDriveDone: ((String) -> Void)?

    private static let idKey = "adapterId", nameKey = "adapterName", keepKey = "keepAlive"
    /// Serial channels: service, notify characteristic, write characteristic (the same list as the web page).
    /// The OBDLink CX is FFF0/FFF1/FFF2; its FEF5 service is firmware update only and is never picked.
    private static let uarts: [(String, String, String)] = [
        ("FFF0", "FFF1", "FFF2"), ("FFE0", "FFE1", "FFE1"), ("18F0", "2AF0", "2AF1"), ("FFE5", "FFE9", "FFE4"),
        ("E7810A71-73AE-499D-8C15-FAA9AEF0C3F2", "BEF8D6C9-9C21-4C9E-B632-BD58C1009F9F", "BEF8D6C9-9C21-4C9E-B632-BD58C1009F9F"),
    ]
    private static let never: Set<String> = ["FEF5", "180A", "1800", "1801", "180F", "1805", "FE59"]

    private var savedId: UUID? {
        get { UserDefaults.standard.string(forKey: Self.idKey).flatMap { UUID(uuidString: $0) } }
        set { UserDefaults.standard.set(newValue?.uuidString, forKey: Self.idKey) }
    }

    override private init() {
        keepAliveOn = UserDefaults.standard.object(forKey: Self.keepKey) as? Bool ?? true
        super.init()
        adapterName = UserDefaults.standard.string(forKey: Self.nameKey)
        central = CBCentralManager(delegate: self, queue: .main,
                                   options: [CBCentralManagerOptionRestoreIdentifierKey: "v60-car"])
    }

    // MARK: choosing the adapter

    func scan() {
        guard central.state == .poweredOn else { return }
        found = []
        // An adapter another app (Bluefy) still holds does not advertise; list it from the system instead.
        let held = central.retrieveConnectedPeripherals(withServices: Self.uarts.map { CBUUID(string: $0.0) })
        for p in held { found.append(Found(id: p.identifier, name: p.name ?? "Adapter", rssi: 0, peripheral: p)) }
        scanning = true
        central.scanForPeripherals(withServices: nil, options: nil)
        DispatchQueue.main.asyncAfter(deadline: .now() + 15) { [weak self] in self?.stopScan() }
    }

    func stopScan() {
        if scanning { central.stopScan() }
        scanning = false
    }

    func choose(_ f: Found) {
        stopScan()
        if let old = peripheral, old.identifier != f.id { central.cancelPeripheralConnection(old) }
        savedId = f.id
        adapterName = f.name
        UserDefaults.standard.set(f.name, forKey: Self.nameKey)
        peripheral = f.peripheral
        f.peripheral.delegate = self
        note("chose \(f.name)")
        Journal.shared.add("chose the adapter \(f.name)")
        connectSaved()
    }

    func forget() {
        if let p = peripheral { central.cancelPeripheralConnection(p) }
        dropLink()
        peripheral = nil
        savedId = nil
        adapterName = nil
        UserDefaults.standard.removeObject(forKey: Self.nameKey)
        phase = .noAdapter
        status = "Choose your adapter below."
    }

    func retryNow() {
        if phase == .noCar { checkCar(tries: 0, run: setupRun) } else { connectSaved() }
    }

    func setKeepAlive(_ on: Bool) {
        keepAliveOn = on
        UserDefaults.standard.set(on, forKey: Self.keepKey)
        if on { scheduleKeepAlive() } else { keepAlive?.cancel() }
    }

    // MARK: talking to the adapter

    /// One command; replies are the adapter's raw text up to its ">" prompt, as the web page passes them on.
    func send(_ cmd: String, timeout: TimeInterval = 4, quiet: Bool = false,
              done: @escaping (Result<String, CarError>) -> Void) {
        jobs.append(Job(cmd: cmd, timeout: timeout, quiet: quiet, done: done))
        pump()
    }

    /// Sets the adapter back up the way the app expects (after Claude changed headers or protocol).
    func restore(done: @escaping (Bool, String) -> Void) {
        guard tx != nil else { done(false, "The adapter is not connected."); return }
        note("setting the adapter back up (warm start)")
        setUp(done: done)
    }

    private func pump() {
        guard current == nil, !jobs.isEmpty else { return }
        guard let p = peripheral, p.state == .connected, let c = tx else {
            let waiting = jobs
            jobs = []
            waiting.forEach { $0.done(.failure(CarError(message: "The adapter is not connected."))) }
            return
        }
        let job = jobs.removeFirst()
        current = job
        buffer = ""
        if !job.quiet { line(">", job.cmd) }
        let t = DispatchWorkItem { [weak self] in self?.finish(.failure(CarError(message: "timeout"))) }
        timer = t
        DispatchQueue.main.asyncAfter(deadline: .now() + job.timeout, execute: t)
        let type: CBCharacteristicWriteType = c.properties.contains(.write) ? .withResponse : .withoutResponse
        let data = Data((job.cmd + "\r").utf8)
        var i = 0
        while i < data.count {
            let j = min(i + 20, data.count)
            p.writeValue(data.subdata(in: i..<j), for: c, type: type)
            i = j
        }
    }

    private func finish(_ r: Result<String, CarError>) {
        timer?.cancel()
        timer = nil
        guard let job = current else { return }
        current = nil
        if !job.quiet {
            switch r {
            case .success(let s): line("<", s.trimmingCharacters(in: .whitespacesAndNewlines))
            case .failure(let e): line("!!", "\(job.cmd): \(e.message)")
            }
        }
        job.done(r)
        pump()
    }

    // MARK: connection life

    private func connectSaved() {
        guard central.state == .poweredOn else { return }
        guard let id = savedId else {
            phase = .noAdapter
            status = "Choose your adapter below."
            return
        }
        if peripheral == nil || peripheral?.identifier != id {
            peripheral = central.retrievePeripherals(withIdentifiers: [id]).first
        }
        guard let p = peripheral else {
            phase = .noAdapter
            status = "This phone no longer knows the adapter. Choose it again below."
            return
        }
        p.delegate = self
        switch p.state {
        case .connected:
            if tx == nil { discover(p) }
        case .connecting:
            break
        default:
            phase = .waiting
            status = "Waiting for the adapter. It wakes when the ignition is on."
            central.connect(p, options: nil)
        }
    }

    private func discover(_ p: CBPeripheral) {
        phase = .connecting
        status = "Connected. Finding the adapter's data channel..."
        p.discoverServices(nil)
    }

    private func dropLink() {
        keepAlive?.cancel()
        endDrive()
        rx = nil
        tx = nil
        timer?.cancel()
        timer = nil
        let waiting = (current.map { [$0] } ?? []) + jobs
        current = nil
        jobs = []
        waiting.forEach { $0.done(.failure(CarError(message: "The adapter is not connected."))) }
        if announced {
            announced = false
            onReady?(false)
        }
    }

    private func setUp(done: ((Bool, String) -> Void)? = nil) {
        setupRun += 1
        let run = setupRun
        if phase != .ready { phase = .connecting; status = "Talking to the adapter..." }
        let steps: [(String, TimeInterval)] = [("ATWS", 6), ("ATE0", 4), ("ATL0", 4), ("ATS1", 4), ("ATH1", 4),
                                               ("ATCAF1", 4), ("ATAT1", 4), ("ATSP0", 4)]
        runSteps(steps[...]) { [weak self] in self?.checkCar(tries: 0, run: run, done: done) }
    }

    private func runSteps(_ steps: ArraySlice<(String, TimeInterval)>, then: @escaping () -> Void) {
        guard let first = steps.first else { then(); return }
        send(first.0, timeout: first.1) { [weak self] _ in self?.runSteps(steps.dropFirst(), then: then) }
    }

    private func checkCar(tries: Int, run: Int, done: ((Bool, String) -> Void)? = nil) {
        guard run == setupRun, tx != nil else { return }
        send("0100", timeout: 12) { [weak self] r in
            guard let self, run == self.setupRun else { return }
            if case .success(let s) = r, s.replacingOccurrences(of: " ", with: "").uppercased().contains("4100") {
                self.send("ATDPN") { [weak self] r2 in
                    guard let self else { return }
                    if case .success(let p) = r2 {
                        let digits = p.uppercased().filter { "0123456789ABC".contains($0) }
                        let n = Int(digits.hasPrefix("A") ? String(digits.dropFirst()) : digits, radix: 16)
                        self.canBus = n.map { $0 >= 6 } ?? true
                    }
                    self.phase = .ready
                    self.lastReady = Date()
                    self.status = "Connected to \(self.adapterName ?? "the adapter")" + (self.canBus ? " (CAN)" : "")
                    if !self.announced {
                        self.announced = true
                        Journal.shared.add("car answered through \(self.adapterName ?? "the adapter")")
                        self.onReady?(true)
                    }
                    self.startRecording(first: s)
                    done?(true, "adapter set up again; protocol " + (self.canBus ? "CAN" : "not CAN"))
                }
            } else {
                self.phase = .noCar
                self.status = "The adapter is awake but the car is not answering. Turn the ignition on."
                if tries < 6 {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 10) { [weak self] in
                        guard let self, self.phase == .noCar else { return }
                        self.checkCar(tries: tries + 1, run: run, done: done)
                    }
                } else {
                    done?(false, "The car did not answer.")
                }
            }
        }
    }

    // MARK: recording the drive

    /// Read every cycle (about once a second): RPM, speed, load, throttle, both fuel trims, air flow, manifold pressure.
    private static let fastWanted = [0x0C, 0x0D, 0x04, 0x11, 0x06, 0x07, 0x10, 0x0B]
    /// Two of these per cycle, in turn: coolant, intake air, timing, module voltage, oil, outside air, fuel level,
    /// barometric pressure, commanded air-fuel ratio, O2 sensors, run time, distance with the light on, warm-ups and
    /// distance since codes were cleared, time with the light on and since clearing. Only those the car supports.
    private static let slowWanted = [0x05, 0x0F, 0x0E, 0x42, 0x5C, 0x46, 0x2F, 0x33, 0x44, 0x14, 0x15, 0x24, 0x34,
                                     0x1F, 0x21, 0x30, 0x31, 0x4D, 0x4E]

    /// Learn which readings the car supports (mode 01 PIDs 00, 20, 40), then record until the adapter drops.
    private func startRecording(first: String) {
        supported = Self.bitmap(first, base: 0x00)
        readMoreSupported(base: 0x20) { [weak self] in
            guard let self else { return }
            self.fastList = Self.fastWanted.filter { self.supported.contains($0) }
            self.slowList = Self.slowWanted.filter { self.supported.contains($0) }
            self.note("recording " + (self.fastList + self.slowList).map { String(format: "%02X", $0) }.joined(separator: " "))
            if self.drive == nil {
                let d = DriveFile()
                self.drive = d
                Journal.shared.add("recording drive \(d.id)")
            }
            self.scheduleKeepAlive(after: 0.2)
        }
    }

    private func readMoreSupported(base: Int, then: @escaping () -> Void) {
        guard base <= 0x40, supported.contains(base) else { then(); return }
        send(String(format: "01%02X", base), timeout: 4, quiet: true) { [weak self] r in
            guard let self else { return }
            if case .success(let s) = r { self.supported.formUnion(Self.bitmap(s, base: base)) }
            self.readMoreSupported(base: base + 0x20, then: then)
        }
    }

    /// The PIDs a "supported PIDs" reply lists (SAE J1979: 4 bytes, one bit per PID, most significant first).
    static func bitmap(_ raw: String, base: Int) -> Set<Int> {
        guard let d = payload(raw, pid: base), d.count >= 4 else { return [] }
        var out = Set<Int>()
        for i in 0..<32 where d[i >> 3] & (0x80 >> (i & 7)) != 0 { out.insert(base + i + 1) }
        return out
    }

    /// The data bytes of a mode 01 reply for one PID (headers on, spaces on: "7E8 04 41 0C 0E 4C"),
    /// preferring the engine computer (7E8) when several modules answer.
    static func payload(_ raw: String, pid: Int) -> [Int]? {
        var best: [Int]?
        for row in raw.split(whereSeparator: { $0 == "\r" || $0 == "\n" }) {
            let t = row.split(separator: " ").map(String.init)
            guard let i = t.firstIndex(of: "41"), i + 1 < t.count, Int(t[i + 1], radix: 16) == pid else { continue }
            let data = t[(i + 2)...].compactMap { Int($0, radix: 16) }
            if t.first == "7E8" { return data }
            if best == nil { best = data }
        }
        return best
    }

    /// One reading cycle, again after a short pause. Each reply is a Bluetooth event and iOS lets the app run a few
    /// seconds after each one, so the cycle also keeps the app (and Claude's link) alive in the background.
    private func scheduleKeepAlive(after delay: TimeInterval = 1) {
        keepAlive?.cancel()
        guard keepAliveOn, phase == .ready else { return }
        let w = DispatchWorkItem { [weak self] in self?.cycle() }
        keepAlive = w
        DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: w)
    }

    private func cycle() {
        guard phase == .ready else { return }
        // Claude (other modules addressed) or the page is using the adapter: wait for the queue to empty.
        if holdRecording || current != nil || !jobs.isEmpty { scheduleKeepAlive(after: 0.5); return }
        var list = fastList
        if !slowList.isEmpty {
            for _ in 0..<min(2, slowList.count) { list.append(slowList[slowAt % slowList.count]); slowAt += 1 }
        }
        readList(list[...], into: [:]) { [weak self] sample in self?.finishCycle(sample) }
    }

    private func readList(_ rest: ArraySlice<Int>, into sample: [String: [Int]],
                          done: @escaping ([String: [Int]]) -> Void) {
        guard let pid = rest.first, phase == .ready, !holdRecording else { done(sample); return }
        send(String(format: "01%02X", pid), timeout: 2, quiet: true) { [weak self] r in
            guard let self else { return }
            var next = sample
            if case .success(let s) = r, let d = Car.payload(s, pid: pid), !d.isEmpty { next[String(format: "%02X", pid)] = d }
            self.readList(rest.dropFirst(), into: next, done: done)
        }
    }

    private func finishCycle(_ sample: [String: [Int]]) {
        cycles += 1
        if !sample.isEmpty {
            drive?.append(ms: Int(Date().timeIntervalSince1970 * 1000), values: sample)
            onSample?(sample)
        }
        if cycles % 60 == 1 { // about once a minute; check.js looks for "still linked" in the background
            let v = sample["42"].flatMap { $0.count >= 2 ? Double($0[0] * 256 + $0[1]) / 1000 : nil }
            Journal.shared.add("still linked, recording" + (v.map { String(format: ", battery %.1fV", $0) } ?? "")
                               + " (\(drive?.count ?? 0) readings so far)")
        }
        Awake.extend()
        if sample.isEmpty {
            // Nothing to read (no supported PIDs, or the car went quiet): a voltage read keeps the link busy.
            send("ATRV", timeout: 3, quiet: true) { [weak self] _ in self?.scheduleKeepAlive(after: 2) }
        } else {
            scheduleKeepAlive(after: 0.4)
        }
    }

    /// The drive ends when the adapter drops. Drives under 30 readings (under about half a minute) are not kept.
    private func endDrive() {
        guard let d = drive else { return }
        drive = nil
        d.close()
        if d.count < 30 {
            try? FileManager.default.removeItem(at: d.url)
            return
        }
        var pending = pendingDrives()
        pending.append(d.id)
        UserDefaults.standard.set(pending, forKey: Self.pendingKey)
        Journal.shared.add("drive \(d.id) saved: \(d.count) readings over \(Int(Date().timeIntervalSince(d.started) / 60)) min")
        onDriveDone?(d.id)
    }

    private static let pendingKey = "pendingDrives"

    /// Drives recorded on the phone that the PC has not confirmed yet.
    func pendingDrives() -> [String] { UserDefaults.standard.stringArray(forKey: Self.pendingKey) ?? [] }

    func driveLines(_ id: String) -> [String] {
        let url = DriveFile.dir.appendingPathComponent(id + ".jsonl")
        guard let text = try? String(contentsOf: url, encoding: .utf8) else { return [] }
        return text.split(separator: "\n").map(String.init)
    }

    /// The PC has the drive: stop offering it, and keep only the newest 30 drive files on the phone.
    func markUploaded(_ id: String) {
        UserDefaults.standard.set(pendingDrives().filter { $0 != id }, forKey: Self.pendingKey)
        let files = (try? FileManager.default.contentsOfDirectory(at: DriveFile.dir, includingPropertiesForKeys: nil)) ?? []
        for old in files.sorted(by: { $0.lastPathComponent > $1.lastPathComponent }).dropFirst(30) {
            try? FileManager.default.removeItem(at: old)
        }
    }

    private func line(_ dir: String, _ text: String) { onLine?(dir, text) }
    private func note(_ text: String) { line("..", text) }
}

extension Car: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        switch central.state {
        case .poweredOn:
            bluetooth = "On"
            connectSaved()
        case .poweredOff:
            bluetooth = "Off"
            phase = .noBluetooth
            status = "Bluetooth is off. Turn it on in Control Center."
        case .unauthorized:
            bluetooth = "Not allowed"
            phase = .noBluetooth
            status = "Bluetooth is not allowed for this app: Settings, V60, Bluetooth."
        case .unsupported:
            bluetooth = "Not available"
            phase = .noBluetooth
            status = "This device has no Bluetooth LE."
        default:
            bluetooth = "Starting"
        }
    }

    /// iOS relaunched the app in the background for the adapter: pick up the peripheral it kept for us.
    func centralManager(_ central: CBCentralManager, willRestoreState dict: [String: Any]) {
        let kept = dict[CBCentralManagerRestoredStatePeripheralsKey] as? [CBPeripheral] ?? []
        Journal.shared.add("iOS restored the Bluetooth link (\(kept.count) device)")
        if let id = savedId, let p = kept.first(where: { $0.identifier == id }) {
            peripheral = p
            p.delegate = self
        }
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral,
                        advertisementData: [String: Any], rssi RSSI: NSNumber) {
        let name = peripheral.name ?? advertisementData[CBAdvertisementDataLocalNameKey] as? String
        guard let name, !name.isEmpty, !found.contains(where: { $0.id == peripheral.identifier }) else { return }
        found.append(Found(id: peripheral.identifier, name: name, rssi: RSSI.intValue, peripheral: peripheral))
        found.sort { $0.rssi > $1.rssi }
    }

    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        guard peripheral.identifier == savedId else { return }
        Awake.extend()
        Journal.shared.add("adapter connected over Bluetooth")
        note("Bluetooth connected")
        discover(peripheral)
    }

    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        guard peripheral.identifier == savedId else { return }
        note("could not connect: \(error?.localizedDescription ?? "unknown")")
        status = "Could not connect. Trying again..."
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) { [weak self] in self?.connectSaved() }
    }

    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        guard peripheral.identifier == savedId else { return }
        let wasReady = phase == .ready
        Journal.shared.add("adapter dropped" + (error.map { ": \($0.localizedDescription)" } ?? ""))
        note("the adapter dropped the Bluetooth link")
        dropLink()
        if wasReady { Awake.extend() }
        // Ask iOS to reconnect whenever the adapter is back (the next time the car starts).
        phase = .waiting
        status = "Waiting for the adapter. It wakes when the ignition is on."
        central.connect(peripheral, options: nil)
    }
}

extension Car: CBPeripheralDelegate {
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        let services = peripheral.services ?? []
        servicesLeft = services.count
        if services.isEmpty { status = "Connected, but the adapter shows no services."; return }
        for s in services { peripheral.discoverCharacteristics(nil, for: s) }
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        servicesLeft -= 1
        if servicesLeft == 0 { pickChannel(peripheral) }
    }

    private func pickChannel(_ p: CBPeripheral) {
        let services = p.services ?? []
        func id(_ u: CBUUID) -> String { u.uuidString.uppercased() }
        func canNotify(_ c: CBCharacteristic) -> Bool { c.properties.contains(.notify) || c.properties.contains(.indicate) }
        func canWrite(_ c: CBCharacteristic) -> Bool { c.properties.contains(.write) || c.properties.contains(.writeWithoutResponse) }
        for s in services {
            let list = (s.characteristics ?? []).map { c -> String in
                id(c.uuid) + "[" + (canNotify(c) ? "N" : "") + (canWrite(c) ? "W" : "") + "]"
            }
            note("service \(id(s.uuid)): " + list.joined(separator: " "))
        }
        var n: CBCharacteristic?
        var w: CBCharacteristic?
        for u in Self.uarts where n == nil {
            guard let s = services.first(where: { id($0.uuid) == u.0 }) else { continue }
            let cs = s.characteristics ?? []
            if let a = cs.first(where: { id($0.uuid) == u.1 && canNotify($0) }),
               let b = cs.first(where: { id($0.uuid) == u.2 && canWrite($0) }) {
                n = a
                w = b
            }
        }
        if n == nil {
            for s in services where n == nil && !Self.never.contains(id(s.uuid)) {
                let cs = s.characteristics ?? []
                if let a = cs.first(where: canNotify), let b = cs.first(where: canWrite) {
                    n = a
                    w = b
                }
            }
        }
        guard let rxc = n, let txc = w else {
            status = "Connected, but this device has no serial data channel. It may not be an OBD adapter."
            return
        }
        rx = rxc
        tx = txc
        note("using \(id(rxc.service?.uuid ?? CBUUID(string: "0000"))): notify \(id(rxc.uuid)), write \(id(txc.uuid))")
        p.setNotifyValue(true, for: rxc)
    }

    func peripheral(_ peripheral: CBPeripheral, didUpdateNotificationStateFor characteristic: CBCharacteristic,
                    error: Error?) {
        guard characteristic == rx else { return }
        if let error {
            status = "The adapter refused notifications: \(error.localizedDescription)"
            return
        }
        if characteristic.isNotifying { setUp() }
    }

    func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        guard characteristic == rx, let d = characteristic.value else { return }
        buffer += String(decoding: d, as: UTF8.self)
        if let r = buffer.range(of: ">") {
            let reply = String(buffer[..<r.lowerBound])
            buffer = String(buffer[r.upperBound...])
            finish(.success(reply))
        }
    }
}

/// Which adapter commands can change the car: the same rule as the web page and the PC bridge
/// (tools/gen/live_claude.js carWrite, bridge/lib.js). Adapter settings never reach the car; reads are OBD modes
/// 01-0A except 04 (clear) and 08 (control), UDS 22 / 19 / 3E / default session, KWP reads and Volvo D2 reads.
enum CarRules {
    static func isWrite(_ command: String) -> Bool {
        let s = command.uppercased().filter { !$0.isWhitespace }
        if s.isEmpty { return false }
        if s.hasPrefix("STPX") {
            guard let r = s.range(of: "D:") else { return true }
            let hex = String(s[r.upperBound...].prefix { $0.isHexDigit })
            return hex.isEmpty ? true : payloadWrite(hex)
        }
        if s.hasPrefix("AT") || s.hasPrefix("ST") { return false }
        if !s.allSatisfy({ $0.isHexDigit }) || s.count % 2 != 0 { return true }
        return payloadWrite(s)
    }

    private static func payloadWrite(_ hex: String) -> Bool {
        var b: [Int] = []
        var i = hex.startIndex
        while let j = hex.index(i, offsetBy: 2, limitedBy: hex.endIndex), i < hex.endIndex {
            b.append(Int(hex[i..<j], radix: 16) ?? 0)
            i = j
        }
        guard let sid = b.first else { return true }
        if (0xC8...0xCF).contains(sid), b.count >= 3 { return ![0xA3, 0xA5, 0xA6, 0xAE, 0xB9].contains(b[2]) }
        if sid == 0x10 { return !(b.count > 1 && (b[1] == 0x01 || b[1] == 0x81)) }
        return ![0x01, 0x02, 0x03, 0x05, 0x06, 0x07, 0x09, 0x0A, 0x12, 0x17, 0x18, 0x19, 0x1A, 0x21, 0x22, 0x3E].contains(sid)
    }

    /// Settings that change how the app's own requests are addressed; after these the adapter is set up again.
    static func dirties(_ command: String) -> Bool {
        let s = command.uppercased().filter { !$0.isWhitespace }
        return ["ATSH", "ATCRA", "ATCF", "ATCM", "ATSP", "ATTP", "ATCP", "ATCAF", "ATH", "ATFC", "ATAT", "ATST",
                "STP", "STCSEG", "STFAC", "STFAP", "STFBA"].contains { s.hasPrefix($0) }
    }
}
