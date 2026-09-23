"use client";

import * as React from "react";
import { motion, useSpring, useTransform } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/** Spring-interpolated number (motion-primitives "AnimatedNumber" pattern). */
export function AnimatedNumber({ value, decimals = 0, className, prefix = "", suffix = "" }: AnimatedNumberProps) {
  const spring = useSpring(value, { stiffness: 120, damping: 22, mass: 0.6 });
  const display = useTransform(spring, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);

  React.useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>{display}</motion.span>;
}
