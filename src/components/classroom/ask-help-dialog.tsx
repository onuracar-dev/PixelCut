"use client";

import * as React from "react";
import { Hand, LifeBuoy, CheckCircle2, X, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface AskHelpDialogProps {
  isHelpActive: boolean;
  activeTopic?: string;
  isTeacherConnected?: boolean;
  teacherName?: string;
  onAskHelp: (topic: string, note?: string) => void;
  onCancelHelp: () => void;
  className?: string;
}

const COMMON_TOPICS = [
  "Flexbox / Grid Dikey-Yatay Ortalama",
  "Taşan İçerik ve Overflow Sorunu",
  "Piksel ve Boyutlama Uyuşmazlığı",
  "Gereksiz / Şişik CSS Temizliği",
  "Buton veya Kart Pozisyonlama (Absolute/Relative)",
];

export function AskHelpDialog({
  isHelpActive,
  activeTopic,
  isTeacherConnected,
  teacherName = "Eğitmen",
  onAskHelp,
  onCancelHelp,
  className,
}: AskHelpDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedTopic, setSelectedTopic] = React.useState(COMMON_TOPICS[0]);
  const [customNote, setCustomNote] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAskHelp(selectedTopic, customNote);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button in Header/Toolbar */}
      <div className={cn("relative inline-flex items-center", className)}>
        {isTeacherConnected ? (
          <div className="flex items-center gap-2 rounded-full border border-hairline bg-well/80 px-3 py-1 text-[11.5px] font-medium text-label shadow-mac-xs backdrop-blur-md select-none">
            <span className="relative size-1.5 rounded-full bg-label-3" />
            <Sparkles className="size-3.5 text-label-2" />
            <span>{teacherName} Masanıza Bağlandı</span>
          </div>
        ) : isHelpActive ? (
          <div className="flex items-center gap-1.5 rounded-full border border-hairline bg-well/80 px-2.5 py-1 text-[11.5px] font-medium text-label shadow-mac-xs backdrop-blur-md select-none">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-label-4 opacity-75" />
              <span className="relative size-2 rounded-full bg-label-3" />
            </span>
            <span className="truncate max-w-[130px] text-label-2">Yardım Bekleniyor...</span>
            <button
              type="button"
              onClick={onCancelHelp}
              className="ml-1 rounded-full p-0.5 hover:bg-fill text-label-3 hover:text-label transition-colors"
              title="Yardım Talebini İptal Et"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mac-btn mac-btn-secondary h-[28px] px-2.5 text-[12px] font-medium text-label"
            title="Eğitmenden Canlı Yardım İste"
          >
            <Hand className="size-3.5 text-label-3" />
            <span>Hocadan Yardım İste</span>
          </button>
        )}
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-md rounded-[22px] border border-hairline bg-surface p-6 shadow-mac-lg animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-well text-label shadow-mac-xs">
                  <LifeBuoy className="size-5 text-label-2" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-label">
                    Eğitmenden Yardım İste
                  </h3>
                  <p className="text-[12px] text-label-2 mt-0.5">
                    Talebiniz hocanın ekranına bildirim olarak düşer.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mac-icon-btn -mr-1 -mt-1"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-label-2 block mb-2">
                  Hangi konuda takıldınız?
                </label>
                <div className="flex flex-col gap-1.5">
                  {COMMON_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      className={cn(
                        "flex items-center justify-between rounded-[10px] border px-3 py-2 text-left text-[12.5px] transition-all",
                        selectedTopic === topic
                          ? "border-hairline-strong bg-well font-semibold text-label shadow-xs"
                          : "border-hairline bg-well/40 text-label-2 hover:text-label hover:bg-well"
                      )}
                    >
                      <span className="truncate">{topic}</span>
                      {selectedTopic === topic && (
                        <CheckCircle2 className="size-3.5 shrink-0 text-label ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-label-2 block mb-1.5">
                  Kısa bir not ekleyin (İsteğe bağlı):
                </label>
                <div className="relative">
                  <textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Örn: 24. satırdaki flexbox'ı hizalayamadım..."
                    rows={2}
                    className="w-full rounded-[12px] border border-hairline bg-well p-2.5 text-[12px] text-label placeholder:text-label-3 outline-none resize-none focus:border-hairline-strong focus:bg-surface transition-all"
                  />
                  <MessageSquare className="absolute right-2.5 bottom-2.5 size-3.5 text-label-4 pointer-events-none" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mac-btn mac-btn-secondary text-[12.5px]"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="mac-btn mac-btn-primary text-[12.5px]"
                >
                  <Hand className="size-3.5" />
                  <span>Eğitmene Bildir</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
