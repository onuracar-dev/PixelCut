"use client";

import * as React from "react";
import {
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Code2,
  Layers,
  FileCode,
  BookOpen,
  Plus,
  Trash2,
  Sliders,
  Send,
  Download,
  AlertCircle,
  ExternalLink,
  Check,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Challenge, ChallengeCategory } from "@/types";
import { compressImageToWebP, CompressionResult } from "@/lib/image-compressor";
import { cn } from "@/lib/utils";

interface CreateChallengeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishChallenge: (challenge: Challenge) => void;
  existingCount?: number;
}

const CATEGORIES: { id: ChallengeCategory; label: string; icon: string }[] = [
  { id: "pricing", label: "Fiyatlandırma", icon: "💎" },
  { id: "card", label: "Kart Bileşeni", icon: "🃏" },
  { id: "navbar", label: "Navigasyon / Menü", icon: "🧭" },
  { id: "hero", label: "Hero Başlık", icon: "🚀" },
  { id: "table", label: "Veri Tablosu", icon: "📊" },
  { id: "form", label: "Form Arayüzü", icon: "📝" },
  { id: "footer", label: "Alt Bilgi (Footer)", icon: "⚓" },
];

const POPULAR_CDNS = [
  {
    id: "bootstrap",
    name: "Bootstrap 5.3",
    type: "css",
    url: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    desc: "Grid, buton ve form sınıfları",
  },
  {
    id: "tailwind",
    name: "Tailwind Play CDN",
    type: "js",
    url: "https://cdn.tailwindcss.com",
    desc: "Utility-first CSS runtime",
  },
  {
    id: "fontawesome",
    name: "FontAwesome 6 İkonları",
    type: "css",
    url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    desc: "fa, fas, fab vektörel ikon seti",
  },
  {
    id: "google-fonts",
    name: "Google Fonts (Inter / Plus Jakarta)",
    type: "css",
    url: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
    desc: "Modern tipografi ailesi",
  },
  {
    id: "animate-css",
    name: "Animate.css",
    type: "css",
    url: "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
    desc: "Hazır CSS mikro-animasyonları",
  },
];

