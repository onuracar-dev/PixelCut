"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { ScanningDocument } from "@/components/ui/scan-document";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeacherSubmitButtonProps {
  onComplete?: () => void;
  className?: string;
  disabled?: boolean;
  isSubmitted?: boolean;
}

export function TeacherSubmitButton({
  onComplete,
  className,
  disabled = false,
  isSubmitted = false,
}: TeacherSubmitButtonProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState("CSS Şişkinliği Denetleniyor...");
  const [internalSubmitted, setInternalSubmitted] = useState(isSubmitted);
  const reduceMotion = useReducedMotion() ?? false;
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync with external isSubmitted prop (e.g. if code edits re-arm the button)
  useEffect(() => {
    setInternalSubmitted(isSubmitted);
  }, [isSubmitted]);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  const handleAction = useCallback(async () => {
    if (internalSubmitted) return;

    setIsScanning(true);
    setScanStep("CSS Şişkinliği Denetleniyor...");

    // Progressive scanning status updates
    stepTimerRef.current = setInterval(() => {
      setScanStep((prev) => {
        if (prev.includes("Şişkinliği")) return "Piksel Eşleşmesi Hesaplanıyor...";
        if (prev.includes("Piksel")) return "Sınıf Radarına İletiliyor...";
        return prev;
      });
    }, 450);

    // Realistic scanning duration matching the 3D sheet animation
    await new Promise((resolve) => setTimeout(resolve, 1400));

    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }

    setIsScanning(false);
    setInternalSubmitted(true);

    // Trigger parent submission handler (e.g. confetti, student status updates)
    if (onComplete) {
      onComplete();
    }
  }, [internalSubmitted, onComplete]);

  return (
    <div className={cn("relative flex items-center select-none", className)}>
      {/* 3D Holographic Scanning Sheet Flyout - Clean Monochrome */}
      <AnimatePresence>
        {isScanning && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 flex flex-col items-center pointer-events-none">
            <ScanningDocument reduceMotion={reduceMotion} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="mt-2.5 flex items-center gap-2 rounded-full border border-hairline bg-surface/95 px-3 py-1 text-[11px] font-medium text-label shadow-mac-md backdrop-blur-xl whitespace-nowrap"
            >
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-label/40 opacity-75" />
                <span className="relative size-1.5 rounded-full bg-label" />
              </span>
              <span className="font-mono text-[11px] text-label">{scanStep}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Arc UI Action Button with Pure Monochrome Black & White Theme */}
      <ActionButton
        label={internalSubmitted ? "Hocaya İletildi" : "Hocaya Gönder"}
        pendingLabel="Taranıyor & İletiliyor..."
        successLabel="Hocaya İletildi"
        variant="default"
        size="md"
        icon={<Send className="size-3.5" />}
        resetAfterMs={0}
        isCompleted={internalSubmitted}
        disabled={disabled || internalSubmitted}
        onAction={handleAction}
        className="font-medium tracking-tight shadow-mac-sm"
      />
    </div>
  );
}

export default TeacherSubmitButton;
