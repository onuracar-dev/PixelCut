export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  filePath?: string;
  isSystem?: boolean;
  children?: FileNode[];
}

export interface OpenedWorkspace {
  name: string;
  rootPath?: string;
  tree: FileNode[];
  isLocal: boolean;
  files?: Record<string, string>;
}

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

/**
 * Recursive reader for browser File System Access API (showDirectoryPicker)
 */
async function readDirectoryHandle(
  dirHandle: any,
  parentPath = "",
  maxDepth = 4,
  currentDepth = 0
): Promise<{ node: FileNode; files: Record<string, string> }> {
  const currentPath = parentPath ? `${parentPath}/${dirHandle.name}` : dirHandle.name;
  const children: FileNode[] = [];
  const files: Record<string, string> = {};

  if (currentDepth > maxDepth) {
    return {
      node: { id: currentPath, name: dirHandle.name, type: "folder", filePath: currentPath, children: [] },
      files,
    };
  }

  for await (const [name, handle] of dirHandle.entries()) {
    if (IGNORED_NAMES.has(name)) continue;
    if (name.startsWith(".") && name !== ".env" && name !== ".gitignore") continue;

    const itemPath = `${currentPath}/${name}`;

    if (handle.kind === "directory") {
      const sub = await readDirectoryHandle(handle, currentPath, maxDepth, currentDepth + 1);
      children.push(sub.node);
      Object.assign(files, sub.files);
    } else if (handle.kind === "file") {
      children.push({
        id: itemPath,
        name,
        type: "file",
        filePath: itemPath,
      });

      // Pre-read text content for files under 500KB
      try {
        const file = await handle.getFile();
        if (file.size < 500 * 1024) {
          const text = await file.text();
          files[itemPath] = text;
        }
      } catch {
        // ignore unreadable binary
      }
    }
  }

  // Sort: folders first, then alphabetical
  children.sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name);
  });

  return {
    node: {
      id: currentPath,
      name: dirHandle.name,
      type: "folder",
      filePath: currentPath,
      children,
    },
    files,
  };
}

/**
 * Open Folder from PC (supports Electron native dialog, browser File System Access API, or webkitdirectory)
 */
export async function openFolderFromPC(): Promise<OpenedWorkspace | null> {
  // 1. Electron environment: use native desktop file dialog
  if (typeof window !== "undefined" && window.electronAPI?.openDirectoryDialog) {
    try {
      const result = await window.electronAPI.openDirectoryDialog();
      if (!result) return null;

      const tree = result.tree.children || [];
      return {
        name: result.rootName,
        rootPath: result.rootPath,
        tree,
        isLocal: true,
      };
    } catch (err) {
      console.error("Electron openDirectoryDialog error:", err);
    }
  }

  // 2. Modern browser environment: window.showDirectoryPicker()
  if (typeof window !== "undefined" && "showDirectoryPicker" in window) {
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      const { node, files } = await readDirectoryHandle(dirHandle);

      return {
        name: node.name,
        rootPath: node.filePath,
        tree: node.children || [],
        isLocal: true,
        files,
      };
    } catch (err: any) {
      if (err.name === "AbortError") return null;
      console.warn("showDirectoryPicker failed, falling back to file input", err);
    }
  }

  // 3. Fallback: input element with webkitdirectory
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    (input as any).webkitdirectory = true;

    input.onchange = async () => {
      const fileList = input.files;
      if (!fileList || fileList.length === 0) {
        return resolve(null);
      }

      const files: Record<string, string> = {};
      const rootName = fileList[0].webkitRelativePath.split("/")[0] || "Klasör";
      const folderMap = new Map<string, FileNode>();

      const rootNode: FileNode = {
        id: rootName,
        name: rootName,
        type: "folder",
        children: [],
      };
      folderMap.set(rootName, rootNode);

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const parts = file.webkitRelativePath.split("/");

        // Skip ignored directories
        if (parts.some((p) => IGNORED_NAMES.has(p))) continue;

        let currentPath = parts[0];
        let parentNode = rootNode;

        for (let j = 1; j < parts.length - 1; j++) {
          const part = parts[j];
          currentPath = `${currentPath}/${part}`;
          if (!folderMap.has(currentPath)) {
            const folderNode: FileNode = {
              id: currentPath,
              name: part,
              type: "folder",
              children: [],
            };
            folderMap.set(currentPath, folderNode);
            parentNode.children = parentNode.children || [];
            parentNode.children.push(folderNode);
          }
          parentNode = folderMap.get(currentPath)!;
        }

        const fileName = parts[parts.length - 1];
        const filePath = file.webkitRelativePath;
        const fileNode: FileNode = {
          id: filePath,
          name: fileName,
          type: "file",
          filePath,
        };

        parentNode.children = parentNode.children || [];
        parentNode.children.push(fileNode);

        if (file.size < 500 * 1024) {
          try {
            const text = await file.text();
            files[filePath] = text;
          } catch {}
        }
      }

      resolve({
        name: rootName,
        rootPath: rootName,
        tree: rootNode.children || [],
        isLocal: true,
        files,
      });
    };

    input.click();
  });
}

/**
 * Read file content (from Electron or preloaded cache)
 */
export async function readWorkspaceFile(filePath: string): Promise<string | null> {
  if (typeof window !== "undefined" && window.electronAPI?.readFile) {
    try {
      const res = await window.electronAPI.readFile(filePath);
      if (res.success && typeof res.content === "string") {
        return res.content;
      }
    } catch (e) {
      console.error("Electron readFile error:", e);
    }
  }
  return null;
}

/**
 * Save file content to local disk (in Electron)
 */
export async function saveWorkspaceFile(filePath: string, content: string): Promise<boolean> {
  if (typeof window !== "undefined" && window.electronAPI?.writeFile) {
    try {
      const res = await window.electronAPI.writeFile(filePath, content);
      return res.success;
    } catch (e) {
      console.error("Electron writeFile error:", e);
    }
  }
  return false;
}

/**
 * Create a new file on local disk (in Electron)
 */
export async function createWorkspaceFile(filePath: string, content = ""): Promise<boolean> {
  if (typeof window !== "undefined" && window.electronAPI?.createFile) {
    try {
      const res = await window.electronAPI.createFile(filePath, content);
      return res.success;
    } catch (e) {
      console.error("Electron createFile error:", e);
    }
  }
  return false;
}

/**
 * Create a new directory on local disk (in Electron)
 */
export async function createWorkspaceFolder(dirPath: string): Promise<boolean> {
  if (typeof window !== "undefined" && window.electronAPI?.createDirectory) {
    try {
      const res = await window.electronAPI.createDirectory(dirPath);
      return res.success;
    } catch (e) {
      console.error("Electron createDirectory error:", e);
    }
  }
  return false;
}

/**
 * Delete a file or directory from local disk (in Electron)
 */
export async function deleteWorkspacePath(targetPath: string): Promise<boolean> {
  if (typeof window !== "undefined" && window.electronAPI?.deletePath) {
    try {
      const res = await window.electronAPI.deletePath(targetPath);
      return res.success;
    } catch (e) {
      console.error("Electron deletePath error:", e);
    }
  }
  return false;
}
