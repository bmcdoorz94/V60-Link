# V60 Link

A single-page OBD-II companion for a 2016 Volvo V60 T5 (works with most CAN-era cars). It talks to a Bluetooth LE ELM327-type adapter (tested design target: OBDLink CX) using Web Bluetooth.

- Health check: VIN, check-engine light, stored / pending / permanent codes per module, freeze frame, readiness monitors, emissions readiness estimate (40 CFR 85.2222 rule)
- Live data recording with CSV export (format read by the V60 Garage Data lab)
- Code clearing with safeguards (requires a saved scan, engine off, typed confirmation)
- Simulated car mode for practice without an adapter

## Where it runs
- iPhone / iPad: the free **Bluefy** browser (Safari has no Web Bluetooth)
- Android, Windows, macOS, ChromeOS: Chrome or Edge

Standard OBD-II only. It does not reach airbag/ABS/body modules, change module software, or tune the engine.
