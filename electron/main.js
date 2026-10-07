const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { autoUpdater } = require("electron-updater");

// Configure autoUpdater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
let mainWindow = null;
let staticServer = null;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

const PRODUCTION_PORT = 38450;

function startStaticServer() {
  return new Promise((resolve) => {
    const outDir = path.join(__dirname, "../out");
    staticServer = http.createServer((req, res) => {
      try {
        const parsedUrl = new URL(req.url, "http://127.0.0.1");
        let filePath = path.join(outDir, decodeURIComponent(parsedUrl.pathname));

        if (!path.extname(filePath)) {
          if (fs.existsSync(filePath + ".html")) {
            filePath = filePath + ".html";
          } else {
            filePath = path.join(filePath, "index.html");
          }
        }

        if (!fs.existsSync(filePath)) {
          filePath = path.join(outDir, "index.html");
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";

        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "no-cache");
        const stream = fs.createReadStream(filePath);
        stream.on("error", () => {
          res.statusCode = 404;
          res.end("Not Found");
        });
        stream.pipe(res);
      } catch (err) {
        res.statusCode = 500;
        res.end("Server Error");
      }
    });

    // Try listening on fixed port so localStorage/IndexedDB persist across every launch!
    staticServer.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`Port ${PRODUCTION_PORT} is in use, falling back to dynamic port.`);
        staticServer.listen(0, "127.0.0.1", () => {
          resolve(staticServer.address().port);
        });
      } else {
        console.error("Static server error:", err);
      }
    });

    staticServer.listen(PRODUCTION_PORT, "127.0.0.1", () => {
      resolve(PRODUCTION_PORT);
    });
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    title: "PixelCut",
    icon: process.platform === "win32"
      ? path.join(__dirname, "../build/icon.ico")
      : path.join(__dirname, "../build/icon.png"),
    frame: false, // Custom macOS traffic lights & titlebar in web UI
    titleBarStyle: "hidden",
    titleBarOverlay: false,
    transparent: false, // Solid window prevents desktop see-through ghosting
    backgroundColor: "#000000",
    hasShadow: true,
    show: false, // Show when ready to prevent white flash
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      devTools: true,
    },
  });

  // Smooth show when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Load URL (Desktop app opens Studio directly)
  if (isDev) {
    const devUrl = process.env.ELECTRON_START_URL || "http://localhost:3000/app";
    mainWindow.loadURL(devUrl);
  } else {
    // In production, serve the Next.js static bundle through local HTTP server
    startStaticServer().then((port) => {
      mainWindow.loadURL(`http://127.0.0.1:${port}/app`);
    });
  }

  // Keyboard shortcut for DevTools: F12 or Ctrl+Shift+I
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F12" || (input.control && input.shift && input.key.toLowerCase() === "i")) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  mainWindow.on("maximize", () => mainWindow?.webContents.send("window-maximize-change", true));
  mainWindow.on("unmaximize", () => mainWindow?.webContents.send("window-maximize-change", false));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Window IPC handlers
ipcMain.on("window-minimize", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on("window-maximize", () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on("window-close", () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle("window-is-maximized", () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Custom window dragging without forcing OS cursor
let dragStartPos = null;
let windowStartPos = null;

ipcMain.on("window-drag-start", (_event, { screenX, screenY }) => {
  if (!mainWindow) return;
  dragStartPos = { x: screenX, y: screenY };
  const [wx, wy] = mainWindow.getPosition();
  windowStartPos = { x: wx, y: wy };
});

ipcMain.on("window-drag-move", (_event, { screenX, screenY }) => {
  if (!mainWindow || !dragStartPos || !windowStartPos) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
    const [wx, wy] = mainWindow.getPosition();
    windowStartPos = { x: wx, y: wy };
    dragStartPos = { x: screenX, y: screenY };
    return;
  }
  const newX = windowStartPos.x + (screenX - dragStartPos.x);
  const newY = windowStartPos.y + (screenY - dragStartPos.y);
  mainWindow.setPosition(newX, newY);
});

ipcMain.on("window-drag-end", () => {
  dragStartPos = null;
  windowStartPos = null;
});

// Directory Tree Scanner & Open Folder IPC
const IGNORED_NAMES = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "dist-electron",
  "build",
  ".vscode",
  ".idea",
  ".turbo",
  ".output",
  ".DS_Store",
  "Thumbs.db",
]);

async function buildDirectoryTree(dirPath, maxDepth = 4, currentDepth = 0) {
  const name = path.basename(dirPath);
  if (currentDepth > maxDepth) {
    return { id: dirPath, name, type: "folder", filePath: dirPath, children: [] };
  }

  let entries = [];
  try {
    entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  } catch (e) {
    return { id: dirPath, name, type: "folder", filePath: dirPath, children: [] };
  }

  const children = [];
  const sorted = entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const entry of sorted) {
    if (IGNORED_NAMES.has(entry.name)) continue;
    if (entry.name.startsWith(".") && entry.name !== ".env" && entry.name !== ".gitignore") continue;

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const subTree = await buildDirectoryTree(fullPath, maxDepth, currentDepth + 1);
      children.push(subTree);
    } else {
      children.push({
        id: fullPath,
        name: entry.name,
        type: "file",
        filePath: fullPath,
      });
    }
  }

  return {
    id: dirPath,
    name,
    type: "folder",
    filePath: dirPath,
    children,
  };
}

