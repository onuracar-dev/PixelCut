"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface CurveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  side?: "right" | "left";
}

/**
 * Floating inspector sheet (visionOS-style): an inset, rounded glass panel
 * that springs in from the edge. Keeps the original CurveDrawer API.
 */
export function CurveDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  side = "right",
}: CurveDrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const isRight = side === "right";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden rounded-[inherit]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/15 backdrop-blur-[2px] dark:bg-black/40"
          />

          <motion.aside
            initial={{ x: isRight ? "105%" : "-105%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRight ? "105%" : "-105%", opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 340, damping: 36, mass: 0.9 }}
            className={`glass absolute top-3 bottom-3 ${isRight ? "right-3" : "left-3"} flex w-[min(560px,calc(100vw-24px))] flex-col overflow-hidden rounded-[22px]`}
          >
            <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
              <div className="min-w-0">
                <h3 className="truncate text-[17px] font-semibold tracking-[-0.022em] text-label">{title}</h3>
                {subtitle && <p className="mt-0.5 truncate text-[12.5px] text-label-2">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="grid size-7 shrink-0 place-items-center rounded-full bg-fill-2 text-label-2 transition-colors hover:bg-fill hover:text-label"
              >
                <X className="size-3.5" strokeWidth={2.5} />
              </button>
            </header>
            <div className="mx-6 h-px bg-hairline" />
            <div className="relative flex-1 overflow-y-auto px-6 py-5 text-[13px] text-label-2">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
