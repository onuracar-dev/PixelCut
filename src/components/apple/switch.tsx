"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: "sm" | "md";
  id?: string;
  "aria-label"?: string;
}

/** iOS / macOS toggle with a springy, stretching knob. */
export function Switch({ checked, onCheckedChange, size = "md", id, ...rest }: SwitchProps) {
  const [pressed, setPressed] = React.useState(false);
  const dims = size === "sm" ? { w: 32, h: 20, k: 16 } : { w: 42, h: 25, k: 21 };
  const travel = dims.w - dims.k - 4;

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={rest["aria-label"]}
      onClick={() => onCheckedChange(!checked)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={cn(
        "relative shrink-0 rounded-full transition-colors duration-300 ease-apple",
        checked ? "bg-tint" : "bg-fill"
      )}
      style={{ width: dims.w, height: dims.h }}
    >
      <motion.span
        className="absolute top-[2px] left-[2px] rounded-full bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)]"
        style={{ height: dims.k }}
        animate={{
          x: checked ? travel - (pressed ? 5 : 0) : 0,
          width: pressed ? dims.k + 5 : dims.k,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
      />
    </button>
  );
}
