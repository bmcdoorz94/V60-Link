' Starts Claude live's always-on service (run.js keeps service.js running) with no window.
' The Startup folder and the desktop "Claude live" shortcut run this. run.js exits at once if it is already running.
Set sh = CreateObject("WScript.Shell")
dir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = dir
node = "node"
If CreateObject("Scripting.FileSystemObject").FileExists("C:\Program Files\nodejs\node.exe") Then node = """C:\Program Files\nodejs\node.exe"""
sh.Run node & " """ & dir & "\run.js""", 0, False
