"use client";

import * as React from "react";
import {
  Braces,
  CheckCircle2,
  Code2,
  GitBranch,
  GitCommit as GitCommitIcon,
  Maximize2,
  RotateCcw,
  UploadCloud,
  Clock,
  ExternalLink,
} from "lucide-react";
import { GitCommit, GitFileChange } from "@/types/git";
import { AuthState } from "@/lib/supabase-auth";
import { ConfirmMorph } from "@/components/arc/confirm-morph/confirm-morph";
import { cn } from "@/lib/utils";

interface GitSidebarPanelProps {
  currentBranch: string;
  branches: string[];
  commits: GitCommit[];
  changes: GitFileChange[];
  authState: AuthState;
  onOpenAuthModal: () => void;
  onCommit: (message: string) => void;
  onPush: () => Promise<void> | Promise<boolean> | void;
  onDiscardChange: (filename: "styles.css" | "index.html") => void;
  onSelectFile: (fileId: string) => void;
  onOpenFullScreen: () => void;
}

const CONVENTIONAL_PREFIXES = [
  { label: "feat:", hint: "Yeni stil veya bileşen özelliği" },
  { label: "fix:", hint: "Piksel veya CSS hata düzeltmesi" },
  { label: "style:", hint: "Kod düzeni ve CSS formatlama" },
];

