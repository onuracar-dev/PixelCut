"use client";

import * as React from "react";
import {
  BookOpen,
  Code2,
  FileCode,
  GitBranch,
  Image as ImageIcon,
  Monitor,
  Moon,
  Radio,
  Settings,
  Smartphone,
  SplitSquareVertical,
  Sun,
  Swords,
  Terminal as TerminalIcon,
  Trophy,
} from "lucide-react";
import {
  Dock,
  DockDivider,
  DockIcon,
  DockItem,
  DockLabel,
} from "@/components/motion-primitives/dock";
import { useAppearance } from "@/lib/appearance";
import { cn } from "@/lib/utils";

interface AppDockProps {
  activeFile?: string | null;
  onSelectFile: (file: string) => void;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  isGuidelineOpen: boolean;
  onToggleGuideline: () => void;
  previewMode?: "desktop" | "mobile" | "diff";
  onSetPreviewMode?: (mode: "desktop" | "mobile" | "diff") => void;
  onTogglePreviewMode?: () => void;
  liveStudentsCount?: number;
  helpRequestsCount?: number;
  gitChangesCount?: number;
  currentBranch?: string;
  className?: string;
  position?: "header" | "bottom";
}

export function AppDock({
  activeFile,
  onSelectFile,
  isTerminalOpen,
  onToggleTerminal,
  isGuidelineOpen,
  onToggleGuideline,
  previewMode = "desktop",
  onSetPreviewMode,
  onTogglePreviewMode,
  liveStudentsCount = 15,
  helpRequestsCount = 0,
  gitChangesCount = 0,
  currentBranch = "main",
  className,
  position = "header",
}: AppDockProps) {
  const { resolved, setAppearance } = useAppearance();
  const isHeader = position === "header";
  const labelSide: "top" | "bottom" = isHeader ? "bottom" : "top";
  const iconSize = isHeader ? "size-3.5" : "size-5";

  // Unified sleek charcoal-gray aesthetic for all dock items
  const getIconBoxClass = (isActive: boolean) =>
    cn(
      "grid size-full place-items-center transition-colors duration-150",
      isHeader ? "rounded-[6px]" : "rounded-[8px]",
      isActive
        ? "bg-fill text-label border border-hairline shadow-mac-xs font-semibold"
        : "bg-transparent text-label-2 hover:bg-fill-2 hover:text-label"
    );

  // Toggle handler for files & full-view panels (radar, leaderboard, settings, target, html)
  const handleSelectFile = (file: string) => {
    if (activeFile === file) {
      onSelectFile("");
    } else {
      onSelectFile(file);
    }
  };

  // Toggle handler for preview modes (desktop, mobile, diff)
  const handleSetPreviewMode = (mode: "desktop" | "mobile" | "diff") => {
    if (!onSetPreviewMode) return;
    // If coming from another panel like radar or settings, make sure we return to editor
    if (activeFile !== "styles.css" && activeFile !== "index.html") {
      onSelectFile("styles.css");
    }

    if (previewMode === mode && mode !== "desktop") {
      // Toggle off back to default desktop tuval
      onSetPreviewMode("desktop");
    } else {
      onSetPreviewMode(mode);
    }
  };

  return (
    <div
      className={cn(
        isHeader
          ? "flex items-center justify-center app-region-no-drag"
          : "fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-auto",
        className
      )}
    >
      <Dock
        magnification={isHeader ? 46 : 70}
        distance={isHeader ? 75 : 130}
        panelHeight={isHeader ? 36 : 52}
        className={cn(
          isHeader
            ? "shadow-mac-xs border border-hairline/80 bg-surface/85 dark:bg-[#18181b]/85 backdrop-blur-xl px-2 py-0.5 rounded-[12px] h-[36px]"
            : "shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.55)] border-hairline bg-surface/85 backdrop-blur-2xl px-3.5 py-1.5 rounded-[22px]"
        )}
      >
        {/* CSS Editor */}
        <DockItem
          onClick={() => handleSelectFile("styles.css")}
          isActive={activeFile === "styles.css"}
        >
          <DockLabel side={labelSide}>PixelCut CSS (styles.css)</DockLabel>
          <DockIcon>
            <div className={getIconBoxClass(activeFile === "styles.css")}>
              <FileCode className={iconSize} />
            </div>
          </DockIcon>
        </DockItem>

        {/* HTML Template */}
        <DockItem
          onClick={() => handleSelectFile("index.html")}
          isActive={activeFile === "index.html"}
        >
          <DockLabel side={labelSide}>HTML Şablonu (index.html)</DockLabel>
          <DockIcon>
            <div className={getIconBoxClass(activeFile === "index.html")}>
              <Code2 className={iconSize} />
            </div>
          </DockIcon>
        </DockItem>

        {/* Target Image Reference */}
        <DockItem
          onClick={() => handleSelectFile("target.png")}
          isActive={activeFile === "target.png"}
        >
          <DockLabel side={labelSide}>Hedef Tasarım (target.png)</DockLabel>
          <DockIcon>
            <div className={getIconBoxClass(activeFile === "target.png")}>
              <ImageIcon className={iconSize} />
            </div>
          </DockIcon>
        </DockItem>

        <DockDivider className={isHeader ? "h-3.5 mx-0.5" : "h-6 mx-1"} />

        {/* Direct Preview Mode Items: Tuval / iPhone / Perde */}
        {onSetPreviewMode ? (
          <>
            <DockItem
              onClick={() => handleSetPreviewMode("desktop")}
              isActive={previewMode === "desktop"}
            >
              <DockLabel side={labelSide}>Masaüstü Tuval</DockLabel>
              <DockIcon>
                <div className={getIconBoxClass(previewMode === "desktop")}>
                  <Monitor className={iconSize} />
                </div>
              </DockIcon>
            </DockItem>

            <DockItem
              onClick={() => handleSetPreviewMode("mobile")}
              isActive={previewMode === "mobile"}
            >
              <DockLabel side={labelSide}>Mobil iPhone</DockLabel>
              <DockIcon>
                <div className={getIconBoxClass(previewMode === "mobile")}>
                  <Smartphone className={iconSize} />
                </div>
              </DockIcon>
            </DockItem>

            <DockItem
              onClick={() => handleSetPreviewMode("diff")}
              isActive={previewMode === "diff"}
            >
              <DockLabel side={labelSide}>Perde (Karşılaştırma)</DockLabel>
              <DockIcon>
                <div className={getIconBoxClass(previewMode === "diff")}>
                  <SplitSquareVertical className={iconSize} />
                </div>
              </DockIcon>
            </DockItem>
          </>
        ) : onTogglePreviewMode ? (
          <DockItem onClick={onTogglePreviewMode}>
            <DockLabel side={labelSide}>
              {previewMode === "desktop"
                ? "Mobil Önizlemeye Geç"
                : previewMode === "mobile"
                ? "Perde Moduna Geç"
                : "Masaüstü Tuvale Geç"}
            </DockLabel>
            <DockIcon>
              <div className={getIconBoxClass(false)}>
                {previewMode === "desktop" ? (
                  <Smartphone className={iconSize} />
                ) : previewMode === "mobile" ? (
                  <SplitSquareVertical className={iconSize} />
                ) : (
                  <Monitor className={iconSize} />
                )}
              </div>
            </DockIcon>
          </DockItem>
        ) : null}

        <DockDivider className={isHeader ? "h-3.5 mx-0.5" : "h-6 mx-1"} />

        {/* Terminal Toggle */}
        <DockItem onClick={onToggleTerminal} isActive={isTerminalOpen}>
          <DockLabel side={labelSide}>{isTerminalOpen ? "Terminali Kapat (~)" : "Terminali Aç (~)"}</DockLabel>
          <DockIcon>
            <div className={getIconBoxClass(isTerminalOpen)}>
              <TerminalIcon className={iconSize} />
            </div>
          </DockIcon>
        </DockItem>

        {/* Live Classroom Radar */}
        <DockItem
          onClick={() => handleSelectFile("classroom.radar")}
          isActive={activeFile === "classroom.radar"}
        >
          <DockLabel side={labelSide}>
            {helpRequestsCount && helpRequestsCount > 0
              ? `🚨 Canlı Sınıf Radarı (${helpRequestsCount} Yardım Talebi!)`
              : `Canlı Sınıf Radarı (${liveStudentsCount} Çevrimiçi)`}
          </DockLabel>
          <DockIcon>
            <div className={cn("relative", getIconBoxClass(activeFile === "classroom.radar"))}>
              <Radio className={iconSize} />
              <span className={cn("absolute flex", isHeader ? "top-0.5 right-0.5 size-1.5" : "top-1 right-1 size-2")}>
                <span
                  className={cn(
                    "absolute inline-flex size-full animate-ping rounded-full opacity-60",
                    helpRequestsCount && helpRequestsCount > 0 ? "bg-label-3" : "bg-label/30"
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex rounded-full",
                    helpRequestsCount && helpRequestsCount > 0 ? "bg-label-2" : "bg-label",
                    isHeader ? "size-1" : "size-1.5"
                  )}
                />
              </span>
            </div>
          </DockIcon>
        </DockItem>

        {/* Ders İçi: Canlı Lab Odaları */}
        <DockItem
          onClick={() => handleSelectFile("challenges.inclass")}
          isActive={activeFile === "challenges.inclass" || activeFile === "challenges.rooms"}
        >
          <DockLabel side={labelSide}>Ders İçi (Canlı Lab Odaları)</DockLabel>
          <DockIcon>
            <div className={getIconBoxClass(activeFile === "challenges.inclass" || activeFile === "challenges.rooms")}>
              <BookOpen className={iconSize} />
            </div>
          </DockIcon>
        </DockItem>

        {/* Ders Dışı: CSSBattle Arenası */}
        <DockItem
          onClick={() => handleSelectFile("challenges.practice")}
          isActive={activeFile === "challenges.practice"}
        >
          <DockLabel side={labelSide}>Ders Dışı (CSSBattle Arenası)</DockLabel>
          <DockIcon>
            <div className={getIconBoxClass(activeFile === "challenges.practice")}>
              <Swords className={iconSize} />
            </div>
          </DockIcon>
        </DockItem>

        {/* Leaderboard Rank */}
        <DockItem
          onClick={() => handleSelectFile("leaderboard.rank")}
          isActive={activeFile === "leaderboard.rank"}
        >
          <DockLabel side={labelSide}>Mühendislik Sıralaması</DockLabel>
          <DockIcon>
            <div className={getIconBoxClass(activeFile === "leaderboard.rank")}>
              <Trophy className={iconSize} />
            </div>
          </DockIcon>
        </DockItem>

        {/* GitHub / Git Source Control */}
        <DockItem
          onClick={() => handleSelectFile("git.sourcecontrol")}
          isActive={activeFile === "git.sourcecontrol"}
        >
          <DockLabel side={labelSide}>
            {gitChangesCount > 0
              ? `GitHub Kaynak Denetimi (${gitChangesCount} Değişiklik)`
              : `GitHub & Git (${currentBranch})`}
          </DockLabel>
          <DockIcon>
            <div className={cn("relative", getIconBoxClass(activeFile === "git.sourcecontrol"))}>
              <GitBranch className={iconSize} />
              {gitChangesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid min-w-3 h-3 place-items-center rounded-full bg-well border border-hairline px-0.5 text-[8.5px] font-mono font-semibold text-label">
                  {gitChangesCount}
                </span>
              )}
            </div>
          </DockIcon>
        </DockItem>

        {/* Guideline Drawer */}
        <DockItem onClick={onToggleGuideline} isActive={isGuidelineOpen}>
          <DockLabel side={labelSide}>Görev Yönergesi & İpuçları</DockLabel>
          <DockIcon>
            <div className={getIconBoxClass(isGuidelineOpen)}>
              <BookOpen className={iconSize} />
            </div>
          </DockIcon>
        </DockItem>

        <DockDivider className={isHeader ? "h-3.5 mx-0.5" : "h-6 mx-1"} />

        {/* Settings View */}
        <DockItem
          onClick={() => handleSelectFile("settings.config")}
          isActive={activeFile === "settings.config"}
        >
          <DockLabel side={labelSide}>Sistem Ayarları</DockLabel>
          <DockIcon>
            <div className={getIconBoxClass(activeFile === "settings.config")}>
              <Settings className={iconSize} />
            </div>
          </DockIcon>
        </DockItem>

        {/* Dark / Light Theme Toggle */}
        <DockItem
          onClick={() => setAppearance(resolved === "dark" ? "light" : "dark")}
        >
          <DockLabel side={labelSide}>
            {resolved === "dark" ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
          </DockLabel>
          <DockIcon>
            <div className={getIconBoxClass(false)}>
              {resolved === "dark" ? (
                <Sun className={iconSize} />
              ) : (
                <Moon className={iconSize} />
              )}
            </div>
          </DockIcon>
        </DockItem>
      </Dock>
    </div>
  );
}

export default AppDock;
