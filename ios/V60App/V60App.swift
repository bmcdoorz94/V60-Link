import SwiftUI
import UserNotifications

@main
struct V60App: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}

final class UIState: ObservableObject {
    static let shared = UIState()
    @Published var showPanel = false
}

final class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        // Allow needs the phone unlocked; No does not.
        let allow = UNNotificationAction(identifier: "ALLOW", title: "Allow once", options: [.authenticationRequired, .destructive])
        let no = UNNotificationAction(identifier: "NO", title: "No", options: [])
        center.setNotificationCategories([UNNotificationCategory(identifier: "ASK", actions: [allow, no],
                                                                 intentIdentifiers: [], options: [])])
        if launchOptions?[.bluetoothCentrals] != nil {
            Journal.shared.add("iOS started the app in the background for the adapter")
        }
        // Creating these starts Bluetooth (with state restoration) and the link to the PC.
        _ = Car.shared
        _ = ClaudeLink.shared
        center.requestAuthorization(options: [.alert, .sound]) { _, _ in }
        return true
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .list, .sound])
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        let action = response.actionIdentifier
        let ask = response.notification.request.content.userInfo["ask"] as? String
        DispatchQueue.main.async {
            if let ask, action == "ALLOW" || action == "NO" {
                ClaudeLink.shared.answer(ask, yes: action == "ALLOW")
            } else {
                UIState.shared.showPanel = true
            }
            completionHandler()
        }
    }
}