export function GitSidebarPanel({
  currentBranch,
  commits,
  changes,
  authState,
  onOpenAuthModal,
  onCommit,
  onPush,
  onDiscardChange,
  onSelectFile,
  onOpenFullScreen,
}: GitSidebarPanelProps) {
  const [commitMessage, setCommitMessage] = React.useState("");
  const [isPushing, setIsPushing] = React.useState(false);
  const [pushSuccess, setPushSuccess] = React.useState(false);

  const handleCommitSubmit = () => {
    if (!commitMessage.trim() || changes.length === 0) return;
    onCommit(commitMessage.trim());
    setCommitMessage("");
  };

  const handlePushClick = async () => {
    setIsPushing(true);
    try {
      await onPush();
      setPushSuccess(true);
      setTimeout(() => setPushSuccess(false), 3000);
    } finally {
      setIsPushing(false);
    }
  };

  const handleApplyPrefix = (prefix: string) => {
    if (!commitMessage.startsWith(prefix)) {
      setCommitMessage(`${prefix} ${commitMessage.replace(/^(feat|fix|style|refactor|test|chore):\s*/, "")}`);
    }
  };

  return (
    <div className="flex h-full flex-col px-3 pb-3 text-label select-none overflow-y-auto">
      {/* Branch & Fullscreen Toolbar Header */}
      <div className="flex items-center justify-between py-2 border-b border-hairline">
        <div className="flex items-center gap-1.5 min-w-0">
          <GitBranch className="size-3.5 text-label-2 shrink-0" />
          <span className="text-[12px] font-mono font-medium truncate text-label">
            {currentBranch}
          </span>
          {changes.length > 0 && (
            <span className="pill bg-well border border-hairline text-label-3 font-mono text-[9.5px] px-1.5 py-0.2">
              {changes.length} değişti
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenFullScreen}
          title="Tam Ekran Git Görünümünü Aç"
          className="flex size-6 items-center justify-center rounded-[6px] text-label-3 hover:text-label hover:bg-fill transition-colors cursor-pointer"
        >
          <Maximize2 className="size-3.5" />
        </button>
      </div>

      {/* Commit Composer Section */}
      <div className="py-3 space-y-2 border-b border-hairline">
        {/* Conventional prefix buttons */}
        <div className="flex items-center gap-1">
          {CONVENTIONAL_PREFIXES.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handleApplyPrefix(p.label)}
              title={p.hint}
              className="rounded-[6px] border border-hairline bg-well/80 px-1.5 py-0.5 font-mono text-[10px] text-label-3 hover:text-label hover:bg-fill transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Commit Message Box */}
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
            placeholder="Commit mesajı yaz... (Ctrl+Enter)"
            rows={2}
            className="w-full rounded-[10px] border border-hairline bg-well p-2 text-[11.5px] font-mono text-label placeholder:text-label-3 outline-none resize-none focus:border-tint transition-all"
          />
        </div>

        {/* Commit & Push Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCommitSubmit}
            disabled={!commitMessage.trim() || changes.length === 0}
            className="flex-1 mac-btn mac-btn-primary h-7 text-[11.5px] font-medium gap-1.5 disabled:opacity-40 cursor-pointer"
            title="Değişiklikleri yerel repoya kaydet"
          >
            <GitCommitIcon className="size-3.5" />
            <span>Commit ({changes.length})</span>
          </button>

          <button
            type="button"
            onClick={authState.isAuthenticated ? handlePushClick : onOpenAuthModal}
            disabled={isPushing}
            className={cn(
              "mac-btn mac-btn-secondary h-7 px-2 text-[11px] font-medium gap-1 cursor-pointer",
              pushSuccess && "text-label font-semibold"
            )}
            title={authState.isAuthenticated ? "origin/main hedefine pushla" : "GitHub Hesabını Bağla"}
          >
            {isPushing ? (
              <span className="size-3 animate-spin rounded-full border border-label-3 border-t-label" />
            ) : pushSuccess ? (
              <CheckCircle2 className="size-3.5 text-label" />
            ) : (
              <UploadCloud className="size-3.5" />
            )}
            <span>{isPushing ? "..." : pushSuccess ? "OK" : "Push"}</span>
          </button>
        </div>
      </div>

      {/* Changes List Section */}
      <div className="py-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[10.5px] uppercase font-mono tracking-wider text-label-3">
          <span>Değişen Dosyalar ({changes.length})</span>
          {changes.length === 0 && <span>Tertemiz</span>}
        </div>

        {changes.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-hairline bg-well/40 p-3 text-center">
            <p className="text-[11.5px] text-label-2 font-mono">Çalışma ağacı temiz</p>
            <p className="text-[10px] text-label-3 mt-0.5">
              Kod yazdığınızda anında burada listelenir.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {changes.map((change) => {
              const isCss = change.filename.endsWith(".css");
              return (
                <div
                  key={change.filename}
                  onClick={() => onSelectFile(change.filename)}
                  className="group flex items-center justify-between rounded-[8px] border border-hairline/60 bg-well/60 px-2 py-1.5 text-[11.5px] font-mono hover:bg-well hover:border-hairline transition-colors cursor-pointer"
                  title={`${change.filename} dosyasına odaklan`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isCss ? (
                      <Braces className="size-3.5 text-label-3 shrink-0" />
                    ) : (
                      <Code2 className="size-3.5 text-label-3 shrink-0" />
                    )}
                    <span className="truncate text-label">{change.filename}</span>
                    <span className="pill bg-fill text-label-3 text-[9px] px-1 py-0.2 font-bold">
                      M
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-label-3 font-mono">
                      +{change.additions} -{change.deletions}
                    </span>

                    {/* Discard Change action */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="flex items-center ml-1"
                    >
                      <ConfirmMorph
                        label=""
                        icon={<RotateCcw className="size-3" />}
                        prompt="Geri al?"
                        cancelLabel="İptal"
                        confirmLabel="Geri Al"
                        pendingLabel="..."
                        doneLabel="Alındı"
                        tone="neutral"
                        confirmTimeout={4000}
                        resultTimeout={400}
                        className="file-tree-confirm git-discard-confirm"
                        onConfirm={async () => {
                          onDiscardChange(change.filename as "styles.css" | "index.html");
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Commits Mini History */}
      <div className="pt-2.5 mt-auto border-t border-hairline space-y-1.5">
        <div className="flex items-center justify-between text-[10.5px] uppercase font-mono tracking-wider text-label-3">
          <span>Son Commit&apos;ler</span>
          <button
            type="button"
            onClick={onOpenFullScreen}
            className="text-[10px] font-mono text-label-2 hover:text-label flex items-center gap-1 cursor-pointer"
            title="Tüm commit geçmişini tam ekranda aç"
          >
            <span>Tümü</span>
            <ExternalLink className="size-2.5" />
          </button>
        </div>

        <div className="space-y-1">
          {commits.slice(0, 2).map((commit) => (
            <div
              key={commit.hash}
              onClick={onOpenFullScreen}
              className="rounded-[8px] border border-hairline/50 bg-well/40 p-2 text-[11px] font-mono hover:bg-well transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-label-3 text-[10px] mb-0.5">
                <span className="font-semibold text-label-2">{commit.shortHash}</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-2.5" />
                  {new Date(commit.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="truncate text-label text-[11px]">{commit.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GitSidebarPanel;
