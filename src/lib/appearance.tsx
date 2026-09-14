"use client";

import * as React from "react";
import { ACCENTS, AccentId, Appearance, ResolvedAppearance } from "@/types/theme";
import { ACCENT_KEY, APPEARANCE_KEY } from "@/lib/appearance-script";

interface AppearanceContextValue {
  appearance: Appearance;
  resolved: ResolvedAppearance;
  accent: AccentId;
  setAppearance: (a: Appearance) => void;
  setAccent: (a: AccentId) => void;
}

const AppearanceContext = React.createContext<AppearanceContextValue | null>(null);

function resolve(appearance: Appearance): ResolvedAppearance {
  if (appearance !== "system") return appearance;
  if (typeof window === "undefined") return "oled";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "oled";
}

function applyToDocument(resolved: ResolvedAppearance, accent: AccentId) {
  const root = document.documentElement;
  // Briefly disable transitions so the whole UI swaps in a single frame.
  root.classList.add("theme-switching");
  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-accent", accent);
  root.style.colorScheme = resolved === "light" || resolved === "cream" ? "light" : "dark";
  root.classList.toggle(
    "dark",
    resolved === "dark" || resolved === "oled" || resolved === "nordic"
  );
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.remove("theme-switching"));
  });
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearanceState] = React.useState<Appearance>("oled");
  const [accent, setAccentState] = React.useState<AccentId>("blue");
  const [resolved, setResolved] = React.useState<ResolvedAppearance>("oled");
  const [hydrated, setHydrated] = React.useState(false);

  // Hydrate from storage once mounted.
  React.useEffect(() => {
    setHydrated(true);
    try {
      const a = (localStorage.getItem(APPEARANCE_KEY) as Appearance | null) ?? "oled";
      const c = (localStorage.getItem(ACCENT_KEY) as AccentId | null) ?? "blue";
      setAppearanceState(a);
      setAccentState(c in ACCENTS ? c : "blue");
      setResolved(resolve(a));
    } catch {
      setResolved("oled");
    }
  }, []);

  // Follow the OS when set to "system".
  React.useEffect(() => {
    if (appearance !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [appearance]);

  React.useEffect(() => {
    if (hydrated) applyToDocument(resolved, accent);
  }, [hydrated, resolved, accent]);

  const setAppearance = React.useCallback((a: Appearance) => {
    setAppearanceState(a);
    setResolved(resolve(a));
    try {
      localStorage.setItem(APPEARANCE_KEY, a);
    } catch {}
  }, []);

  const setAccent = React.useCallback((c: AccentId) => {
    setAccentState(c);
    try {
      localStorage.setItem(ACCENT_KEY, c);
    } catch {}
  }, []);

  const value = React.useMemo(
    () => ({ appearance, resolved, accent, setAppearance, setAccent }),
    [appearance, resolved, accent, setAppearance, setAccent]
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const ctx = React.useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance must be used inside <AppearanceProvider>");
  return ctx;
}