export function CreateChallengeDialog({
  isOpen,
  onClose,
  onPublishChallenge,
  existingCount = 1,
}: CreateChallengeDialogProps) {
  const [activeStep, setActiveStep] = React.useState<1 | 2 | 3>(1);

  // Form State
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<ChallengeCategory>("pricing");
  const [difficulty, setDifficulty] = React.useState<"Kolay" | "Orta" | "İleri" | "Uzman">("Orta");
  const [maxLinesGoal, setMaxLinesGoal] = React.useState<number>(55);

  // Target Image State
  const [targetImageUrl, setTargetImageUrl] = React.useState<string>("");
  const [compressionInfo, setCompressionInfo] = React.useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);

  // Starter Code State
  const [starterHtml, setStarterHtml] = React.useState(
    `<div class="challenge-card">\n  <span class="badge">YENİ</span>\n  <h2 class="title">Bileşen Başlığı</h2>\n  <p class="desc">Açıklama metni buraya gelecek.</p>\n  <button class="action-btn">Detayları Gör</button>\n</div>`
  );
  const [starterCss, setStarterCss] = React.useState(
    `/* Buraya sıfırdan CSS kodlarınızı yazın */\n.challenge-card {\n  /* Hedef tasarıma milimetrik eşitleyin */\n}`
  );

  // CDNs State
  const [selectedCdns, setSelectedCdns] = React.useState<string[]>([]);
  const [customCdnInput, setCustomCdnInput] = React.useState("");

  // Hints State
  const [hints, setHints] = React.useState<string[]>([
    "Flexbox veya CSS Grid kullanarak hizalama yapın.",
    "Responsive mobil görünümü için max-width ve margin: auto tercih edin.",
  ]);
  const [newHintInput, setNewHintInput] = React.useState("");
  const [titleError, setTitleError] = React.useState<string | null>(null);

  // Global Paste listener (Ctrl+V) for easy screenshot pasting
  React.useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            await processImageBlob(blob);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  const processImageBlob = async (blob: File | Blob) => {
    setIsCompressing(true);
    try {
      const result = await compressImageToWebP(blob, 1200, 900, 0.82);
      setTargetImageUrl(result.dataUrl);
      setCompressionInfo(result);
    } catch (err) {
      console.error("Görsel sıkıştırma hatası:", err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageBlob(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await processImageBlob(file);
    }
  };

  const handleToggleCdn = (url: string) => {
    if (selectedCdns.includes(url)) {
      setSelectedCdns((prev) => prev.filter((u) => u !== url));
    } else {
      setSelectedCdns((prev) => [...prev, url]);
    }
  };

  const handleAddCustomCdn = () => {
    const trimmed = customCdnInput.trim();
    if (!trimmed) return;
    if (!selectedCdns.includes(trimmed)) {
      setSelectedCdns((prev) => [...prev, trimmed]);
    }
    setCustomCdnInput("");
  };

  const handleAddHint = () => {
    const trimmed = newHintInput.trim();
    if (!trimmed) return;
    setHints((prev) => [...prev, trimmed]);
    setNewHintInput("");
  };

  const handleRemoveHint = (idx: number) => {
    setHints((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePublish = () => {
    if (!title.trim()) {
      setTitleError("Lütfen görev başlığı giriniz.");
      setActiveStep(1);
      return;
    }

    const newChallenge: Challenge = {
      id: `challenge-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || `${title} bileşenini modern CSS kurallarıyla yeniden oluşturun.`,
      category,
      difficulty,
      targetImageUrl:
        targetImageUrl ||
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      targetWidth: compressionInfo?.width || 720,
      targetHeight: compressionInfo?.height || 420,
      starterHtml: starterHtml.trim(),
      starterCss: starterCss.trim(),
      hints,
      maxLinesGoal: Number(maxLinesGoal) || 50,
      xpReward:
        difficulty === "Kolay"
          ? 60
          : difficulty === "Orta"
          ? 150
          : difficulty === "İleri"
          ? 250
          : 400,
      externalLibraries: selectedCdns,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    onPublishChallenge(newChallenge);
    onClose();
  };

  const handleExportJson = () => {
    const data = {
      title: title || "Yeni Görev",
      category,
      difficulty,
      maxLinesGoal,
      description,
      starterHtml,
      starterCss,
      externalLibraries: selectedCdns,
      hints,
      targetImageUrl,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-") || "gorev"}.csspg.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-[26px] border border-hairline-strong bg-surface shadow-mac-xl text-label"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4 bg-well/40 backdrop-blur-md">
          <h2 className="text-[16px] font-semibold text-label">
            Yeni Görev Ekle
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-label-3 hover:text-label hover:bg-well transition-colors cursor-pointer"
            title="Kapat (Esc)"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="flex items-center border-b border-hairline px-6 py-2 bg-surface/70">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer",
                activeStep === 1
                  ? "bg-well text-label font-semibold shadow-mac-xs border border-hairline"
                  : "text-label-3 hover:text-label hover:bg-well/50"
              )}
            >
              <span className="grid size-5 place-items-center rounded-full bg-surface border border-hairline text-[11px] font-mono">
                1
              </span>
              <span>Hedef & Kategori</span>
            </button>

            <span className="text-label-3">›</span>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer",
                activeStep === 2
                  ? "bg-well text-label font-semibold shadow-mac-xs border border-hairline"
                  : "text-label-3 hover:text-label hover:bg-well/50"
              )}
            >
              <span className="grid size-5 place-items-center rounded-full bg-surface border border-hairline text-[11px] font-mono">
                2
              </span>
              <span>Kod İskeleti & CDN</span>
            </button>

            <span className="text-label-3">›</span>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer",
                activeStep === 3
                  ? "bg-well text-label font-semibold shadow-mac-xs border border-hairline"
                  : "text-label-3 hover:text-label hover:bg-well/50"
              )}
            >
              <span className="grid size-5 place-items-center rounded-full bg-surface border border-hairline text-[11px] font-mono">
                3
              </span>
              <span>Kurallar & Dağıtım</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: HEDEF & KATEGORİ */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Challenge Title */}
              <div>
                <label className="block text-[12.5px] font-medium text-label mb-2">
                  Görev / Bileşen Başlığı <span className="text-sys-orange">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Örn: SaaS Dark Fiyatlandırma Kartı (Pro Plan)"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (titleError) setTitleError(null);
                  }}
                  className={cn(
                    "mac-field text-[13.5px] py-2.5 w-full transition-all",
                    titleError && "border-rose-500 bg-rose-500/5 focus:border-rose-500 ring-1 ring-rose-500/20"
                  )}
                  autoFocus
                />
                {titleError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 mt-2 text-[12px] text-rose-500 font-medium"
                  >
                    <AlertCircle className="size-3.5" />
                    <span>{titleError}</span>
                  </motion.div>
                )}
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-[12px] font-medium text-label-2 mb-2">
                  Bileşen Kategorisi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "flex items-center gap-2.5 p-2.5 rounded-xl border text-[12px] transition-all cursor-pointer",
                          isSelected
                            ? "border-tint bg-tint/10 text-tint font-semibold shadow-mac-xs"
                            : "border-hairline bg-surface hover:bg-well text-label-2 hover:text-label"
                        )}
                      >
                        <span className="text-[16px]">{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-[12px] font-medium text-label-2 mb-2">
                  Zorluk Derecesi
                </label>
                <div className="flex items-center gap-2">
                  {(["Kolay", "Orta", "İleri", "Uzman"] as const).map((diff) => {
                    const isSelected = difficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl border text-[12px] font-medium transition-all cursor-pointer",
                          isSelected
                            ? "border-hairline-strong bg-well text-label font-semibold shadow-mac-xs"
                            : "border-hairline bg-surface text-label-3 hover:text-label hover:bg-well"
                        )}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Image Upload & Paste Area */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12.5px] font-medium text-label">
                    Hedef Tasarım Görseli (Şablondan Kırpılan Parça)
                  </label>
                  <span className="text-[11px] font-mono text-label-3">
                    💡 İpucu: Ekran görüntüsü alıp direkt <strong>Ctrl+V</strong> ile yapıştırabilirsiniz!
                  </span>
                </div>

                {targetImageUrl ? (
                  <div className="relative rounded-2xl border border-hairline-strong bg-well/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        <span className="text-[12px] font-medium text-label">
                          Hedef Görsel Optimize Edildi ({compressionInfo?.width}x{compressionInfo?.height}px)
                        </span>
                        {compressionInfo && (
                          <span className="pill bg-emerald-500/15 text-emerald-400 font-mono text-[10px]">
                            {compressionInfo.formattedOriginal} ➔ {compressionInfo.formattedCompressed} (%{compressionInfo.savedPercent} Sıkıştırma)
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTargetImageUrl("");
                          setCompressionInfo(null);
                        }}
                        className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                      >
                        Görseli Kaldır / Yenisini Seç
                      </button>
                    </div>

                    <div className="flex justify-center bg-black/40 rounded-xl p-3 max-h-[300px] overflow-hidden">
                      <img
                        src={targetImageUrl}
                        alt="Hedef Önizleme"
                        className="max-h-[260px] object-contain rounded-lg border border-hairline shadow-mac-md"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
                      isDragOver
                        ? "border-tint bg-tint/10"
                        : "border-hairline hover:border-hairline-strong bg-well/30"
                    )}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-well border border-hairline text-label shadow-mac-xs mb-3">
                      {isCompressing ? (
                        <div className="size-5 border-2 border-tint border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="size-5 text-label-2" />
                      )}
                    </div>
                    <span className="block text-[13.5px] font-medium text-label">
                      {isCompressing
                        ? "Görsel WebP formatına sıkıştırılıyor..."
                        : "Görseli buraya sürükleyin veya bilgisayardan seçin"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: KOD İSKELETİ & HARİCİ CDN KÜTÜPHANELERİ */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Popular CDN Libraries Section */}
              <div className="rounded-2xl border border-hairline bg-well/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="size-4 text-sys-blue" />
                    <span className="text-[13px] font-semibold text-label">
                      Harici Kütüphaneler & İkon Setleri (CDN)
                    </span>
                  </div>
                  <span className="pill bg-well border border-hairline text-[10px] text-label-2 font-mono">
                    CDN ile Anlık Yüklenir
                  </span>
                </div>
                <p className="text-[11.5px] text-label-3">
                  Şablonunuz Bootstrap, Tailwind, FontAwesome veya özel bir font gerektiriyorsa işaretleyin. 
                  Öğrencinin tuvaline CDN üzerinden saniyeler içinde akar.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {POPULAR_CDNS.map((cdn) => {
                    const isChecked = selectedCdns.includes(cdn.url);
                    return (
                      <div
                        key={cdn.id}
                        onClick={() => handleToggleCdn(cdn.url)}
                        className={cn(
                          "flex items-start gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all",
                          isChecked
                            ? "border-tint bg-tint/10 shadow-mac-xs"
                            : "border-hairline bg-surface hover:bg-well"
                        )}
                      >
                        <div
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded mt-0.5 border transition-all",
                            isChecked
                              ? "bg-tint border-tint text-white"
                              : "border-hairline-strong bg-surface"
                          )}
                        >
                          {isChecked && <Check className="size-3" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-label truncate">
                              {cdn.name}
                            </span>
                            <span className="text-[9.5px] font-mono text-label-3 uppercase">
                              {cdn.type}
                            </span>
                          </div>
                          <span className="text-[10.5px] text-label-3 block truncate">
                            {cdn.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom CDN Link Add */}
                <div className="flex items-center gap-2 pt-2 border-t border-hairline">
                  <input
                    type="url"
                    placeholder="Özel Harici CSS veya JS CDN Linki yapıştırın (https://...)"
                    value={customCdnInput}
                    onChange={(e) => setCustomCdnInput(e.target.value)}
                    className="mac-field text-[11.5px] py-1.5 flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCdn}
                    className="mac-btn mac-btn-secondary h-8 px-3 text-[11.5px] shrink-0"
                  >
                    <Plus className="size-3 mr-1" /> CDN Ekle
                  </button>
                </div>
              </div>

              {/* Starter HTML Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12.5px] font-medium text-label">
                    Başlangıç HTML İskeleti (Öğrenciye Verilecek Ham Yapı)
                  </label>
                  <span className="text-[11px] font-mono text-label-3">
                    Şablondan ayıklanan HTML parçasını buraya yapıştırın
                  </span>
                </div>
                <textarea
                  value={starterHtml}
                  onChange={(e) => setStarterHtml(e.target.value)}
                  rows={8}
                  className="mac-field font-mono text-[12px] leading-relaxed p-3.5 w-full bg-[#18181f] text-emerald-400 border border-hairline"
                  spellCheck={false}
                />
              </div>

              {/* Starter CSS Code (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12.5px] font-medium text-label">
                    Başlangıç CSS Kodları (İsteğe Bağlı Temel Reset / Sınıflar)
                  </label>
                  <span className="text-[11px] font-mono text-label-3">
                    Öğrenci sıfırdan yazacaksa boş bırakabilirsiniz
                  </span>
                </div>
                <textarea
                  value={starterCss}
                  onChange={(e) => setStarterCss(e.target.value)}
                  rows={4}
                  className="mac-field font-mono text-[12px] leading-relaxed p-3.5 w-full bg-[#18181f] text-tint border border-hairline"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* STEP 3: KURALLAR, İPUÇLARI & DAĞITIM */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Max Lines Goal */}
              <div className="rounded-2xl border border-hairline bg-well/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="size-4 text-sys-orange" />
                    <span className="text-[13px] font-semibold text-label">
                      Clean Code Hedefi: Maksimum Satır Limiti
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      max={300}
                      value={maxLinesGoal}
                      onChange={(e) => setMaxLinesGoal(Number(e.target.value))}
                      className="mac-field w-20 text-center font-mono font-bold text-tint"
                    />
                    <span className="text-[12px] text-label-2 font-mono">Satır CSS</span>
                  </div>
                </div>
                <p className="text-[11.5px] text-label-3">
                  Bu satır sayısının altında kalarak hedef görseli yakalayan öğrencilere otomatik olarak <strong>Clean Slicer</strong> rozeti ve +150 bonus XP verilir.
                </p>
              </div>

              {/* Hints Management */}
              <div>
                <label className="block text-[12.5px] font-medium text-label mb-2">
                  Öğrenciye Sağlanacak İpuçları (Guideline Drawer'da Görünür)
                </label>

                <div className="space-y-2 mb-3">
                  {hints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-surface p-2.5 text-[12px] text-label-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[14px]">💡</span>
                        <span className="truncate">{hint}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHint(idx)}
                        className="text-label-3 hover:text-rose-400 p-1 cursor-pointer"
                        title="İpucunu Sil"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Yeni ipucu ekle (örn: Grid auto-fit ve minmax kullanın)..."
                    value={newHintInput}
                    onChange={(e) => setNewHintInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHint();
                      }
                    }}
                    className="mac-field text-[12px] py-1.5 flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddHint}
                    className="mac-btn mac-btn-secondary h-8 px-3 text-[12px] shrink-0"
                  >
                    <Plus className="size-3.5 mr-1" /> Ekle
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12.5px] font-medium text-label mb-2">
                  Detaylı Görev Yönergesi (Opsiyonel)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Öğrencilerin dikkat etmesi gereken özel kurallar, font büyüklükleri ve responsive beklentiler..."
                  className="mac-field text-[12.5px] p-3 w-full"
                />
              </div>

              {/* Offline Backup Notice */}
              <div className="rounded-xl border border-hairline bg-surface p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Download className="size-4 text-label-3" />
                  <div>
                    <span className="block text-[12px] font-medium text-label">
                      Çevrimdışı / Yerel Yedekleme (.csspg.json)
                    </span>
                    <span className="block text-[10.5px] text-label-3">
                      Bu görevi bilgisayarınıza dosya olarak kaydedip dilediğiniz zaman internetsiz yükleyebilirsiniz.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="mac-btn mac-btn-secondary h-7 px-3 text-[11px]"
                >
                  JSON İndir
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-hairline px-6 py-4 bg-well/40 backdrop-blur-md">
          <div>
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                className="mac-btn mac-btn-secondary h-9 px-4 text-[12.5px]"
              >
                ‹ Geri
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="mac-btn mac-btn-secondary h-9 px-4 text-[12.5px]"
            >
              Vazgeç
            </button>

            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 1 && !title.trim()) {
                    setTitleError("Lütfen bir görev başlığı belirleyin.");
                    return;
                  }
                  setActiveStep((prev) => (prev + 1) as any);
                }}
                className="mac-btn mac-btn-primary h-9 px-5 text-[12.5px] font-medium"
              >
                Devam Et ›
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                className="mac-btn mac-btn-primary h-9 px-6 text-[12.5px] font-medium gap-2 shadow-mac-md"
              >
                <Send className="size-3.5" />
                <span>Sınıfa Canlı Yayınla (Aktif Görev Yap)</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
