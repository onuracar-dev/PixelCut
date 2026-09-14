export interface ElectronAPI {
  isElectron: boolean;
  platform: string;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;
  dragStart?: (screenX: number, screenY: number) => void;
  dragMove?: (screenX: number, screenY: number) => void;
  dragEnd?: () => void;
  onMaximizeChange?: (callback: (maximized: boolean) => void) => () => void;
  checkForUpdates: () => void;
  restartAndInstall: () => void;
  onUpdateAvailable: (callback: (info: { version: string }) => void) => () => void;
  onUpdateDownloaded: (callback: (info: { version: string }) => void) => () => void;
  onUpdateProgress: (callback: (progress: { percent: number }) => void) => () => void;
  runTerminalCommand?: (command: string) => Promise<{ stdout: string; stderr: string; cwd?: string }>;
  getTerminalCwd?: () => Promise<string>;
  getTerminalCompletions?: (partial: string) => Promise<string[]>;
  openDirectoryDialog?: () => Promise<{ rootPath: string; rootName: string; tree: any } | null>;
  readFile?: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  writeFile?: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  createFile?: (filePath: string, content?: string) => Promise<{ success: boolean; error?: string }>;
  createDirectory?: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
  deletePath?: (targetPath: string) => Promise<{ success: boolean; error?: string }>;
  getUserProfile?: () => Promise<any>;
  setUserProfile?: (data: any) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
