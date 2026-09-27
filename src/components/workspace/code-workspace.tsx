"use client";

import * as React from "react";
import Editor from "@monaco-editor/react";
import confetti from "canvas-confetti";
import {
  BookOpen,
  CheckCircle2,
  FileCode,
  Flame,
  HelpCircle,
  Maximize2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Challenge } from "@/types";
import { analyzeCssHygiene, CssAnalysisResult } from "@/lib/css-analyzer";
import { DiffSlider } from "./diff-slider";
import { TeacherSubmitButton } from "../mac-ide/teacher-submit-button";
import { CurveDrawer } from "../ui/curve-drawer";

interface CodeWorkspaceProps {
  challenge: Challenge;
  initialHtml?: string;
  initialCss?: string;
  onCodeChange?: (html: string, css: string, analysis: CssAnalysisResult) => void;
  onSubmitSuccess?: () => void;
}

export function CodeWorkspace({
  challenge,
  initialHtml,
  initialCss,
  onCodeChange,
  onSubmitSuccess,
}: CodeWorkspaceProps) {
  const [activeTab, setActiveTab] = React.useState<"html" | "css">("html");
  const [htmlCode, setHtmlCode] = React.useState<string>(
    initialHtml || challenge.starterHtml
  );
  const [cssCode, setCssCode] = React.useState<string>(
    initialCss || challenge.starterCss
  );
  const [analysis, setAnalysis] = React.useState<CssAnalysisResult>(() =>
    analyzeCssHygiene(htmlCode, cssCode)
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);

  // Re-run hygiene check whenever code changes without loop
  const onCodeChangeRef = React.useRef(onCodeChange);
  React.useEffect(() => {
    onCodeChangeRef.current = onCodeChange;
  }, [onCodeChange]);

  React.useEffect(() => {
    const res = analyzeCssHygiene(htmlCode, cssCode);
    setAnalysis(res);
    onCodeChangeRef.current?.(htmlCode, cssCode, res);
  }, [htmlCode, cssCode]);

  const handleSubmitComplete = () => {
    // If clean score > 80, celebrate with confetti
    if (analysis.cleanScore >= 75) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#06b6d4", "#f59e0b"],
      });
    }
    onSubmitSuccess?.();
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#09090b]">
      {/* Top Workspace Header */}
      <header className="flex h-14 items-center justify-between border-b border-white/8 bg-[#121216] px-5">
        {/* Left: Challenge Title & Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
              {challenge.title}
            </h2>
          </div>
          <span className="rounded-md border border-white/8 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-zinc-400">
            {challenge.difficulty}
          </span>
          <span className="rounded-md border border-emerald-500/20 bg-emerald-950/30 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
            {challenge.category}
          </span>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
          >
            <BookOpen className="size-3.5" />
            <span>Yönerge & İpuçları</span>
          </button>
        </div>

        {/* Center: Live Hygiene Metrics */}
        <div className="hidden lg:flex items-center gap-4 rounded-xl border border-white/5 bg-zinc-950/60 px-4 py-1.5 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="text-zinc-500">CSS Satırı:</span>
            <span className={analysis.totalLines > 200 ? "text-amber-400" : "text-zinc-200"}>
              {analysis.totalLines} satır
            </span>
          </div>

          <div className="h-3 w-px bg-white/10" />

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Gereksiz Kod:</span>
            <span
              className={
                analysis.isBloated ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"
              }
            >
              %{analysis.unusedPercent}
            </span>
          </div>

          <div className="h-3 w-px bg-white/10" />

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Temizlik Skoru:</span>
            <span className="text-emerald-400 font-bold">
              {analysis.cleanScore}/100
            </span>
          </div>
        </div>

        {/* Right: Quick actions & Scan submit button trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setHtmlCode(challenge.starterHtml);
              setCssCode(challenge.starterCss);
            }}
            title="Kodu Sıfırla"
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </header>

      {/* Main Split Body: Editor Left, Diff Slider & Scanner Right */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/8 overflow-hidden">
        {/* Left Column: Monaco Code Editor */}
        <div className="flex flex-col h-full bg-[#0c0c0f]">
          {/* File Tab Selector */}
          <div className="flex items-center justify-between border-b border-white/8 bg-[#121216] px-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("html")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-mono transition-colors ${
                  activeTab === "html"
                    ? "border-emerald-400 bg-white/5 text-zinc-100 font-medium"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileCode className="size-3.5 text-orange-400" />
                <span>index.html</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("css")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-mono transition-colors ${
                  activeTab === "css"
                    ? "border-cyan-400 bg-white/5 text-zinc-100 font-medium"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileCode className="size-3.5 text-cyan-400" />
                <span>style.css</span>
                {analysis.isBloated && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            </div>

            <div className="pr-3 text-[11px] font-mono text-zinc-500">
              {activeTab === "html" ? "HTML5 Yapısı" : "Saf CSS Stilleri"}
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="relative flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language={activeTab === "html" ? "html" : "css"}
              value={activeTab === "html" ? htmlCode : cssCode}
              onChange={(value) => {
                if (activeTab === "html") setHtmlCode(value || "");
                else setCssCode(value || "");
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "var(--font-geist-mono), JetBrains Mono, monospace",
                fontLigatures: true,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                tabSize: 2,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Bottom Code Warnings/Hints */}
          {analysis.warnings.length > 0 && (
            <div className="border-t border-white/8 bg-amber-950/20 px-4 py-2 text-xs text-amber-300">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <ShieldAlert className="size-3.5 text-amber-400 shrink-0" />
                <span>{analysis.warnings[0]}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Diff Preview + Document Scanner Submit */}
        <div className="flex flex-col h-full overflow-y-auto bg-[#09090b] p-5 gap-5">
          {/* Visual Diff Tool with Perde & Ghost Mode */}
          <div className="w-full">
            <DiffSlider
              studentHtml={htmlCode}
              studentCss={cssCode}
              targetImageUrl={challenge.targetImageUrl}
              height={420}
            />
          </div>

          {/* Scanning & Submission Section */}
          <div className="mt-auto rounded-2xl border border-white/8 bg-[#121216] p-6 shadow-xl">
            <div className="mb-2 text-center">
              <h3 className="text-sm font-semibold tracking-tight text-zinc-200">
                Görevi Tamamla ve Değerlendirmeye Gönder
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Kodunuz taranacak, şablon şişkinliği incelenecek ve hocanızın ekranına anlık düşecek.
              </p>
            </div>

            <div className="flex justify-center py-2">
              <TeacherSubmitButton
                onComplete={handleSubmitComplete}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Curve Drawer for Instructions & Specifications */}
      <CurveDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={challenge.title}
        subtitle={`Kategori: ${challenge.category} | Zorluk: ${challenge.difficulty}`}
        side="right"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
              Hedef ve Yönerge
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {challenge.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
              Dikkat Edilmesi Gereken Kurallar
            </h4>
            <ul className="mt-2 space-y-2 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Koca Bootstrap dosyasını doğrudan yapıştırmayın. Sadece bu bileşene ait CSS kurallarını ayıklayın.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Gereksiz class ve ID'leri temizleyin, modern CSS özelliklerinden (Flexbox, Grid) yararlanın.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Piksel benzerliğini %90'ın üzerinde tutmaya özen gösterin.</span>
              </li>
            </ul>
          </div>

          {challenge.hints.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
                İpuçları
              </h4>
              <div className="mt-2 space-y-2">
                {challenge.hints.map((hint, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-zinc-300"
                  >
                    💡 {hint}
                  </div>
                ))}
              </div>
            </div>
          )}

          {challenge.maxLinesGoal && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
              <div className="text-xs font-semibold text-emerald-400 font-mono">
                Maksimum Satır Hedefi
              </div>
              <p className="mt-1 text-xs text-zinc-300">
                Bu bileşeni en fazla <span className="font-bold text-emerald-300 font-mono">{challenge.maxLinesGoal} satırda</span> temizlemeyi başarırsanız Clean Slicer rozeti kazanırsınız.
              </p>
            </div>
          )}
        </div>
      </CurveDrawer>
    </div>
  );
}
