"use client";

import * as React from "react";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Eye,
  FileCode,
  Hand,
  Laptop,
  Maximize2,
  Pencil,
  RotateCcw,
  Sliders,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import { LiveAssistanceSession, StudentLiveState } from "@/types";
import { SegmentedControl } from "@/components/apple/segmented-control";
import { MobilePreviewFrame } from "@/components/mac-ide/mobile-preview-frame";
import { DiffSlider } from "@/components/workspace/diff-slider";
import { useAppearance } from "@/lib/appearance";
import { defineMonacoCustomThemes, getMonacoThemeName } from "@/lib/monaco-theme";
import { cn } from "@/lib/utils";

interface TeacherRemoteWorkspaceProps {
  session: LiveAssistanceSession;
  student: StudentLiveState;
  targetImageUrl: string;
  onUpdateStudentCode: (studentId: string, html: string, css: string) => void;
  onCloseSession: () => void;
  onGradeStudent?: (studentId: string, grade: number, feedback: string) => void;
  onCompleteAssistance?: (studentId: string) => void;
}

export function TeacherRemoteWorkspace({
  session,
  student,
  targetImageUrl,
  onUpdateStudentCode,
  onCloseSession,
  onGradeStudent,
  onCompleteAssistance,
}: TeacherRemoteWorkspaceProps) {
  const { resolved } = useAppearance();

  const [mode, setMode] = React.useState<"observe" | "assist">(session.mode);
  const [activeTab, setActiveTab] = React.useState<"styles.css" | "index.html">("styles.css");
  const [previewMode, setPreviewMode] = React.useState<"desktop" | "mobile" | "diff">("desktop");

  const [currentHtml, setCurrentHtml] = React.useState(student.html);
  const [currentCss, setCurrentCss] = React.useState(student.css);

  const [isGradingOpen, setIsGradingOpen] = React.useState(false);
  const [gradeInput, setGradeInput] = React.useState(student.grade || Math.round(student.visualMatch));
  const [feedbackInput, setFeedbackInput] = React.useState(student.teacherFeedback || "");

  // Keep synced if student prop updates externally
  React.useEffect(() => {
    setCurrentHtml(student.html);
    setCurrentCss(student.css);
  }, [student.html, student.css]);

  const handleCodeChange = (newVal: string | undefined) => {
    if (mode !== "assist") return;
    const value = newVal || "";
    if (activeTab === "styles.css") {
      setCurrentCss(value);
      onUpdateStudentCode(student.studentId, currentHtml, value);
    } else {
      setCurrentHtml(value);
      onUpdateStudentCode(student.studentId, value, currentCss);
    }
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGradeStudent?.(student.studentId, gradeInput, feedbackInput);
    setIsGradingOpen(false);
  };

  // Live sandboxed preview of the student's code (computed locally in 60fps)
  const remoteLiveSrcDoc = React.useMemo(() => {
    const defaultBg = resolved === "dark" ? "#18181b" : "#ffffff";
    const defaultColor = resolved === "dark" ? "#f5f5f7" : "#1d1d1f";

    return `
      <!DOCTYPE html>
      <html data-theme="${resolved}" style="color-scheme: ${resolved};">
        <head>
          <meta charset="utf-8">
          <style>
            @font-face {
              font-family: 'Geist';
              src: url('/fonts/geist/Geist-Variable.woff2') format('woff2');
              font-weight: 100 900;
              font-style: normal;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body, *, *::before, *::after { cursor: default; }
            html {
              height: 100%;
              width: 100%;
              background-color: transparent;
            }
            body { 
              font-family: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100%;
              width: 100%;
              background-color: ${defaultBg};
              color: ${defaultColor};
              padding: 24px;
            }
            ${currentCss}
          </style>
        </head>
        <body>
          ${currentHtml}
        </body>
      </html>
    `;
  }, [currentHtml, currentCss, resolved]);

  return (
    <div className="flex h-full w-full flex-col bg-window select-none overflow-hidden animate-in fade-in duration-200">
      {/* Top Remote Control Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-hairline bg-surface/85 px-4 backdrop-blur-xl z-20">
        {/* Left: Back & Student Card */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCloseSession}
            className="mac-btn mac-btn-secondary h-8 px-2.5 text-[12px] gap-1.5"
            title="Kullanıcılara Geri Dön"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Kullanıcılara Dön</span>
          </button>

          <div className="h-5 w-[1px] bg-hairline" />

          {/* Student Info */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={student.avatarUrl}
                alt={student.studentName}
                className="size-8 rounded-[10px] bg-fill object-cover shadow-mac-xs ring-1 ring-hairline"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex size-2">
                <span className="relative size-2 rounded-full border border-surface bg-label-3" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-label">
                  {student.studentName}
                </span>
                <span className="font-mono text-[11px] text-label-3">
                  ({student.studentNo})
                </span>

                {student.status === "needs_help" && (
                  <span className="pill bg-well border border-hairline text-label-2 text-[10.5px]">
                    <Hand className="size-3 text-label-3" />
                    <span>Yardım İstiyor</span>
                  </span>
                )}
              </div>

              {student.helpTopic && (
                <p className="text-[11px] text-label-3 font-normal truncate max-w-[280px]">
                  {student.helpTopic}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live Mode Switcher */}
        <div className="flex items-center gap-2.5">
          <SegmentedControl
            options={[
              {
                value: "observe",
                label: (
                  <span className="flex items-center gap-1.5 text-[12px]">
                    <Eye className="size-3.5 text-label-2" />
                    <span>Sessiz Gözlem</span>
                  </span>
                ),
              },
              {
                value: "assist",
                label: (
                  <span className="flex items-center gap-1.5 text-[12px]">
                    <Pencil className="size-3.5 text-label-2" />
                    <span>Canlı Müdahale</span>
                  </span>
                ),
              },
            ]}
            value={mode}
            onChange={(val) => setMode(val as any)}
            size="sm"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsGradingOpen(true)}
            className="mac-btn mac-btn-secondary h-8 px-3 text-[12px] gap-1.5 text-label"
          >
            <CheckCircle2 className="size-3.5 text-label-3" />
            <span>Not Ver</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onCompleteAssistance?.(student.studentId);
              onCloseSession();
            }}
            className="mac-btn mac-btn-primary h-8 px-3 text-[12px] gap-1.5 font-medium"
            title="Öğrencinin yardım talebini tamamla ve radara dön"
          >
            <CheckCircle2 className="size-3.5" />
            <span>Yardım Bitti</span>
          </button>
        </div>
      </header>

      {/* Main Two-Column Split Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Monaco Code Editor */}
        <div className="flex w-1/2 flex-col border-r border-hairline bg-surface/40">
          {/* File Tab Selector */}
          <div className="flex h-10 items-center justify-between border-b border-hairline bg-surface px-4">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("styles.css")}
                className={cn(
                  "flex items-center gap-2 rounded-[8px] px-3 py-1 text-[12px] font-mono transition-all",
                  activeTab === "styles.css"
                    ? "bg-well text-label font-medium shadow-mac-xs"
                    : "text-label-3 hover:text-label hover:bg-well/60"
                )}
              >
                <FileCode className="size-3.5" />
                <span>styles.css</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("index.html")}
                className={cn(
                  "flex items-center gap-2 rounded-[8px] px-3 py-1 text-[12px] font-mono transition-all",
                  activeTab === "index.html"
                    ? "bg-well text-label font-medium shadow-mac-xs"
                    : "text-label-3 hover:text-label hover:bg-well/60"
                )}
              >
                <Code2 className="size-3.5" />
                <span>index.html</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="relative flex-1">
            <Editor
              height="100%"
              beforeMount={defineMonacoCustomThemes}
              theme={getMonacoThemeName(resolved)}
              language={activeTab === "styles.css" ? "css" : "html"}
              value={activeTab === "styles.css" ? currentCss : currentHtml}
              onChange={handleCodeChange}
              options={{
                readOnly: mode === "observe",
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "var(--font-mono), JetBrains Mono, monospace",
                fontLigatures: true,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                tabSize: 2,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Editor Status Bar */}
          <div className="flex items-center justify-between border-t border-hairline bg-surface/80 px-4 py-1.5 text-[11px] font-mono text-label-3">
            <span>{student.linesCount} satır</span>
            <span>{activeTab === "styles.css" ? "CSS" : "HTML"} • UTF-8</span>
          </div>
        </div>

        {/* Right Column: Live Output & Previews */}
        <div className="dot-canvas relative flex w-1/2 flex-col overflow-hidden p-6">
          {/* Top Controls: Viewport toggles */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-medium text-label-3">
                Önizleme
              </span>
            </div>

            <SegmentedControl
              options={[
                {
                  value: "desktop",
                  label: (
                    <span className="flex items-center gap-1.5 text-[11.5px]">
                      <Laptop className="size-3.5" />
                      <span>Masaüstü</span>
                    </span>
                  ),
                },
                {
                  value: "mobile",
                  label: (
                    <span className="flex items-center gap-1.5 text-[11.5px]">
                      <Smartphone className="size-3.5" />
                      <span>Mobil</span>
                    </span>
                  ),
                },
                {
                  value: "diff",
                  label: (
                    <span className="flex items-center gap-1.5 text-[11.5px]">
                      <Sliders className="size-3.5" />
                      <span>Kıyasla (Diff)</span>
                    </span>
                  ),
                },
              ]}
              value={previewMode}
              onChange={(val) => setPreviewMode(val as any)}
              size="sm"
            />
          </div>

          {/* Canvas Render Area */}
          <div className="relative flex flex-1 items-center justify-center overflow-auto">
            {previewMode === "desktop" && (
              <div className="flex h-full w-full items-center justify-center">
                <div className="relative h-full w-full overflow-hidden rounded-[22px] border border-[var(--mac-hairline-strong)] bg-[var(--mac-surface)] shadow-mac-lg">
                  <iframe
                    srcDoc={remoteLiveSrcDoc}
                    sandbox="allow-scripts"
                    title="Öğrenci Canlı Tuval"
                    className="h-full w-full border-0"
                  />
                </div>
              </div>
            )}

            {previewMode === "mobile" && (
              <MobilePreviewFrame srcDoc={remoteLiveSrcDoc} />
            )}

            {previewMode === "diff" && (
              <div className="flex h-full w-full items-center justify-center">
                <DiffSlider
                  srcDoc={remoteLiveSrcDoc}
                  studentHtml={currentHtml}
                  studentCss={currentCss}
                  targetImageUrl={targetImageUrl}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grade / Feedback Modal */}
      {isGradingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-[22px] border border-hairline bg-surface p-6 shadow-mac-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-label">
                  {student.studentName} — Not & Değerlendirme
                </h3>
                <p className="text-[12px] text-label-2 mt-0.5 font-mono">
                  Öğrenci No: {student.studentNo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGradingOpen(false)}
                className="mac-icon-btn -mr-1 -mt-1"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-[12.5px] font-medium text-label-2 block mb-1.5">
                  Verilen Not (100 Üzerinden):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(Number(e.target.value))}
                    className="w-24 rounded-[8px] border border-hairline bg-well px-3 py-1.5 text-center font-mono text-[14px] font-semibold text-tint outline-none focus:border-tint"
                  />
                  <span className="text-[12px] text-label-3 font-mono">/ 100</span>
                </div>
              </div>

              <div>
                <label className="text-[12.5px] font-medium text-label-2 block mb-1.5">
                  Geri Bildirim / Eğitmen Yorumu:
                </label>
                <textarea
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Öğrencinin koduna dair notunuzu yazın..."
                  rows={3}
                  className="w-full rounded-[10px] border border-hairline bg-well p-2.5 text-[12px] text-label placeholder:text-label-3 outline-none resize-none focus:border-tint"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGradingOpen(false)}
                  className="mac-btn mac-btn-secondary text-[12.5px]"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="mac-btn mac-btn-primary text-[12.5px]"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Notu Kaydet ve Gönder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
