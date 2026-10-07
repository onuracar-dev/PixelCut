"use client";

import * as React from "react";
import { Check, Sliders, Palette, RefreshCw, Volume2 } from "lucide-react";
import { UserRole } from "@/types";
import { useAppearance } from "@/lib/appearance";
import { soundEffects } from "@/lib/sound-effects";
import { ACCENTS, AccentId, APPEARANCES } from "@/types/theme";
import { SegmentedControl } from "@/components/apple/segmented-control";
import { Switch } from "@/components/apple/switch";
import { ActionButton } from "@/components/arc/action-button/action-button";
import { cn } from "@/lib/utils";

export const FONT_FAMILY_MAP: Record<string, string> = {
  "Geist Mono": "'Geist Mono', monospace",
  "JetBrains Mono": "'JetBrains Mono', monospace",
  "Fira Code": "'Fira Code', monospace",
  "SF Mono": "'SF Mono', 'Cascadia Code', Consolas, monospace",
};

export interface SettingsViewProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  showCssInspector?: boolean;
  onToggleCssInspector?: (val: boolean) => void;
  editorFontFamily?: string;
  onFontFamilyChange?: (font: string) => void;
  editorFontSize?: number;
  onFontSizeChange?: (size: number) => void;
  onSavePreferences?: (settings: { fontFamily: string; fontSize: number }) => void | Promise<void>;
  className?: string;
}

