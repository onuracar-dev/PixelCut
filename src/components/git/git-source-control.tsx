"use client";

import * as React from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  FileCode,
  GitBranch,
  GitCommit as GitCommitIcon,
  GitFork,
  GitPullRequest,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { GitCommit, GitFileChange } from "@/types/git";
import { calculateLineDiff, DiffLine } from "@/lib/git-manager";
import { AuthState } from "@/lib/supabase-auth";
import { pushFilesToGitHub } from "@/lib/github-api";
import { SegmentedControl } from "@/components/apple/segmented-control";
import { cn } from "@/lib/utils";

interface GitSourceControlProps {
  currentBranch: string;
  branches: string[];
  commits: GitCommit[];
  changes: GitFileChange[];
  activeFileCode: {
    html: string;
    css: string;
  };
  authState: AuthState;
  onOpenAuthModal: () => void;
  onCommit: (message: string) => void;
  onCreateBranch: (branchName: string) => void;
  onSwitchBranch: (branchName: string) => void;
  onPush: () => Promise<void>;
  onDiscardChange: (filename: "styles.css" | "index.html") => void;
  onReturnToEditor: () => void;
}

export function GitSourceControl({
  currentBranch,
  branches,
  commits,
  changes,
  activeFileCode,
  authState,
  onOpenAuthModal,
  onCommit,
  onCreateBranch,
  onSwitchBranch,
  onPush,
  onDiscardChange,
  onReturnToEditor,
}: GitSourceControlProps) {
  const [commitMessage, setCommitMessage] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"diff" | "history">("diff");
  const [selectedFileForDiff, setSelectedFileForDiff] = React.useState<"styles.css" | "index.html">(
    (changes[0]?.filename as any) || "styles.css"
  );
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = React.useState(false);
  const [newBranchInput, setNewBranchInput] = React.useState("");
  const [branchSearch, setBranchSearch] = React.useState("");
  const [isPushing, setIsPushing] = React.useState(false);
  const [pushSuccess, setPushSuccess] = React.useState(false);

  // Auto-select first changed file if currently selected is not in changes
  React.useEffect(() => {
    if (changes.length > 0 && !changes.find((c) => c.filename === selectedFileForDiff)) {
      setSelectedFileForDiff(changes[0].filename as any);
    }
  }, [changes, selectedFileForDiff]);

  // Conventional commit prefixes
  const CONVENTIONAL_PREFIXES = [
    { label: "feat:", hint: "Yeni özellik" },
    { label: "fix:", hint: "Düzeltme" },
    { label: "style:", hint: "CSS tasarımı" },
    { label: "refactor:", hint: "Kod temizliği" },
  ];

  const handleApplyPrefix = (prefix: string) => {
    if (!commitMessage.startsWith(prefix)) {
      setCommitMessage(`${prefix} ${commitMessage.replace(/^[a-z]+:\s*/, "")}`);
    }
  };

  const handleCommitSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commitMessage.trim() || changes.length === 0) return;
    onCommit(commitMessage.trim());
    setCommitMessage("");
  };

  const handleCreateBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBranchInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed || branches.includes(trimmed)) return;
    onCreateBranch(trimmed);
    setNewBranchInput("");
    setIsBranchDropdownOpen(false);
  };

  const handlePushClick = async () => {
    if (!authState.isAuthenticated || !authState.gitHubToken) {
      onOpenAuthModal();
      return;
    }
    setIsPushing(true);
    await onPush();
    setIsPushing(false);
    setPushSuccess(true);
    setTimeout(() => setPushSuccess(false), 2500);
  };

  // Compute diff for selected file
  const activeChange = changes.find((c) => c.filename === selectedFileForDiff);
  const diffResult = React.useMemo(() => {
    if (!activeChange) {
      return { additions: 0, deletions: 0, lines: [] as DiffLine[] };
    }
    return calculateLineDiff(activeChange.previousContent, activeChange.currentContent);
  }, [activeChange]);

  const filteredBranches = branches.filter((b) =>
    b.toLowerCase().includes(branchSearch.toLowerCase())
  );

  return (
    <div className="flex h-full w-full flex-col bg-window select-none overflow-hidden animate-in fade-in duration-150">
      {/* Top Header Bar */}
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-hairline bg-surface/85 px-4 backdrop-blur-xl z-20">
        {/* Left: Back to Code & Repo Info */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnToEditor}
            className="mac-btn mac-btn-secondary h-8 px-2.5 text-[12px] gap-1.5"
            title="Koda Geri Dön"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Koda Dön</span>
          </button>

          <div className="h-5 w-[1px] bg-hairline" />

          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-label">
              GitHub Kaynak Denetimi
            </span>
            <span className="pill bg-well border border-hairline text-label-3 font-mono text-[11px]">
              CssPg / lab-04
            </span>
          </div>
        </div>

        {/* Center: Branch Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-2 rounded-[10px] border border-hairline bg-well/80 px-3 py-1.5 text-[12px] font-mono text-label hover:bg-well hover:border-hairline-strong transition-all shadow-mac-xs"
          >
            <GitBranch className="size-3.5 text-label-2" />
            <span className="font-semibold">{currentBranch}</span>
            <span className="text-[10px] text-label-3">▼</span>
          </button>

          {/* Branch Dropdown Popover */}
          {isBranchDropdownOpen && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 rounded-[16px] border border-hairline bg-surface p-2 shadow-mac-lg z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Branch Search Input */}
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-label-3" />
                <input
                  type="text"
                  placeholder="Dal ara veya oluştur..."
                  value={branchSearch}
                  onChange={(e) => setBranchSearch(e.target.value)}
                  className="w-full rounded-[8px] border border-hairline bg-well py-1 pl-7 pr-2 font-mono text-[11.5px] text-label outline-none focus:border-tint"
                />
              </div>

              {/* Branch List */}
              <div className="max-h-40 overflow-y-auto space-y-0.5">
                {filteredBranches.map((branch) => (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => {
                      onSwitchBranch(branch);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left font-mono text-[11.5px] transition-colors",
                      currentBranch === branch
                        ? "bg-well text-label font-semibold"
                        : "text-label-2 hover:bg-well/60 hover:text-label"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <GitBranch className="size-3 text-label-3" />
                      <span>{branch}</span>
                    </span>
                    {currentBranch === branch && (
                      <Check className="size-3 text-label shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Create New Branch Form */}
              <form onSubmit={handleCreateBranchSubmit} className="mt-2 border-t border-hairline pt-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="yeni-dal-adi"
                    value={newBranchInput}
                    onChange={(e) => setNewBranchInput(e.target.value)}
                    className="flex-1 rounded-[8px] border border-hairline bg-well px-2 py-1 font-mono text-[11px] text-label outline-none focus:border-tint"
                  />
                  <button
                    type="submit"
                    disabled={!newBranchInput.trim()}
                    className="mac-btn mac-btn-secondary h-7 px-2 text-[11px] gap-1 disabled:opacity-40"
                  >
                    <Plus className="size-3" />
                    <span>Dal Aç</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right: Push to GitHub Action & Auth */}
        <div className="flex items-center gap-2.5">
          {authState.isAuthenticated && authState.user ? (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 rounded-[10px] border border-hairline bg-well/70 px-2.5 py-1 text-[11.5px] font-mono text-label hover:bg-well transition-colors shadow-mac-xs"
              title="GitHub Hesabı & Hedef Repo Ayarları"
            >
              <img
                src={authState.user.avatar_url}
                alt={authState.user.login}
                className="size-5 rounded-full object-cover bg-fill ring-1 ring-hairline"
              />
              <span className="font-medium max-w-[100px] truncate">@{authState.user.login}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="mac-btn mac-btn-secondary h-8 px-2.5 text-[12px] gap-1.5"
              title="GitHub Hesabını Bağla"
            >
              <svg className="size-3.5 fill-current text-label-2" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub ile Giriş</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePushClick}
            disabled={isPushing}
            className={cn(
              "mac-btn mac-btn-primary h-8 px-3 text-[12px] gap-1.5 transition-all font-medium",
              pushSuccess && "text-label font-semibold"
            )}
            title="origin/main uzak sunucuya push et"
          >
            {isPushing ? (
              <span className="size-3 animate-spin rounded-full border border-label-3 border-t-label" />
            ) : pushSuccess ? (
              <CheckCircle2 className="size-3.5 text-label" />
            ) : (
              <UploadCloud className="size-3.5" />
            )}
            <span>{isPushing ? "Push Ediliyor..." : pushSuccess ? "Gönderildi!" : "GitHub'a Push Et"}</span>
          </button>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Commit Message Box & Changes List */}
        <div className="flex w-[340px] shrink-0 flex-col border-r border-hairline bg-surface/50">
          {/* Commit Composer */}
          <div className="p-4 border-b border-hairline space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-label-3">
                Commit Mesajı
              </span>
            </div>

            {/* Quick Conventional Prefixes */}
            <div className="flex flex-wrap gap-1">
              {CONVENTIONAL_PREFIXES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPrefix(p.label)}
                  className="rounded-[6px] border border-hairline bg-well/70 px-2 py-0.5 font-mono text-[10.5px] text-label-2 hover:bg-well hover:text-label transition-colors"
                  title={p.hint}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Commit Message Textarea */}
            <div className="relative">
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleCommitSubmit();
                  }
                }}
                placeholder="Bu değişiklikte ne yaptığınızı açıklayın..."
                rows={3}
                className="w-full rounded-[12px] border border-hairline bg-well p-2.5 text-[12px] text-label placeholder:text-label-3 outline-none resize-none focus:border-tint transition-all"
              />
            </div>

            {/* Commit Button */}
            <button
              type="button"
              onClick={() => handleCommitSubmit()}
              disabled={!commitMessage.trim() || changes.length === 0}
              className="mac-btn mac-btn-primary w-full h-8 text-[12px] gap-1.5 font-medium disabled:opacity-40"
            >
              <GitCommitIcon className="size-3.5" />
              <span>Değişiklikleri Commit Et ({changes.length})</span>
            </button>
          </div>

          {/* Working Tree Changes List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-label-3">
                Değişen Dosyalar ({changes.length})
              </span>
              {changes.length === 0 && (
                <span className="text-[11px] text-label-3 font-mono">Tertemiz</span>
              )}
            </div>

            {changes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center rounded-[14px] bg-well/40 border border-hairline border-dashed">
                <CheckCircle2 className="size-5 text-label-3 mb-2" />
                <p className="text-[12px] font-medium text-label">
                  Tüm Değişiklikler Commit Edildi
                </p>
                <p className="text-[11px] text-label-3 mt-1 leading-relaxed">
                  Çalışma ağacınız temiz. Kodda değişiklik yaptığınızda anında burada listelenir.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {changes.map((change) => {
                  const isSelected = selectedFileForDiff === change.filename;
                  return (
                    <div
                      key={change.filename}
                      onClick={() => {
                        setSelectedFileForDiff(change.filename as any);
                        setActiveTab("diff");
                      }}
                      className={cn(
                        "group flex items-center justify-between rounded-[10px] border p-2.5 cursor-pointer transition-all",
                        isSelected
                          ? "border-hairline-strong bg-well shadow-mac-xs text-label"
                          : "border-hairline bg-well/30 text-label-2 hover:bg-well/70 hover:text-label"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {change.filename.endsWith(".css") ? (
                          <FileCode className="size-3.5 shrink-0 text-label-2" />
                        ) : (
                          <Code2 className="size-3.5 shrink-0 text-label-2" />
                        )}
                        <span className="font-mono text-[12px] truncate font-medium">
                          {change.filename}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status M */}
                        <span className="grid size-4 place-items-center rounded bg-well text-[10px] font-mono font-bold text-label-2 border border-hairline">
                          M
                        </span>

                        {/* Discard Changes Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`${change.filename} dosyasındaki değişiklikleri geri almak istediğinizden emin misiniz?`)) {
                              onDiscardChange(change.filename as any);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface text-label-3 hover:text-label transition-all"
                          title="Değişiklikleri Geri Al (Discard)"
                        >
                          <RotateCcw className="size-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: View Switcher (Line-by-Line Diff vs Commit History) */}
        <div className="flex flex-1 flex-col overflow-hidden bg-canvas">
          {/* Header Subtabs */}
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-hairline bg-surface/80 px-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] font-medium text-label">
                {activeTab === "diff"
                  ? `${selectedFileForDiff} (Diff Görünümü)`
                  : "Commit Geçmişi (Git Log)"}
              </span>
            </div>

            <SegmentedControl
              options={[
                {
                  value: "diff",
                  label: (
                    <span className="flex items-center gap-1.5 text-[11.5px]">
                      <Code2 className="size-3.5" />
                      <span>Satır Satır Diff</span>
                    </span>
                  ),
                },
                {
                  value: "history",
                  label: (
                    <span className="flex items-center gap-1.5 text-[11.5px]">
                      <Clock className="size-3.5" />
                      <span>Commit Geçmişi ({commits.length})</span>
                    </span>
                  ),
                },
              ]}
              value={activeTab}
              onChange={(val) => setActiveTab(val as any)}
              size="sm"
            />
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-auto p-4">
            {activeTab === "diff" ? (
              /* Line-by-Line Diff View */
              activeChange ? (
                <div className="rounded-[16px] border border-hairline bg-surface shadow-mac-sm overflow-hidden font-mono text-[12px]">
                  <div className="flex items-center justify-between border-b border-hairline bg-well/60 px-4 py-2 text-[11.5px] text-label-3">
                    <span className="font-mono font-medium text-label">
                      {selectedFileForDiff}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-500 font-medium">+{diffResult.additions} satır</span>
                      <span className="text-rose-500 font-medium">-{diffResult.deletions} satır</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto divide-y divide-hairline/30">
                    {diffResult.lines.map((line, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-stretch text-[12px] leading-relaxed transition-colors",
                          line.type === "add" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                          line.type === "delete" && "bg-rose-500/10 text-rose-700 dark:text-rose-300 line-through decoration-rose-500/50",
                          line.type === "context" && "text-label"
                        )}
                      >
                        {/* Line Numbers */}
                        <div className="flex w-16 shrink-0 select-none items-center justify-end gap-2 border-r border-hairline bg-well/40 px-2 font-mono text-[10.5px] text-label-3">
                          <span className="w-6 text-right">{line.oldLineNumber || ""}</span>
                          <span className="w-6 text-right">{line.newLineNumber || ""}</span>
                        </div>

                        {/* Sign Indicator */}
                        <div className="flex w-6 shrink-0 select-none items-center justify-center font-mono font-bold">
                          {line.type === "add" && "+"}
                          {line.type === "delete" && "-"}
                          {line.type === "context" && " "}
                        </div>

                        {/* Line Code Content */}
                        <div className="flex-1 whitespace-pre px-2 py-0.5 font-mono overflow-x-auto">
                          {line.content || " "}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-center p-8 text-label-3">
                  <div>
                    <CheckCircle2 className="mx-auto size-8 mb-2 opacity-50" />
                    <p className="text-[13px] font-medium text-label">Değişiklik Bulunmuyor</p>
                    <p className="text-[12px] mt-1">Kodunuzda düzenleme yaptığınızda satır satır fark burada görünür.</p>
                  </div>
                </div>
              )
            ) : (
              /* Commit History (Git Log) */
              <div className="space-y-3 max-w-2xl mx-auto">
                {commits.map((commit, idx) => (
                  <div
                    key={commit.hash}
                    className="relative rounded-[16px] border border-hairline bg-surface p-4 shadow-mac-xs space-y-2 hover:border-hairline-strong transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded-full bg-well text-label font-mono text-[11px] font-bold border border-hairline">
                          ●
                        </span>
                        <h4 className="text-[13.5px] font-semibold text-label">
                          {commit.message}
                        </h4>
                      </div>

                      <span className="pill bg-well border border-hairline font-mono text-[11px] text-label-3 shrink-0">
                        {commit.shortHash}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11.5px] text-label-3 font-mono pt-1">
                      <div className="flex items-center gap-3">
                        <span>{commit.author}</span>
                        <span>•</span>
                        <span>{new Date(commit.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <GitBranch className="size-3" />
                        <span>{commit.branch}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
