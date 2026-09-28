const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,

  // Window Controls & Dragging
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  isMaximized: () => ipcRenderer.invoke("window-is-maximized"),
  dragStart: (screenX, screenY) => ipcRenderer.send("window-drag-start", { screenX, screenY }),
  dragMove: (screenX, screenY) => ipcRenderer.send("window-drag-move", { screenX, screenY }),
  dragEnd: () => ipcRenderer.send("window-drag-end"),
  onMaximizeChange: (callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on("window-maximize-change", handler);
    return () => ipcRenderer.removeListener("window-maximize-change", handler);
  },

  // Auto Updater
  checkForUpdates: () => ipcRenderer.send("check-for-updates"),
  restartAndInstall: () => ipcRenderer.send("restart-and-install"),
  onUpdateAvailable: (callback) => {
    const handler = (_event, info) => callback(info);
    ipcRenderer.on("update-available", handler);
    return () => ipcRenderer.removeListener("update-available", handler);
  },
  onUpdateDownloaded: (callback) => {
    const handler = (_event, info) => callback(info);
    ipcRenderer.on("update-downloaded", handler);
    return () => ipcRenderer.removeListener("update-downloaded", handler);
  },
  onUpdateProgress: (callback) => {
    const handler = (_event, progress) => callback(progress);
    ipcRenderer.on("update-download-progress", handler);
    return () => ipcRenderer.removeListener("update-download-progress", handler);
  },

  // Terminal Execution
  runTerminalCommand: (command) => ipcRenderer.invoke("terminal-execute", command),
  getTerminalCwd: () => ipcRenderer.invoke("terminal-get-cwd"),
  getTerminalCompletions: (partial) => ipcRenderer.invoke("terminal-complete", partial),

  // File System & Directory Dialog (VS Code style Open Folder)
  openDirectoryDialog: () => ipcRenderer.invoke("dialog-open-directory"),
  readFile: (filePath) => ipcRenderer.invoke("fs-read-file", filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke("fs-write-file", filePath, content),
  createFile: (filePath, content) => ipcRenderer.invoke("fs-create-file", filePath, content),
  createDirectory: (dirPath) => ipcRenderer.invoke("fs-create-directory", dirPath),
  deletePath: (targetPath) => ipcRenderer.invoke("fs-delete", targetPath),

  // Persistent User Profile Storage
  getUserProfile: () => ipcRenderer.invoke("user-profile-get"),
  setUserProfile: (data) => ipcRenderer.invoke("user-profile-set", data),
});
