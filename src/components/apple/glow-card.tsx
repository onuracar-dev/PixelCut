"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  radius?: number;
}

/**
 * Card with a cursor-following soft light (Magic UI "MagicCard" pattern),
 * toned down to an Apple-like subtle sheen.
 */
export function GlowCard({ className, children, glowColor = "var(--mac-tint)", radius = 18, ...props }: GlowCardProps) {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const background = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, color-mix(in srgb, ${glowColor} 9%, transparent), transparent 70%)`;
  const ring = useMotionTemplate`radial-gradient(200px circle at ${x}px ${y}px, color-mix(in srgb, ${glowColor} 45%, transparent), transparent 70%)`;

  return (
    <div
      {...props}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
        props.onPointerMove?.(e);
      }}
      onPointerLeave={(e) => {
        x.set(-200);
        y.set(-200);
        props.onPointerLeave?.(e);
      }}
      className={cn("group/glow relative isolate bg-surface shadow-mac-sm transition-shadow duration-300 hover:shadow-mac-md", className)}
      style={{ borderRadius: radius, ...props.style }}
    >
      {/* gradient hairline that follows the cursor */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-px -z-10 opacity-0 transition-opacity duration-300 group-hover/glow:opacity-100"
        style={{ background: ring, borderRadius: radius + 1 }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-surface" style={{ borderRadius: radius }} />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/glow:opacity-100"
        style={{ background, borderRadius: radius }}
      />
      {children}
    </div>
  );
}