export function SettingsView({
  showCssInspector = false,
  onToggleCssInspector,
  editorFontFamily = "Geist Mono",
  onFontFamilyChange,
  editorFontSize = 13,
  onFontSizeChange,
  onSavePreferences,
  className,
}: SettingsViewProps) {
  const { appearance, setAppearance, accent, setAccent } = useAppearance();

  const [fontSize, setFontSize] = React.useState<number>(editorFontSize);
  const [fontFamily, setFontFamily] = React.useState<string>(editorFontFamily);
  const [isSoundActive, setIsSoundActive] = React.useState<boolean>(() => !soundEffects.isMuted());

  React.useEffect(() => {
    setFontSize(editorFontSize);
  }, [editorFontSize]);

  React.useEffect(() => {
    setFontFamily(editorFontFamily);
  }, [editorFontFamily]);

  const handleFontChange = (newFont: string) => {
    setFontFamily(newFont);
    onFontFamilyChange?.(newFont);
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    onFontSizeChange?.(newSize);
  };

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 450));
    if (onSavePreferences) {
      await onSavePreferences({ fontFamily, fontSize });
    } else {
      onFontFamilyChange?.(fontFamily);
      onFontSizeChange?.(fontSize);
      if (typeof window !== "undefined") {
        localStorage.setItem("csspg_editor_font_family", fontFamily);
        localStorage.setItem("csspg_editor_font_size", String(fontSize));
      }
    }
  };

  return (
    <div className={cn("flex h-full w-full flex-col bg-canvas overflow-y-auto p-8 select-none", className)}>
      <div className="max-w-3xl mx-auto w-full space-y-7">
        {/* Header */}
        <div className="pb-3 border-b border-hairline">
          <h2 className="text-[20px] font-bold tracking-[-0.022em] text-label">
            Sistem ve Editör Ayarları
          </h2>
          <p className="mt-0.5 text-[12px] text-label-2">
            Görünüm ve Monaco kod editörü ergonomisini yapılandırın.
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. macOS Appearance & Accent Color Section */}
          <div className="rounded-[18px] bg-surface p-5 shadow-mac-sm space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-tint" />
              <h3 className="text-[14px] font-semibold text-label">Görünüm ve Vurgu Rengi</h3>
            </div>

            {/* 5 Themes + System Radio Tiles */}
            <div>
              <span className="section-label block mb-2.5">Tema Seçimi (5 Apple Renk Paleti)</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {APPEARANCES.map((item) => {
                  const isSelected = appearance === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAppearance(item.id)}
                      className={cn(
                        "flex flex-col items-start text-left gap-2 rounded-[16px] border p-3 transition-all group",
                        isSelected
                          ? "border-tint bg-tint/8 shadow-mac-xs ring-2 ring-tint/25"
                          : "border-hairline bg-well/70 hover:bg-well hover:border-hairline-strong"
                      )}
                    >
                      {/* Mini Mac Window Preview mockup */}
                      <div
                        className="h-12 w-full rounded-[10px] p-2 shadow-mac-xs border flex flex-col justify-between transition-transform group-hover:scale-[1.02]"
                        style={{
                          background: item.colorPreview.bg,
                          borderColor: item.colorPreview.border,
                          color: item.colorPreview.text,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <span className="size-1.5 rounded-full bg-[#ff5f57]" />
                            <span className="size-1.5 rounded-full bg-[#febc2e]" />
                            <span className="size-1.5 rounded-full bg-[#28c840]" />
                          </div>
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: item.colorPreview.dot }}
                          />
                        </div>
                        <div className="flex items-center gap-1.5 opacity-40">
                          <div className="h-1.5 w-1/3 rounded-full bg-current" />
                          <div className="h-1.5 w-1/4 rounded-full bg-current opacity-60" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-[12.5px] font-semibold tracking-tight",
                              isSelected ? "text-tint" : "text-label"
                            )}
                          >
                            {item.name}
                          </span>
                          {isSelected && (
                            <Check className="size-3 text-tint stroke-[2.5]" />
                          )}
                        </div>
                        <span className="text-[11px] text-label-3 block line-clamp-1">
                          {item.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apple Accent Color Palette Circles */}
            <div className="pt-2 border-t border-hairline">
              <span className="section-label block mb-2.5">Sistem Vurgu Rengi</span>
              <div className="flex flex-wrap items-center gap-3">
                {(Object.keys(ACCENTS) as AccentId[]).map((aid) => {
                  const a = ACCENTS[aid];
                  const isSelected = accent === aid;
                  return (
                    <button
                      key={aid}
                      type="button"
                      onClick={() => setAccent(aid)}
                      title={a.name}
                      className={cn(
                        "relative grid size-8 place-items-center rounded-full transition-transform active:scale-90",
                        isSelected ? "ring-2 ring-offset-2 ring-offset-surface ring-label shadow-mac-xs scale-105" : "hover:scale-105"
                      )}
                      style={{ backgroundColor: a.light }}
                    >
                      {isSelected && <Check className="size-4 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Monaco Editor Preferences */}
          <div className="rounded-[18px] bg-surface p-5 shadow-mac-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="size-4 text-sys-blue" />
              <h3 className="text-[14px] font-semibold text-label">Monaco Editör Tercihleri</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-label-2 font-medium">Font Boyutu</span>
                  <span className="font-mono text-tint font-semibold">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="18"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  className="mac-range mt-2.5"
                  style={{ "--fill": `${((fontSize - 11) / 7) * 100}%` } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-label-2 block mb-1">Kod Fontu</label>
                <select
                  value={fontFamily}
                  onChange={(e) => handleFontChange(e.target.value)}
                  className="mac-select w-full"
                >
                  <option value="Geist Mono">Geist Mono (Vercel Modern)</option>
                  <option value="JetBrains Mono">JetBrains Mono (Ligatür Destekli)</option>
                  <option value="Fira Code">Fira Code (Ligatür Destekli)</option>
                  <option value="SF Mono">SF Mono (Apple Standart)</option>
                </select>
              </div>
            </div>

            {/* Live Font Sample Preview */}
            <div
              key={`${fontFamily}-${fontSize}`}
              className="rounded-[12px] border border-hairline bg-well/60 p-3.5 text-[12.5px] leading-relaxed select-text transition-all"
              style={{
                fontFamily: FONT_FAMILY_MAP[fontFamily] || fontFamily,
                fontSize: `${fontSize}px`,
                fontVariantLigatures: "normal",
                fontFeatureSettings: '"liga" 1, "calt" 1',
              }}
            >
              <div className="flex items-center justify-between text-[10px] text-label-3 uppercase tracking-wider mb-2 font-sans select-none">
                <span className="font-semibold text-tint">Canlı Font & Ligatür Önizlemesi</span>
                <span className="rounded bg-fill px-1.5 py-0.5 font-mono text-[11px] text-label-2">{fontFamily} • {fontSize}px</span>
              </div>
              <div className="space-y-1 font-normal">
                <div>
                  <span className="text-tint font-bold">const</span>{" "}
                  <span className="text-label">analiz</span> = (satirlar: string[]) =&gt; {"{"}
                </div>
                <div className="pl-4 text-label-2">
                  <span className="text-label-3">// Karşılaştırma & ok ligatürleri:</span>{" "}
                  <span className="text-sys-yellow font-bold">&gt;= &lt;= !== === =&gt; -&gt;</span>
                </div>
                <div className="pl-4">
                  <span className="text-tint font-bold">return</span> satirlar.filter(s =&gt; s.length &gt; 0);
                </div>
                <div>{"};"}</div>
              </div>
            </div>

            {/* Live CSS DOM Inspector switch row */}
            <div className="flex items-center justify-between pt-3 border-t border-hairline">
              <div>
                <h4 className="text-[13px] font-medium text-label">Canlı DOM & CSS Denetçisi (Inspector)</h4>
                <p className="text-[11.5px] text-label-2">
                  Önizleme ekranındaki elementlerin gerçek boyutlarını, kutu modelini (padding/margin) ve stillerini inceleyen canlı denetçi panelini açar.
                </p>
              </div>
              <Switch
                checked={showCssInspector}
                onCheckedChange={(val) => onToggleCssInspector?.(val)}
                size="md"
              />
            </div>

            {/* Apple Haptic Sound Effects toggle row */}
            <div className="flex items-center justify-between pt-3 border-t border-hairline">
              <div>
                <h4 className="text-[13px] font-medium text-label flex items-center gap-1.5">
                  <Volume2 className="size-3.5 text-tint" />
                  Dokunsal Ses Efektleri (Haptic Audio)
                </h4>
                <p className="text-[11.5px] text-label-2">
                  Apple tarzı minimalist tıklama, sekme geçişi ve başarı zil seslerini aktifleştirir (Web Audio API).
                </p>
              </div>
              <Switch
                checked={isSoundActive}
                onCheckedChange={(val) => {
                  soundEffects.setMuted(!val);
                  setIsSoundActive(val);
                  if (val) soundEffects.playSuccessChime();
                }}
                size="md"
              />
            </div>
          </div>

          {/* 4. Uygulama Bilgisi */}
          <div className="rounded-[18px] bg-surface p-5 shadow-mac-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid size-8 place-items-center rounded-xl bg-well text-label border border-hairline">
                  <RefreshCw className="size-4 text-label-2" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-label">PixelCut Studio</h3>
                  <p className="text-[11.5px] text-label-2 mt-0.5">
                    Üniversite İleri CSS dersi için optimize edilmiş modern frontend laboratuvar platformu.
                  </p>
                </div>
              </div>
              <span className="pill bg-well border border-hairline text-label-2 font-mono text-[11px] px-3 py-1">
                v0.1.0 (Güncel)
              </span>
            </div>
          </div>

          {/* ActionButton Save Button matching Onboarding Step 1 */}
          <div className="flex items-center justify-end pt-2">
            <ActionButton
              label="Tercihleri Kaydet"
              pendingLabel="Kaydediliyor..."
              successLabel="Kaydedildi"
              onAction={handleSave}
              className="h-11 px-8 rounded-full text-[13.5px] font-semibold tracking-tight shadow-mac-md cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
