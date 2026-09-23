"use client";

import * as React from "react";
import { motion } from "motion/react";

interface ActivityRingProps {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  color?: string; // any CSS color, incl. var(--sys-green)
  children?: React.ReactNode;
}

/** Apple Watch–style activity ring with a soft track and rounded cap. */
export function ActivityRing({ value, size = 40, stroke = 4.5, color = "var(--mac-tint)", children }: ActivityRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value, 0), 100) / 100;

  return (
    <div className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeOpacity={0.16} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  );
}
