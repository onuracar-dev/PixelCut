"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Cpu,
  FileText,
  HardDrive,
  HelpCircle,
  Image as ImageIcon,
  LifeBuoy,
  MessageSquare,
  Monitor,
  Send,
  Sparkles,
  Terminal,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload, FileUploadItem } from "@/components/arc/file-upload/file-upload";
import { ActionButton } from "@/components/arc/action-button/action-button";
import { useAppearance } from "@/lib/appearance";
import { UserRole } from "@/types";

export interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    name: string;
    email?: string;
    role?: UserRole;
  };
}

const SUPPORT_TOPICS = [
  { id: "canvas", label: "Tuval & CSS Render Hatası", icon: Bug },
  { id: "network", label: "Canlı Sınıf & Bağlantı Sorunu", icon: Cpu },
  { id: "git", label: "Dosya Kaydetme / Git Hatası", icon: HardDrive },
  { id: "perf", label: "Performans & Donma", icon: Terminal },
  { id: "suggestion", label: "Öneri & Geri Bildirim", icon: Sparkles },
  { id: "other", label: "Diğer Teknik Destek", icon: HelpCircle },
];

export function SupportModal({
  isOpen,
  onClose,
  currentUser = { name: "Öğrenci", email: "ogrenci@lab.edu.tr", role: "student" },
}: SupportModalProps) {
  const { appearance } = useAppearance();

  // Form State
  const [selectedTopic, setSelectedTopic] = React.useState<string>("canvas");
  const [userEmail, setUserEmail] = React.useState<string>(currentUser.email || "ogrenci@lab.edu.tr");
  const [userName, setUserName] = React.useState<string>(currentUser.name || "Öğrenci");
  const [description, setDescription] = React.useState<string>("");
  const [uploadedFiles, setUploadedFiles] = React.useState<FileUploadItem[]>([]);
  const [includeDiagnostics, setIncludeDiagnostics] = React.useState<boolean>(true);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [ticketId, setTicketId] = React.useState<string>("");

  // Gather Client System Diagnostics
  const systemDiagnostics = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    const ua = navigator.userAgent;
    const isWindows = ua.includes("Windows");
    const isMac = ua.includes("Macintosh");
    const isLinux = ua.includes("Linux");

    const osName = isWindows
      ? "Windows (x64)"
      : isMac
      ? "macOS"
      : isLinux
      ? "Linux"
      : "Bilinmeyen OS";

    const isElectron = Boolean(
      (window as any).electronAPI || ua.includes("Electron")
    );

    return {
      os: osName,
      platform: isElectron ? "PixelCut Desktop (Electron)" : "Web Tarayıcı",
      screen: `${window.innerWidth}x${window.innerHeight} (DPR: ${window.devicePixelRatio || 1})`,
      theme: appearance,
      userRole: currentUser.role === "teacher" ? "Öğretmen" : "Öğrenci",
      timestamp: new Date().toLocaleTimeString("tr-TR"),
    };
  }, [appearance, currentUser.role, isOpen]);

  // Reset when re-opened
  React.useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setDescription("");
      setUploadedFiles([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!description.trim()) {
      return;
    }

    const randomTicket = `PC-${Math.floor(10000 + Math.random() * 90000)}`;
    setTicketId(randomTicket);

    const ticketData = {
      id: randomTicket,
      topic: selectedTopic,
      userName,
      userEmail,
      description,
      filesCount: uploadedFiles.length,
      fileNames: uploadedFiles.map((f) => f.file.name),
      diagnostics: includeDiagnostics ? systemDiagnostics : null,
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage for diagnostic logs
    try {
      const existing = JSON.parse(
        localStorage.getItem("pixelcut_support_tickets") || "[]"
      );
      existing.unshift(ticketData);
      localStorage.setItem("pixelcut_support_tickets", JSON.stringify(existing.slice(0, 20)));
    } catch (e) {}

    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[26px] border border-hairline/90 bg-surface/95 dark:bg-[#18181b]/95 backdrop-blur-2xl shadow-mac-2xl overflow-hidden text-label"
      >
        {/* Apple Window Header */}
        <div className="flex h-13 items-center justify-between border-b border-hairline px-5 shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="grid size-7 place-items-center rounded-lg bg-well text-tint border border-hairline">
              <LifeBuoy className="size-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight text-label">
                PixelCut Destek & Hata Bildirimi
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-full hover:bg-well text-label-3 hover:text-label transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {isSubmitted ? (
            <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-mac-sm">
                <CheckCircle2 className="size-8 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[18px] font-semibold text-label">
                  Destek Talebiniz Alındı!
                </h3>
                <p className="text-[13px] text-label-2 max-w-md mx-auto">
                  Raporunuz <span className="font-mono font-bold text-label">#{ticketId}</span> referans kodu ile kaydedildi. Ekran görüntüsü ve donanım raporunuz geliştirici ekibine iletildi.
                </p>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-6 rounded-full bg-label text-surface font-semibold text-[13px] hover:opacity-90 transition-opacity cursor-pointer shadow-mac-sm"
                >
                  Pencereyi Kapat
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Auto Diagnostics Banner */}
              {systemDiagnostics && (
                <div className="rounded-[18px] border border-hairline/80 bg-well/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-semibold text-label flex items-center gap-1.5">
                      <Monitor className="size-3.5 text-tint" />
                      Otomatik Algılanan Sistem ve Donanım Raporu
                    </span>
                    <label className="flex items-center gap-1.5 text-[11px] text-label-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeDiagnostics}
                        onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                        className="rounded accent-tint size-3.5"
                      />
                      Rapora Ekle
                    </label>
                  </div>

                  {includeDiagnostics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-label-2 pt-1 border-t border-hairline/50">
                      <div>
                        <span className="text-label-3 block text-[10px]">İŞLETİM SİSTEMİ</span>
                        <span className="font-medium text-label truncate block">{systemDiagnostics.os}</span>
                      </div>
                      <div>
                        <span className="text-label-3 block text-[10px]">PLATFORM</span>
                        <span className="font-medium text-label truncate block">{systemDiagnostics.platform}</span>
                      </div>
                      <div>
                        <span className="text-label-3 block text-[10px]">ÇÖZÜNÜRLÜK</span>
                        <span className="font-medium text-label truncate block">{systemDiagnostics.screen}</span>
                      </div>
                      <div>
                        <span className="text-label-3 block text-[10px]">AKTİF TEMA</span>
                        <span className="font-medium text-label truncate block uppercase">{systemDiagnostics.theme}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Topic Pills */}
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-label ml-0.5">
                  Sorun veya Talep Kategorisi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUPPORT_TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    const isSelected = selectedTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setSelectedTopic(topic.id)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-xl border text-left text-[11.5px] transition-all cursor-pointer select-none",
                          isSelected
                            ? "bg-surface border-label text-label shadow-mac-xs ring-1 ring-hairline-strong font-semibold"
                            : "bg-well/40 border-hairline text-label-2 hover:bg-well hover:text-label"
                        )}
                      >
                        <Icon className={cn("size-3.5 shrink-0", isSelected ? "text-tint" : "text-label-3")} />
                        <span className="truncate">{topic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Email & Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11.5px] font-medium text-label-2 ml-0.5">
                    Adınız Soyadınız
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full h-10 px-3.5 rounded-xl bg-well/50 border border-hairline text-[13px] text-label focus:outline-none focus:border-label transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11.5px] font-medium text-label-2 ml-0.5">
                    İletişim E-posta Adresi
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="ornek@universite.edu.tr"
                    className="w-full h-10 px-3.5 rounded-xl bg-well/50 border border-hairline text-[13px] text-label focus:outline-none focus:border-label transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between ml-0.5">
                  <label className="text-[11.5px] font-medium text-label-2">
                    Sorun Detayı & Ne Zaman Gerçekleşti?
                  </label>
                  <span className="text-[10.5px] font-mono text-label-3">
                    {description.length}/500
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Hatanın oluştuğu anı, tıkladığınız butonu veya beklenmeyen davranışı kısaca tarif edin..."
                  className="w-full p-3 rounded-xl bg-well/50 border border-hairline text-[13px] text-label placeholder:text-label-3 resize-none focus:outline-none focus:border-label transition-colors"
                />
              </div>

              {/* File Upload via @uiarc/file-upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-0.5">
                  <label className="text-[11.5px] font-medium text-label-2 flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-label-3" />
                    Ekran Görüntüsü veya Hata Günlüğü (Opsiyonel)
                  </label>
                  <span className="text-[11px] text-label-3">PNG, JPG, LOG (Maks: 10MB)</span>
                </div>

                <div className="rounded-2xl border border-hairline/80 bg-well/30 p-2">
                  <FileUpload
                    label="Ekran görüntüsü yüklemek için tıklayın veya buraya sürükleyin"
                    description="Sorunu görsel olarak görmemiz çözümü hızlandırır."
                    accept="image/*,.log,.txt"
                    multiple={true}
                    maxSize={10 * 1024 * 1024}
                    value={uploadedFiles}
                    onChange={setUploadedFiles}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isSubmitted && (
          <div className="flex items-center justify-between border-t border-hairline p-4 px-6 shrink-0 bg-surface/80 backdrop-blur-xl">
            <span className="text-[11px] text-label-3 hidden sm:inline">
              Geri bildirimleriniz PixelCut&apos;ı mükemmelleştirmek için kullanılır.
            </span>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-full text-[12.5px] font-medium text-label-2 hover:text-label hover:bg-well transition-colors cursor-pointer"
              >
                Vazgeç
              </button>

              <ActionButton
                label="Talebi Gönder"
                pendingLabel="Gönderiliyor..."
                successLabel="İletildi"
                onAction={handleSubmit}
                disabled={!description.trim()}
                className={cn(
                  "h-9 px-5 rounded-full text-[12.5px] font-semibold shadow-mac-xs cursor-pointer",
                  !description.trim() && "opacity-50 pointer-events-none"
                )}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
