"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_GREETINGS = [
  "merhaba",
  "hello",
  "bonjour",
  "hola",
  "ciao",
  "olá",
  "namaste",
] as const;

export type AppleHelloLoaderProps = Readonly<{
  greetings?: readonly string[];
  intervalMs?: number;
  fadeMs?: number;
  fill?: boolean;
  className?: string;
  textClassName?: string;
}>;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function AppleHelloLoader({
  greetings = DEFAULT_GREETINGS,
  intervalMs = 2400,
  fadeMs = 350,
  fill = false,
  className,
  textClassName,
}: AppleHelloLoaderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const items = greetings.length > 0 ? greetings : DEFAULT_GREETINGS;

  useEffect(() => {
    if (reducedMotion || items.length <= 1) return;

    const interval = globalThis.setInterval(() => {
      setVisible(false);
      globalThis.setTimeout(() => {
        setIndex((current) => (current + 1) % items.length);
        setVisible(true);
      }, fadeMs);
    }, intervalMs);

    return () => globalThis.clearInterval(interval);
  }, [fadeMs, intervalMs, items.length, reducedMotion]);

  return (
    <div
      data-slot="apple-hello-loader"
      className={cn(
        "flex items-center justify-center select-none",
        fill ? "absolute inset-0" : "min-h-24 min-w-40 rounded-2xl px-6 py-6",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={items[index]}
    >
      <p
        className={cn(
          "px-4 text-center font-sans text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tight text-label capitalize transition-all duration-500 motion-reduce:transition-none",
          visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-2 opacity-0 scale-[0.98]",
          textClassName
        )}
      >
        {items[index]}
      </p>
    </div>
  );
}
