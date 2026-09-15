import { ResolvedAppearance } from "@/types/theme";

/**
 * Registers custom Apple-inspired palettes inside Monaco Editor
 */
export const defineMonacoCustomThemes = (monaco: any) => {
  if (!monaco || !monaco.editor) return;

  // OLED True Black
  monaco.editor.defineTheme("oled-theme", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#08080a",
      "editor.lineHighlightBackground": "#121216",
      "editorGutter.background": "#08080a",
      "editorLineNumber.foreground": "#52525b",
      "editorLineNumber.activeForeground": "#ffffff",
    },
  });

  // Warm Studio / Cream Paper
  monaco.editor.defineTheme("cream-theme", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#ffffff",
      "editor.lineHighlightBackground": "#f5f0e8",
      "editorGutter.background": "#ffffff",
      "editorLineNumber.foreground": "#a8a29e",
      "editorLineNumber.activeForeground": "#2c2523",
    },
  });

  // Arctic Slate / Nordic Ocean
  monaco.editor.defineTheme("nordic-theme", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#152236",
      "editor.lineHighlightBackground": "#1d2e47",
      "editorGutter.background": "#152236",
      "editorLineNumber.foreground": "#64748b",
      "editorLineNumber.activeForeground": "#38bdf8",
    },
  });
};

/**
 * Returns the exact Monaco theme name based on the active resolved appearance
 */
export const getMonacoThemeName = (resolved: ResolvedAppearance): string => {
  switch (resolved) {
    case "oled":
      return "oled-theme";
    case "cream":
      return "cream-theme";
    case "nordic":
      return "nordic-theme";
    case "dark":
      return "vs-dark";
    case "light":
    default:
      return "light";
  }
};
