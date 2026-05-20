Set ws = CreateObject("WScript.Shell")
Set sc = ws.CreateShortcut(ws.SpecialFolders("Desktop") & "\MusicBot.lnk")
sc.TargetPath = "C:\Users\USER\Desktop\discord-music-bot\iniciar-bot.bat"
sc.WorkingDirectory = "C:\Users\USER\Desktop\discord-music-bot"
sc.IconLocation = "C:\Windows\System32\cmd.exe,0"
sc.Description = "Iniciar MusicBot Discord"
sc.Save
WScript.Echo "Acceso directo creado en el Escritorio"
