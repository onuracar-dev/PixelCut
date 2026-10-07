"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  History,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { soundEffects } from "@/lib/sound-effects";

export interface CodeSnapshot {
  id: string;
  timestamp: number;
  html: string;
  css: string;
  linesCount: number;
  label?: string;
}

export interface TimeTravelReplayProps {
  snapshots: CodeSnapshot[];
  currentIndex: number;
  isOpen: boolean;
  isLive: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  onRollback: (snapshot: CodeSnapshot) => void;
  onJumpToLive: () => void;
  className?: string;
}

export function TimeTravelReplay({
  snapshots,
  currentIndex,
  isOpen,
  isLive,
  onClose,
  onIndexChange,
  onRollback,
  onJumpToLive,
  className,
}: TimeTravelReplayProps) {
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState<1 | 2 | 4>(1);
  const [isMuted, setIsMuted] = React.useState<boolean>(() => soundEffects.isMuted());

  const currentSnapshot = snapshots[currentIndex] ?? snapshots[snapshots.length - 1];
  const totalCount = snapshots.length;

  // Auto-play interval loop
  React.useEffect(() => {
    if (!isPlaying || totalCount <= 1) return;

    const intervalMs = Math.round(1100 / playbackSpeed);
    const timer = setInterval(() => {
      onIndexChange(
        currentIndex < totalCount - 1 ? currentIndex + 1 : 0
      );
      soundEffects.playScrubTick();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, totalCount, playbackSpeed, onIndexChange]);

  // Keyboard navigation when open
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBackward();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepForward();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, totalCount, isPlaying]);

  if (!isOpen) return null;

  const togglePlay = () => {
    soundEffects.playTap();
    setIsPlaying((prev) => !prev);
  };

  const stepBackward = () => {
    if (currentIndex > 0) {
      soundEffects.playScrubTick();
      onIndexChange(currentIndex - 1);
    }
  };

  const stepForward = () => {
    if (currentIndex < totalCount - 1) {
      soundEffects.playScrubTick();
      onIndexChange(currentIndex + 1);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextIdx = Number(e.target.value);
    soundEffects.playScrubTick();
    onIndexChange(nextIdx);
  };

  const toggleMute = () => {
    const next = soundEffects.toggleMute();
    setIsMuted(next);
  };

  const formatElapsed = (timestamp: number) => {
    const diffSec = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
    if (diffSec < 5) return "Az önce";
    if (diffSec < 60) return `${diffSec} sn önce`;
    const min = Math.floor(diffSec / 60);
    const sec = diffSec % 60;
    return `${min} dk ${sec} sn önce`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={`w-full rounded-2xl border border-hairline/80 bg-surface/90 backdrop-blur-2xl p-3 sm:p-4 shadow-mac-lg text-label select-none ${
          className || ""
        }`}
      >
        {/* Top Status & Info Bar */}
        <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-hairline/50 text-[12px]">
          <div className="flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded-lg bg-tint/15 text-tint">
              <History className="size-3.5" />
            </div>
            <span className="font-semibold tracking-tight text-label">
              Zaman Yolculuğu Replay
            </span>
            <span className="text-[11px] font-mono text-label-3 bg-well/70 px-2 py-0.5 rounded-full border border-hairline/40">
              {totalCount > 0 ? `${currentIndex + 1} / ${totalCount}` : "0"} kare
            </span>
            {currentSnapshot && (
              <span className="text-[11px] text-label-2 hidden md:inline">
                • {formatElapsed(currentSnapshot.timestamp)} ({new Date(currentSnapshot.timestamp).toLocaleTimeString("tr-TR")})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Live Indicator Button */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playTap();
                onJumpToLive();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                isLive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-well/60 text-label-3 hover:text-label hover:bg-well border border-hairline"
              }`}
              title="En son yazılan canlı koda dön"
            >
              <span
                className={`size-1.5 rounded-full ${
                  isLive ? "bg-emerald-400 animate-pulse" : "bg-label-3"
                }`}
              />
              <span>{isLive ? "CANLI KOD" : "Canlıya Dön"}</span>
            </button>

            {/* Sound Mute Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className="grid size-7 place-items-center rounded-lg text-label-3 hover:text-label hover:bg-well/60 transition-colors cursor-pointer"
              title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
            >
              {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </button>

            {/* Close Replay View */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playTap();
                onClose();
              }}
              className="grid size-7 place-items-center rounded-lg text-label-3 hover:text-label hover:bg-well/60 transition-colors cursor-pointer"
              title="Kapat (Esc)"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Scrubber Timeline Slider */}
        <div className="py-3 px-1 flex flex-col gap-1.5">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalCount - 1)}
              value={currentIndex}
              onChange={handleSliderChange}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-hairline-strong accent-tint focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-[10.5px] font-mono text-label-3 px-0.5">
            <span>İlk Kod (00:00)</span>
            <span className="text-tint font-medium">
              {currentSnapshot?.linesCount || 0} CSS Satırı
            </span>
            <span>Şimdi (Canlı)</span>
          </div>
        </div>

        {/* Bottom Playback Controls & Rollback Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-1.5">
            {/* Step Back */}
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={stepBackward}
              className="grid size-8 place-items-center rounded-xl bg-well/60 hover:bg-well text-label-2 hover:text-label disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Önceki Kare (Sol Ok)"
            >
              <SkipBack className="size-3.5" />
            </button>

            {/* Play / Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex items-center justify-center size-9 rounded-xl bg-label text-surface hover:opacity-90 shadow-mac-xs transition-transform active:scale-95 cursor-pointer"
              title={isPlaying ? "Durdur (Boşluk)" : "Oynat (Boşluk)"}
            >
              {isPlaying ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Step Forward */}
            <button
              type="button"
              disabled={currentIndex >= totalCount - 1}
              onClick={stepForward}
              className="grid size-8 place-items-center rounded-xl bg-well/60 hover:bg-well text-label-2 hover:text-label disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Sonraki Kare (Sağ Ok)"
            >
              <SkipForward className="size-3.5" />
            </button>

            {/* Speed Multiplier */}
            <div className="flex items-center gap-0.5 ml-2 p-0.5 rounded-lg bg-well/60 border border-hairline/50 text-[11px] font-mono">
              {([1, 2, 4] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    soundEffects.playTap();
                    setPlaybackSpeed(spd);
                  }}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    playbackSpeed === spd
                      ? "bg-surface text-label font-bold shadow-mac-xs"
                      : "text-label-3 hover:text-label"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Right: Rollback / Restore Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!currentSnapshot}
              onClick={() => {
                if (currentSnapshot) {
                  soundEffects.playRollback();
                  onRollback(currentSnapshot);
                }
              }}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11.5px] font-semibold transition-all cursor-pointer shadow-mac-xs active:scale-98 disabled:opacity-40"
              title="Mevcut editördeki kodunuzu bu snapshot'taki kodla değiştirir"
            >
              <RotateCcw className="size-3.5" />
              <span>Bu Koda Geri Dön</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
