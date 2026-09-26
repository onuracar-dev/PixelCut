"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  Terminal as TerminalIcon,
  Trash2,
  X,
} from "lucide-react";
import { Terminal } from "@/components/ui/terminal";
import { CssAnalysisResult } from "@/lib/css-analyzer";
import { cn } from "@/lib/utils";

interface TerminalDockProps {
  isOpen: boolean;
  onClose: () => void;
  analysis?: CssAnalysisResult;
  maxLinesGoal?: number;
  activeFile?: string;
  className?: string;
}

interface CommandLog {
  id: string;
  command: string;
  timestamp: string;
  cwd?: string;
  type: "success" | "warn" | "info" | "error" | "output";
  lines: string[];
}

export function TerminalDock({
  isOpen,
  onClose,
  className,
}: TerminalDockProps) {
  const [commandInput, setCommandInput] = React.useState("");
  const [history, setHistory] = React.useState<CommandLog[]>([]);
  const [historyCommands, setHistoryCommands] = React.useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = React.useState<number>(-1);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [currentCwd, setCurrentCwd] = React.useState<string>("~");

  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const bottomAnchorRef = React.useRef<HTMLDivElement>(null);

  // Fetch initial working directory
  React.useEffect(() => {
    async function initCwd() {
      try {
        if (typeof window !== "undefined" && window.electronAPI?.getTerminalCwd) {
          const dir = await window.electronAPI.getTerminalCwd();
          if (dir) setCurrentCwd(dir);
        } else {
          const res = await fetch("/api/terminal");
          const data = await res.json();
          if (data.cwd) setCurrentCwd(data.cwd);
        }
      } catch {
        // fallback
      }
    }
    initCwd();
  }, []);

  // Immediate and RAF-synced Auto-Scroll strictly on the terminal container
  const scrollToBottom = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  // MutationObserver: whenever log lines update DOM, stay locked to bottom!
  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    scrollToBottom();

    const observer = new MutationObserver(() => {
      scrollToBottom();
    });

    observer.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [scrollToBottom]);

  // Scroll on command execution and history updates
  React.useEffect(() => {
    scrollToBottom();
  }, [history, isExecuting, scrollToBottom]);

  // Auto-focus prompt input when terminal opens or execution completes
  React.useEffect(() => {
    if (isOpen && !isExecuting) {
      inputRef.current?.focus();
    }
  }, [isOpen, isExecuting, history.length]);

  const tabStateRef = React.useRef<{
    commandPrefix: string;
    tokenPrefix: string;
    matches: string[];
    index: number;
  } | null>(null);

  const handleTabCompletion = async () => {
    // If user already pressed Tab and we have matches, cycle to the next match
    if (tabStateRef.current && tabStateRef.current.matches.length > 0) {
      const state = tabStateRef.current;
      state.index = (state.index + 1) % state.matches.length;
      const match = state.matches[state.index];
      setCommandInput(state.commandPrefix + match);
      scrollToBottom();
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return;
    }

    const current = commandInput;
    // Find last argument token
    const lastSpaceIdx = current.lastIndexOf(" ");
    let commandPrefix = "";
    let tokenPrefix = "";

    if (lastSpaceIdx === -1) {
      commandPrefix = "";
      tokenPrefix = current;
    } else {
      commandPrefix = current.substring(0, lastSpaceIdx + 1);
      tokenPrefix = current.substring(lastSpaceIdx + 1);
    }

    const cleanToken = tokenPrefix.replace(/^["']/, "");
    const matches: string[] = [];

    // 1. If completing the first word (command name), suggest common shell & IDE commands
    if (lastSpaceIdx === -1 && !tokenPrefix.includes("/") && !tokenPrefix.includes("\\") && !tokenPrefix.includes(".")) {
      const commonCommands = [
        "cd", "ls", "dir", "git", "npm", "node", "clear", "cls",
        "cat", "mkdir", "rm", "cp", "mv", "pnpm", "yarn", "npx", "help"
      ];
      const cmdMatches = commonCommands.filter((c) => c.startsWith(cleanToken.toLowerCase()));
      matches.push(...cmdMatches);
    }

    // 2. Fetch file & folder completions from Electron IPC or Next.js /api/terminal
    try {
      if (typeof window !== "undefined" && window.electronAPI?.getTerminalCompletions) {
        const fileMatches = await window.electronAPI.getTerminalCompletions(cleanToken);
        if (Array.isArray(fileMatches) && fileMatches.length > 0) {
          matches.push(...fileMatches);
        }
      }

      if (matches.length === 0) {
        const res = await fetch(`/api/terminal?complete=${encodeURIComponent(cleanToken)}`);
        const data = await res.json();
        if (Array.isArray(data.matches)) {
          matches.push(...data.matches);
        }
      }
    } catch (err) {
      console.error("Tab completion error:", err);
    }

    // Deduplicate
    const uniqueMatches = Array.from(new Set(matches));

    if (uniqueMatches.length === 0) return;

    tabStateRef.current = {
      commandPrefix,
      tokenPrefix,
      matches: uniqueMatches,
      index: 0,
    };

    setCommandInput(commandPrefix + uniqueMatches[0]);
    scrollToBottom();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  // Execute real shell or helper command
  const executeShellCommand = async (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Save to command history for up/down navigation
    setHistoryCommands((prev) => [...prev, cmd]);
    setHistoryPointer(-1);

    const time = new Date().toLocaleTimeString("tr-TR", { hour12: false });

    // Built-in clear
    if (cmd === "clear" || cmd === "cls") {
      setHistory([]);
      scrollToBottom();
      return;
    }

    // Built-in help
    if (cmd === "help") {
      setHistory((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          command: cmd,
          timestamp: time,
          cwd: currentCwd,
          type: "info",
          lines: [
            "✦ Gerçek Sistem Terminali (PowerShell / Bash):",
            "  dir, ls, git status, git log, npm run ..., node, ping vb. tüm komutlar çalışır.",
            "  cd <klasör>  - Klasör değiştirir.",
            "  clear / cls  - Terminal ekranını temizler.",
            "  Tab          - Dosya, klasör ve komut adlarını otomatik tamamlar.",
          ],
        },
      ]);
      scrollToBottom();
      return;
    }

    // REAL OS Terminal Execution
    setIsExecuting(true);
    scrollToBottom();
    try {
      let stdout = "";
      let stderr = "";
      let newCwd = currentCwd;

      if (typeof window !== "undefined" && window.electronAPI?.runTerminalCommand) {
        const res = await window.electronAPI.runTerminalCommand(cmd);
        stdout = res.stdout;
        stderr = res.stderr;
        if (res.cwd) newCwd = res.cwd;
      } else {
        const response = await fetch("/api/terminal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: cmd }),
        });
        const res = await response.json();
        stdout = res.stdout;
        stderr = res.stderr;
        if (res.cwd) newCwd = res.cwd;
      }

      if (newCwd) setCurrentCwd(newCwd);

      const outputLines: string[] = [];
      if (stdout) {
        outputLines.push(...stdout.split(/\r?\n/).filter((l, idx, arr) => idx < arr.length - 1 || l.trim().length > 0));
      }
      if (stderr) {
        outputLines.push(...stderr.split(/\r?\n/).filter((l, idx, arr) => idx < arr.length - 1 || l.trim().length > 0));
      }

      setHistory((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          command: cmd,
          timestamp: time,
          cwd: currentCwd,
          type: stderr && !stdout ? "error" : "output",
          lines: outputLines,
        },
      ]);
      scrollToBottom();
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          command: cmd,
          timestamp: time,
          cwd: currentCwd,
          type: "error",
          lines: [err?.message || "Komut yürütülürken hata oluştu."],
        },
      ]);
      scrollToBottom();
    } finally {
      setIsExecuting(false);
      scrollToBottom();
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  };

  const handleCommandSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isExecuting) return;
    const cmd = commandInput;
    setCommandInput("");
    tabStateRef.current = null;

    if (!cmd.trim()) {
      setHistory((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          command: "",
          timestamp: new Date().toLocaleTimeString("tr-TR", { hour12: false }),
          cwd: currentCwd,
          type: "output",
          lines: [],
        },
      ]);
      scrollToBottom();
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return;
    }

    executeShellCommand(cmd);
    scrollToBottom();
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      await handleTabCompletion();
      return;
    }

    tabStateRef.current = null;

    if (e.key === "Enter") {
      e.preventDefault();
      handleCommandSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyCommands.length === 0) return;
      const nextIdx = historyPointer === -1 ? historyCommands.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextIdx);
      setCommandInput(historyCommands[nextIdx]);
      scrollToBottom();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPointer === -1) return;
      const nextIdx = historyPointer + 1;
      if (nextIdx >= historyCommands.length) {
        setHistoryPointer(-1);
        setCommandInput("");
      } else {
        setHistoryPointer(nextIdx);
        setCommandInput(historyCommands[nextIdx]);
      }
      scrollToBottom();
    }
  };

  // Format short cwd for display
  const formatCwd = React.useCallback((path?: string) => {
    if (!path || path === "~") return "CssPg";
    const parts = path.split(/[\\/]/).filter(Boolean);
    return parts.slice(-2).join("/");
  }, []);

  const displayCwd = React.useMemo(() => formatCwd(currentCwd), [currentCwd, formatCwd]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 250, opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className={cn(
          "relative flex flex-col border-t border-hairline dark:border-white/[0.08] bg-surface dark:bg-[#1e1e1e] shadow-none overflow-hidden font-mono z-20",
          className
        )}
      >
        {/* Terminal Header */}
        <div className="flex h-8 shrink-0 items-center justify-between border-b border-hairline dark:border-white/[0.08] bg-well/40 dark:bg-[#18181b] px-3 select-none text-[11px]">
          {/* Left: Terminal Title */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-medium text-label dark:text-zinc-100">
              <TerminalIcon className="size-3 text-label-2 dark:text-zinc-400" />
              <span>Terminal</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 text-label-3">
            <span
              className="text-[10.5px] text-label-4 dark:text-zinc-500 font-mono pr-2 hidden md:inline truncate max-w-[200px]"
              title={currentCwd}
            >
              {currentCwd}
            </span>
            <button
              type="button"
              onClick={() => setHistory([])}
              title="Terminali Temizle"
              className="flex size-6 items-center justify-center rounded-[5px] text-label-3 hover:text-label hover:bg-fill-2 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Terminali Kapat"
              className="flex size-6 items-center justify-center rounded-[5px] text-label-3 hover:text-label hover:bg-fill-2 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Buffer */}
        <div
          className="flex flex-1 flex-col overflow-hidden cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <div
            ref={scrollContainerRef}
            onClick={() => inputRef.current?.focus()}
            className="flex-1 overflow-y-auto px-4 py-2.5 text-[11.5px] leading-relaxed select-text cursor-text"
          >
            <Terminal
              showHeader={false}
              scrollable={false}
              className="border-0 rounded-none bg-transparent shadow-none p-0 max-w-none text-label dark:text-zinc-200"
            >
              {/* Real command output history */}
              {history.map((log) => (
                <div key={log.id} className="mt-1 font-mono">
                  <div className="flex items-center gap-2 text-[11.5px] leading-normal">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                      {formatCwd(log.cwd)}
                    </span>
                    <span className="text-tint/90 dark:text-zinc-400 font-bold shrink-0">$</span>
                    <span className="text-label dark:text-zinc-100">{log.command}</span>
                  </div>
                  {log.lines.length > 0 && (
                    <div className="mt-0.5 space-y-0.5 overflow-x-auto">
                      {log.lines.map((l, li) => (
                        <div
                          key={li}
                          className={cn(
                            "text-[11.5px] whitespace-pre font-mono leading-normal",
                            log.type === "warn" && "text-amber-600 dark:text-amber-400/85",
                            log.type === "error" && "text-rose-600 dark:text-rose-400/85",
                            log.type === "success" && "text-emerald-600 dark:text-emerald-400/80",
                            log.type === "info" && "text-zinc-500 dark:text-zinc-400",
                            log.type === "output" && "text-zinc-800 dark:text-zinc-200"
                          )}
                        >
                          {l}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isExecuting && (
                <div className="flex items-center gap-2 text-[11px] text-label-3 dark:text-zinc-400 pt-1 font-mono">
                  <Loader2 className="size-3 animate-spin text-label-3 dark:text-zinc-400" />
                  <span>Komut yürütülüyor...</span>
                </div>
              )}

              {/* Active Interactive Shell Prompt Line */}
              <form
                onSubmit={handleCommandSubmit}
                className="mt-1 flex items-center gap-2 text-[11.5px] font-mono select-none"
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                  {displayCwd}
                </span>
                <span className="text-tint/90 dark:text-zinc-400 font-bold shrink-0">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  readOnly={isExecuting}
                  value={commandInput}
                  onChange={(e) => {
                    tabStateRef.current = null;
                    setCommandInput(e.target.value);
                    scrollToBottom();
                  }}
                  onFocus={() => scrollToBottom()}
                  onKeyDown={handleKeyDown}
                  placeholder={isExecuting ? "Çalışıyor..." : ""}
                  className={cn(
                    "flex-1 min-w-0 bg-transparent text-[11.5px] text-label dark:text-zinc-100 outline-none font-mono caret-tint",
                    isExecuting && "opacity-60 cursor-wait"
                  )}
                  autoFocus
                />
                {isExecuting && (
                  <Loader2 className="size-3 animate-spin text-zinc-400 shrink-0" />
                )}
              </form>
            </Terminal>
            <div ref={bottomAnchorRef} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TerminalDock;
