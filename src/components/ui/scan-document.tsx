"use client";

import type { TargetAndTransition, Transition } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScanStatus = "idle" | "scanning" | "done";

type ScanBarProps = {
  transition: Transition;
  z: number;
};

const SCAN_DURATION_MS = 3400;
const REDUCED_SCAN_DURATION_MS = 1000;
const SCAN_EXIT_DURATION_SECONDS = 0.4;
const REDUCED_SCAN_EXIT_DURATION_SECONDS = 0.2;
const DONE_RESET_DELAY_MS = 2500;
const SCAN_BAR_TRAVEL = 120;

const SCAN_MOVE_TIMES = [0, 0.1, 0.45, 0.55, 0.9, 1];
const SCAN_CONTAINER_TIMES = [0, 0.55, 1];
const DOCUMENT_ROTATE_Y = [0, 0, 180, 180, 360, 360];
const SCAN_BAR_Y = [0, 0, 1, 1, 0, 0].map((progress) => progress * SCAN_BAR_TRAVEL);

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
const EASE_IN_OUT = [0.645, 0.045, 0.355, 1] as const;

export function ScanBar({ transition, z }: ScanBarProps) {
  return (
    <motion.div
      animate={{ y: SCAN_BAR_Y }}
      className="absolute top-0 h-[3px] w-[110px] rounded-full bg-gradient-to-r from-transparent via-label to-transparent shadow-[0_0_12px_1px_rgba(255,255,255,0.35)]"
      style={{ left: "50%", x: "-50%", z }}
      transition={transition}
    >
      <div className="absolute top-[0.5px] inset-x-4 h-[1px] rounded-full bg-label blur-[0.5px]" />
    </motion.div>
  );
}

