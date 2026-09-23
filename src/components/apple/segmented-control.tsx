"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
  /** Stretch segments to fill the container width. */
  block?: boolean;
}

/**
 * macOS segmented control with a spring-animated thumb
 * (pattern from motion-primitives "AnimatedBackground").
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
  block = false,
}: SegmentedControlProps<T>) {
  const layoutId = React.useId();

  return (
    <div
      role="tablist"
      className={cn(
        "relative inline-flex items-center rounded-[10px] bg-fill-2 p-[2px] shadow-[inset_0_0_0_0.5px_var(--mac-hairline)]",
        block && "flex w-full",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            title={opt.title}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-0 inline-flex items-center justify-center gap-1.5 rounded-[8px] font-medium transition-colors duration-200",
              size === "sm" ? "h-[22px] px-2.5 text-[11.5px]" : "h-[26px] px-3 text-[12.5px]",
              block && "flex-1",
              active ? "text-label" : "text-label-2 hover:text-label"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-[8px] bg-surface shadow-mac-sm dark:bg-white/[0.14]"
                transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.8 }}
              />
            )}
            {opt.icon}
            {opt.label && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
