/**
 * Apple-style appearance system with 5 curated themes.
 * Colors live in CSS variables (see globals.css).
 */

export type Appearance = "light" | "dark" | "oled" | "cream" | "nordic" | "system";
export type ResolvedAppearance = "light" | "dark" | "oled" | "cream" | "nordic";
export type AccentId = "blue" | "purple" | "pink" | "orange" | "green" | "graphite";

export interface AccentConfig {
  id: AccentId;
  name: string;
  light: string;
  dark: string;
  arc: string;
}

export const ACCENTS: Record<AccentId, AccentConfig> = {
  blue: { id: "blue", name: "Mavi", light: "#007aff", dark: "#0a84ff", arc: "blue" },
  purple: { id: "purple", name: "Mor", light: "#af52de", dark: "#bf5af2", arc: "violet" },
  pink: { id: "pink", name: "Pembe", light: "#ff2d55", dark: "#ff375f", arc: "rose" },
  orange: { id: "orange", name: "Turuncu", light: "#ff9500", dark: "#ff9f0a", arc: "orange" },
  green: { id: "green", name: "Yeşil", light: "#28a745", dark: "#30d158", arc: "green" },
  graphite: { id: "graphite", name: "Grafit", light: "#8e8e93", dark: "#98989d", arc: "neutral" },
};

export const APPEARANCES: Array<{
  id: Appearance;
  name: string;
  subtitle: string;
  colorPreview: { bg: string; border: string; text: string; dot: string };
}> = [
  {
    id: "light",
    name: "Cupertino Light",
    subtitle: "Açık • Saf Apple Gündüzü",
    colorPreview: { bg: "#ffffff", border: "#e5e5ea", text: "#1d1d1f", dot: "#007aff" },
  },
  {
    id: "dark",
    name: "Space Gray",
    subtitle: "Koyu • macOS Klasik",
    colorPreview: { bg: "#1f1f22", border: "#38383a", text: "#f5f5f7", dot: "#0a84ff" },
  },
  {
    id: "oled",
    name: "Midnight OLED",
    subtitle: "Derin Siyah • Saf Piksel Kapatma",
    colorPreview: { bg: "#000000", border: "#27272a", text: "#ffffff", dot: "#ffffff" },
  },
  {
    id: "cream",
    name: "Warm Studio",
    subtitle: "Krem Fildişi • Göz Yormayan Kağıt",
    colorPreview: { bg: "#faf6ef", border: "#e5dfd3", text: "#2c2523", dot: "#b45309" },
  },
  {
    id: "nordic",
    name: "Arctic Slate",
    subtitle: "Kutup Mavisi • Linear & Raycast",
    colorPreview: { bg: "#0f1724", border: "#1e293b", text: "#f1f5f9", dot: "#38bdf8" },
  },
  {
    id: "system",
    name: "Otomatik (Sistem)",
    subtitle: "Cihaz Modunu Takip Et",
    colorPreview: { bg: "linear-gradient(135deg, #ffffff 50%, #1f1f22 50%)", border: "#71717a", text: "#a1a1aa", dot: "#007aff" },
  },
];

/** Concrete colors for Monaco editor integration */
export const MONACO_PALETTE: Record<
  ResolvedAppearance,
  { bg: string; lineHighlight: string; gutter: string; selection: string }
> = {
  light: { bg: "#ffffff", lineHighlight: "#f5f5f7", gutter: "#b8b8bf", selection: "#d6e6ff" },
  dark: { bg: "#232326", lineHighlight: "#2a2a2e", gutter: "#5a5a60", selection: "#2f4a73" },
  oled: { bg: "#000000", lineHighlight: "#0e0e11", gutter: "#3f3f46", selection: "#27272a" },
  cream: { bg: "#faf6ef", lineHighlight: "#f2ece0", gutter: "#a8a29e", selection: "#e8ded0" },
  nordic: { bg: "#0f1724", lineHighlight: "#162235", gutter: "#475569", selection: "#1e3a5f" },
};