export function ScanningDocument({ reduceMotion }: { reduceMotion: boolean }) {
  const scanCycle = useMemo<Transition>(
    () => ({
      duration: reduceMotion
        ? REDUCED_SCAN_DURATION_MS / 1000 - REDUCED_SCAN_EXIT_DURATION_SECONDS
        : SCAN_DURATION_MS / 1000 - SCAN_EXIT_DURATION_SECONDS,
      ease: EASE_IN_OUT,
      times: SCAN_MOVE_TIMES,
    }),
    [reduceMotion]
  );

  const scanContainerExit = useMemo<TargetAndTransition>(
    () => ({
      scaleX: 0.2,
      scaleY: reduceMotion ? 0.2 : 0,
      y: 20,
      opacity: 0,
      transition: {
        duration: reduceMotion ? REDUCED_SCAN_EXIT_DURATION_SECONDS : SCAN_EXIT_DURATION_SECONDS,
        ease: EASE_OUT,
      },
    }),
    [reduceMotion]
  );

  const scanContainerTransition = useMemo<Transition>(
    () => ({
      duration: reduceMotion ? 0.2 : 0.45,
      ease: EASE_OUT,
      times: SCAN_CONTAINER_TIMES,
    }),
    [reduceMotion]
  );

  return (
    <motion.div
      animate={{
        scaleX: reduceMotion ? [1, 1, 1] : [0.2, 0.2, 1],
        scaleY: reduceMotion ? [1, 1, 1] : [0.2, 1, 1],
        y: reduceMotion ? [0, 0, 0] : [20, 0, 0],
        opacity: 1,
      }}
      aria-hidden="true"
      exit={scanContainerExit}
      initial={
        reduceMotion
          ? { scaleX: 1, scaleY: 1, y: 0, opacity: 0 }
          : { scaleX: 0.2, scaleY: 0.2, y: 20, opacity: 1 }
      }
      style={{ transformOrigin: "bottom center" }}
      transition={scanContainerTransition}
    >
      <div className="h-[140px] w-[105px] [perspective:900px]">
        <motion.div
          animate={{
            rotateY: reduceMotion ? [0, 0, 0, 0, 0, 0] : DOCUMENT_ROTATE_Y,
          }}
          className="relative h-full w-full will-change-transform [transform-style:preserve-3d]"
          transition={scanCycle}
        >
          {/* Spine bar */}
          <div className="absolute top-0 left-1/2 h-full w-[4px] -translate-x-1/2 rounded-full bg-label-4" />

          {/* Front page */}
          <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[14px] border border-hairline bg-surface p-3 text-[7.5px] font-mono text-label shadow-mac-lg [backface-visibility:hidden]">
            <div>
              <div className="flex items-center gap-1 border-b border-hairline pb-1.5 text-label font-semibold">
                <span className="size-1.5 rounded-full bg-label" />
                <span>styles.css</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-12 rounded bg-label/20" />
                <div className="h-1.5 w-16 rounded bg-fill" />
                <div className="h-1.5 w-10 rounded bg-label/15" />
                <div className="h-1.5 w-14 rounded bg-fill" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[6.5px] text-label-3">
              <span>AST: OK</span>
              <span className="text-label font-semibold">98%</span>
            </div>
          </div>

          {/* Back page */}
          <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[14px] border border-hairline bg-surface p-3 text-[7.5px] font-mono text-label shadow-mac-lg [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div>
              <div className="text-[7px] text-label font-semibold">Piksel Karşılaştırma</div>
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-14 rounded bg-fill" />
                <div className="h-1.5 w-10 rounded bg-label/20" />
                <div className="h-1.5 w-12 rounded bg-fill" />
              </div>
            </div>
            <div className="text-[6.5px] text-label font-semibold">Doğrulandı</div>
          </div>

          <ScanBar transition={scanCycle} z={2} />
          <ScanBar transition={scanCycle} z={-2} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function ScanDocumentSubmit({
  onComplete,
  className,
  isSubmitting = false,
}: {
  onComplete?: () => void;
  className?: string;
  isSubmitting?: boolean;
}) {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [scanStepText, setScanStepText] = useState<string>("");
  const scanTimeoutRef = useRef<number | null>(null);
  const stepIntervalRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const clearScanTimeout = useCallback(() => {
    if (scanTimeoutRef.current !== null) {
      window.clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    if (stepIntervalRef.current !== null) {
      window.clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearScanTimeout;
  }, [clearScanTimeout]);

  const handleScan = useCallback(() => {
    if (status !== "idle") return;

    setStatus("scanning");
    clearScanTimeout();

    const scanMs = reduceMotion ? REDUCED_SCAN_DURATION_MS : SCAN_DURATION_MS;

    const steps = [
      "CSS Şişkinliği Denetleniyor...",
      "Piksel Eşleşmesi Hesaplanıyor...",
      "Sınıf Radarına İletiliyor...",
    ];

    let currentStep = 0;
    setScanStepText(steps[0]);

    stepIntervalRef.current = window.setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setScanStepText(steps[currentStep]);
      }
    }, scanMs / 3);

    scanTimeoutRef.current = window.setTimeout(() => {
      setStatus("done");
      setScanStepText("Teslim Edildi");
      if (onComplete) onComplete();

      scanTimeoutRef.current = window.setTimeout(() => {
        setStatus("idle");
        setScanStepText("");
        scanTimeoutRef.current = null;
      }, DONE_RESET_DELAY_MS);
    }, scanMs);
  }, [clearScanTimeout, onComplete, reduceMotion, status]);

  return (
    <div className={cn("relative flex items-center gap-3 select-none", className)}>
      {/* 3D Scanning Visual Flyout */}
      <AnimatePresence>
        {status === "scanning" && (
          <div className="absolute bottom-full right-0 mb-3 z-50 flex flex-col items-center">
            <ScanningDocument key="scanning-doc" reduceMotion={reduceMotion} />
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 pill bg-surface border border-hairline shadow-mac-sm text-tint"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-tint opacity-75" />
                <span className="relative size-1.5 rounded-full bg-tint" />
              </span>
              <span>{scanStepText}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Button */}
      <button
        type="button"
        disabled={status !== "idle" || isSubmitting}
        onClick={handleScan}
        className={cn(
          "mac-btn transition-all duration-200",
          status === "idle" && "mac-btn-primary",
          status === "scanning" && "mac-btn-secondary opacity-90",
          status === "done" && "bg-sys-green text-white shadow-mac-sm"
        )}
      >
        {status === "idle" && (
          <>
            <Sparkles className="size-3.5" />
            <span>Kodu Doğrula ve Teslim Et</span>
          </>
        )}
        {status === "scanning" && (
          <>
            <Terminal className="size-3.5 animate-spin text-tint" />
            <span>Taranıyor...</span>
          </>
        )}
        {status === "done" && (
          <>
            <CheckCircle2 className="size-3.5" />
            <span>Teslim Edildi!</span>
          </>
        )}
      </button>
    </div>
  );
}