ipcMain.handle("dialog-open-directory", async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Klasör Aç (Open Folder)",
    properties: ["openDirectory"],
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  terminalCwd = selectedPath;
  const tree = await buildDirectoryTree(selectedPath);
  return {
    rootPath: selectedPath,
    rootName: path.basename(selectedPath),
    tree,
  };
});

ipcMain.handle("fs-read-file", async (_event, filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    return { success: true, content };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("fs-write-file", async (_event, filePath, content) => {
  try {
    await fs.promises.writeFile(filePath, content, "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("fs-create-file", async (_event, filePath, content = "") => {
  try {
    await fs.promises.writeFile(filePath, content, "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("fs-create-directory", async (_event, dirPath) => {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("fs-delete", async (_event, targetPath) => {
  try {
    await fs.promises.rm(targetPath, { recursive: true, force: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Real Terminal Execution IPC
let terminalCwd = process.cwd();

ipcMain.handle("terminal-get-cwd", () => terminalCwd);

ipcMain.handle("terminal-execute", async (_event, command) => {
  return new Promise((resolve) => {
    const trimmed = (command || "").trim();
    if (!trimmed) {
      return resolve({ stdout: "", stderr: "", cwd: terminalCwd });
    }

    if (trimmed.startsWith("cd ")) {
      const targetDir = trimmed.substring(3).trim().replace(/^["']|["']$/g, "");
      try {
        const resolvedPath = path.resolve(terminalCwd, targetDir);
        terminalCwd = resolvedPath;
        return resolve({ stdout: "", stderr: "", cwd: terminalCwd });
      } catch (err) {
        return resolve({ stdout: "", stderr: err.message, cwd: terminalCwd });
      }
    }

    const { exec } = require("child_process");
    exec(
      trimmed,
      {
        cwd: terminalCwd,
        maxBuffer: 1024 * 1024 * 5,
        shell: process.platform === "win32" ? "powershell.exe" : "/bin/bash",
      },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout || "",
          stderr: stderr || (error && !stderr ? error.message : ""),
          cwd: terminalCwd,
        });
      }
    );
  });
});

ipcMain.handle("terminal-complete", async (_event, partial) => {
  try {
    const fs = require("fs");
    let searchDir = terminalCwd;
    let filePrefix = partial || "";
    let dirPrefix = "";

    if (partial && (partial.includes("/") || partial.includes("\\"))) {
      const lastSlash = Math.max(partial.lastIndexOf("/"), partial.lastIndexOf("\\"));
      dirPrefix = partial.substring(0, lastSlash + 1);
      filePrefix = partial.substring(lastSlash + 1);
      searchDir = path.resolve(terminalCwd, dirPrefix);
    }

    if (!fs.existsSync(searchDir)) return [];
    const entries = fs.readdirSync(searchDir, { withFileTypes: true });
    const matches = entries
      .filter((e) => e.name.toLowerCase().startsWith(filePrefix.toLowerCase()))
      .map((e) => {
        const isDir = e.isDirectory();
        let name = e.name + (isDir ? "/" : "");
        if (name.includes(" ") && !name.startsWith('"') && !name.startsWith("'")) {
          name = `"${name}"`;
        }
        return dirPrefix + name;
      });
    return matches;
  } catch (err) {
    return [];
  }
});

// Auto Updater IPC & Events
ipcMain.on("check-for-updates", () => {
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.error("Güncelleme kontrolü başarısız:", err);
    });
  }
});

ipcMain.on("restart-and-install", () => {
  autoUpdater.quitAndInstall();
});

autoUpdater.on("checking-for-update", () => {
  mainWindow?.webContents.send("update-checking");
});

autoUpdater.on("update-available", (info) => {
  mainWindow?.webContents.send("update-available", info);
});

autoUpdater.on("update-not-available", () => {
  mainWindow?.webContents.send("update-not-available");
});

autoUpdater.on("download-progress", (progressObj) => {
  mainWindow?.webContents.send("update-download-progress", progressObj);
});

autoUpdater.on("update-downloaded", (info) => {
  mainWindow?.webContents.send("update-downloaded", info);
});

autoUpdater.on("error", (err) => {
  console.error("AutoUpdater hatası:", err);
});

// User Profile & Settings Persistence in userData
ipcMain.handle("user-profile-get", async () => {
  try {
    const profilePath = path.join(app.getPath("userData"), "user-profile.json");
    if (fs.existsSync(profilePath)) {
      const data = fs.readFileSync(profilePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading user-profile.json:", err);
  }
  return null;
});

ipcMain.handle("user-profile-set", async (_event, data) => {
  try {
    const profilePath = path.join(app.getPath("userData"), "user-profile.json");
    fs.writeFileSync(profilePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing user-profile.json:", err);
    return false;
  }
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify().catch((e) => console.log("Updater check on start:", e));
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  if (staticServer) {
    try {
      staticServer.close();
    } catch {}
  }
});
