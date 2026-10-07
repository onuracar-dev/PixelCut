"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
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
    if (diffSec < 5) return "şimdi";
    if (diffSec < 60) return `${diffSec}sn önce`;
    const min = Math.floor(diffSec / 60);
    const sec = diffSec % 60;
    return `${min}dk ${sec}sn önce`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={`w-full rounded-xl border border-hairline bg-surface/95 backdrop-blur-xl p-2.5 sm:p-3 shadow-mac-sm text-label select-none ${
          className || ""
        }`}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between gap-2 pb-2 text-[11.5px]">
          <div className="flex items-center gap-2 text-label-2">
            <History className="size-3.5 text-label-3" />
            <span className="font-medium text-label">Kod Geçmişi</span>
            <span className="font-mono text-label-3 text-[10.5px]">
              {totalCount > 0 ? `${currentIndex + 1}/${totalCount}` : "0"}
            </span>
            {currentSnapshot && (
              <span className="text-[11px] text-label-3">
                • {formatElapsed(currentSnapshot.timestamp)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {!isLive && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playTap();
                  onJumpToLive();
                }}
                className="mac-btn mac-btn-secondary h-[22px] px-2 text-[11px] text-label-2 hover:text-label transition-colors cursor-pointer"
                title="Güncel canlı koda dön"
              >
                Canlıya Dön
              </button>
            )}

            <button
              type="button"
              onClick={toggleMute}
              className="size-6 rounded flex items-center justify-center text-label-3 hover:text-label hover:bg-well transition-colors cursor-pointer"
              title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
            >
              {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playTap();
                onClose();
              }}
              className="size-6 rounded flex items-center justify-center text-label-3 hover:text-label hover:bg-well transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Minimal Scrubber Bar */}
        <div className="py-1 px-0.5">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalCount - 1)}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full h-1 rounded-full appearance-none cursor-pointer bg-hairline-strong accent-label focus:outline-none"
          />
        </div>

        {/* Minimal Controls Row */}
        <div className="flex items-center justify-between gap-2 pt-1.5">
          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={stepBackward}
              className="size-7 rounded-lg flex items-center justify-center text-label-2 hover:text-label hover:bg-well disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Önceki"
            >
              <SkipBack className="size-3" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="size-7 rounded-lg flex items-center justify-center bg-well hover:bg-well/80 border border-hairline text-label transition-colors cursor-pointer"
              title={isPlaying ? "Durdur" : "Oynat"}
            >
              {isPlaying ? (
                <Pause className="size-3 fill-current" />
              ) : (
                <Play className="size-3 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              disabled={currentIndex >= totalCount - 1}
              onClick={stepForward}
              className="size-7 rounded-lg flex items-center justify-center text-label-2 hover:text-label hover:bg-well disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Sonraki"
            >
              <SkipForward className="size-3" />
            </button>

            {/* Speed Multiplier */}
            <div className="flex items-center gap-0.5 ml-1.5 p-0.5 rounded-md bg-well border border-hairline text-[10.5px] font-mono">
              {([1, 2, 4] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    soundEffects.playTap();
                    setPlaybackSpeed(spd);
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                    playbackSpeed === spd
                      ? "bg-surface text-label font-semibold shadow-mac-xs"
                      : "text-label-3 hover:text-label"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Rollback Action */}
          <div>
            {!isLive && currentSnapshot && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playRollback();
                  onRollback(currentSnapshot);
                }}
                className="mac-btn mac-btn-secondary h-[24px] px-2.5 text-[11px] gap-1.5 text-label hover:text-white transition-colors cursor-pointer"
                title="Mevcut editör kodunu bu ana geri yükler"
              >
                <RotateCcw className="size-3 text-label-2" />
                <span>Bu Koda Dön</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
