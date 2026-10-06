"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Archive,
  Clock,
  CheckCircle,
  Cpu,
  FileText,
  HardDrive,
  Inbox,
  MessageSquare,
  Monitor,
  RotateCcw,
  Sparkles,
  Terminal,
  Undo2,
  XCircle,
} from "lucide-react";
import styles from "./inbox-triage.module.css";

export interface TriageMessage {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  body: string;
  time: string;
  unread: boolean;
  folder: "inbox" | "snoozed" | "archive";
  topic?: string;
  diagnostics?: {
    os?: string;
    platform?: string;
    screen?: string;
    theme?: string;
    userRole?: string;
    timestamp?: string;
  } | null;
  fileNames?: string[];
  avatarUrl?: string;
}

const DEFAULT_MESSAGES: TriageMessage[] = [
  {
    id: "PC-84192",
    sender: "Berk Yılmaz",
    senderEmail: "berk.yilmaz@lab.edu.tr",
    subject: "CSS Grid ve Canlı Tuval Hizalama Bozulması",
    snippet: "display: grid ile 3 sütun yaptığımda sağ taşma oluyor ve tuval titriyor...",
    body: "Hocam merhaba, CSS Battle arenasında 3. hedefi yaparken grid-template-columns: repeat(3, 1fr) tanımladığım anda tuval taşma yapıyor ve Electron ekranı anlık olarak titriyor. Ekran görüntüsü ve donanım raporumu ekledim.",
    time: "10:42",
    unread: true,
    folder: "inbox",
    topic: "canvas",
    diagnostics: {
      os: "Windows 11 (x64)",
      platform: "PixelCut Desktop (Electron v34.0)",
      screen: "1920x1080 (DPR: 1.25)",
      theme: "spacegray",
      userRole: "Öğrenci",
    },
    fileNames: ["ekran-goruntusu-grid-tasmasi.png"],
  },
  {
    id: "PC-71932",
    sender: "Zeynep Kaya",
    senderEmail: "zeynep.kaya@lab.edu.tr",
    subject: "Git Commit Sırasında Dosya Değişikliği Algılanmıyor",
    snippet: "styles.css'e yeni kural yazdım ama Git panelinde Staged Changes boş...",
    body: "Hocam styles.css'e kod eklememe rağmen sol taraftaki Git sekmesinde değişiklikler listelenmiyor. Terminalden commit atmaya çalıştığımda da 'nothing to commit' uyarısı alıyorum.",
    time: "09:15",
    unread: true,
    folder: "inbox",
    topic: "git",
    diagnostics: {
      os: "macOS Sonoma (Apple Silicon)",
      platform: "PixelCut Desktop (Electron v34.0)",
      screen: "2560x1600 (DPR: 2.0)",
      theme: "cupertino",
      userRole: "Öğrenci",
    },
    fileNames: ["git-status-log.txt"],
  },
  {
    id: "PC-59284",
    sender: "Emre Demir",
    senderEmail: "emre.demir@lab.edu.tr",
    subject: "Ders İçi Canlı Sınıfa Katılma Bağlantı Hatası",
    snippet: "Hoca odası açıldığında 'WebSocket presence timeout' hatası alıyorum...",
    body: "Ders içi Lab odası radarında sınıfa girmeye çalıştığımda 15 saniye sonra bağlantı kopuyor. Üniversite Wi-Fi ağından mı kaynaklanıyor acaba?",
    time: "Dün",
    unread: false,
    folder: "snoozed",
    topic: "network",
    diagnostics: {
      os: "Windows 10 Pro (x64)",
      platform: "Web Tarayıcı (Chrome 128)",
      screen: "1366x768 (DPR: 1.0)",
      theme: "obsidian",
      userRole: "Öğrenci",
    },
    fileNames: ["network-console.log"],
  },
  {
    id: "PC-31049",
    sender: "Ayşe Çelik",
    senderEmail: "ayse.celik@lab.edu.tr",
    subject: "Koyu Tema Kontrast ve Font Okunabilirlik Önerisi",
    snippet: "Titanium temasında yorum satırları biraz silik kalıyor...",
    body: "PixelCut harika olmuş ellerinize sağlık! Sadece Titanium temasında Monaco editor yorum satırları biraz zor okunuyor, gri tonu hafif açılabilirse harika olur.",
    time: "2 gün önce",
    unread: false,
    folder: "archive",
    topic: "suggestion",
    diagnostics: {
      os: "Ubuntu 24.04 LTS",
      platform: "Web Tarayıcı (Firefox 130)",
      screen: "1920x1080 (DPR: 1.0)",
      theme: "titanium",
      userRole: "Öğrenci",
    },
  },
];

export interface InboxTriageProps {
  initialMessages?: TriageMessage[];
  onOpenConversation?: (message: TriageMessage) => void;
  className?: string;
}

export function InboxTriage({
  initialMessages = DEFAULT_MESSAGES,
  onOpenConversation,
  className,
}: InboxTriageProps) {
  const [messages, setMessages] = React.useState<TriageMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pixelcut_support_tickets");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Map localStorage tickets to TriageMessage format
            const mapped: TriageMessage[] = parsed.map((item: any) => ({
              id: item.id || `PC-${Math.floor(10000 + Math.random() * 90000)}`,
              sender: item.userName || "Öğrenci",
              senderEmail: item.userEmail || "ogrenci@lab.edu.tr",
              subject: getTopicLabel(item.topic) || "Teknik Destek Talebi",
              snippet: item.description?.slice(0, 90) + (item.description?.length > 90 ? "..." : "") || "Detay belirtilmedi",
              body: item.description || "Açıklama yok",
              time: formatRelativeTime(item.createdAt),
              unread: true,
              folder: "inbox",
              topic: item.topic || "other",
              diagnostics: item.diagnostics || null,
              fileNames: item.fileNames || [],
            }));
            // Merge with default sample messages (avoid duplicates)
            const combined = [...mapped];
            DEFAULT_MESSAGES.forEach((dm) => {
              if (!combined.some((c) => c.id === dm.id)) {
                combined.push(dm);
              }
            });
            return combined;
          }
        }
      } catch (e) {}
    }
    return initialMessages;
  });

  const [currentFolder, setCurrentFolder] = React.useState<"inbox" | "snoozed" | "archive">("inbox");
  const [unreadOnly, setUnreadOnly] = React.useState<boolean>(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = React.useState<number>(0);
  const [lastAction, setLastAction] = React.useState<{
    id: string;
    from: "inbox" | "snoozed" | "archive";
    to: "inbox" | "snoozed" | "archive";
    subject: string;
  } | null>(null);

  // Filtered list
  const filteredMessages = React.useMemo(() => {
    return messages.filter((m) => {
      if (m.folder !== currentFolder) return false;
      if (unreadOnly && !m.unread) return false;
      return true;
    });
  }, [messages, currentFolder, unreadOnly]);

  const folderCounts = React.useMemo(() => {
    return {
      inbox: messages.filter((m) => m.folder === "inbox").length,
      snoozed: messages.filter((m) => m.folder === "snoozed").length,
      archive: messages.filter((m) => m.folder === "archive").length,
    };
  }, [messages]);

  const unreadCount = React.useMemo(() => {
    return messages.filter((m) => m.folder === "inbox" && m.unread).length;
  }, [messages]);

  const moveMessage = (id: string, targetFolder: "inbox" | "snoozed" | "archive") => {
    const target = messages.find((m) => m.id === id);
    if (!target) return;

    setLastAction({
      id: target.id,
      from: target.folder,
      to: targetFolder,
      subject: target.subject,
    });

    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, folder: targetFolder, unread: false } : m))
    );

    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const undoLastAction = () => {
    if (!lastAction) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === lastAction.id ? { ...m, folder: lastAction.from } : m))
    );
    setExpandedId(lastAction.id);
    setLastAction(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    // Mark as read when expanded
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: false } : m))
    );
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, filteredMessages.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" || e.key === " ") {
        const item = filteredMessages[focusedIndex];
        if (item) {
          e.preventDefault();
          toggleExpand(item.id);
        }
      } else if (e.key.toLowerCase() === "e") {
        const item = filteredMessages[focusedIndex];
        if (item && item.folder !== "archive") {
          e.preventDefault();
          moveMessage(item.id, "archive");
        }
      } else if (e.key.toLowerCase() === "s") {
        const item = filteredMessages[focusedIndex];
        if (item && item.folder === "inbox") {
          e.preventDefault();
          moveMessage(item.id, "snoozed");
        }
      } else if (e.key.toLowerCase() === "u") {
        const item = filteredMessages[focusedIndex];
        if (item && item.folder !== "inbox") {
          e.preventDefault();
          moveMessage(item.id, "inbox");
        }
      } else if (e.key.toLowerCase() === "z" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        undoLastAction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredMessages, focusedIndex, lastAction]);

  return (
    <div className={`${styles.triage} ${className || ""}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Geliştirici Destek Masası</h2>
          <span className={styles.unreadCount}>
            {unreadCount > 0 ? `${unreadCount} okunmamış talep` : "Tüm talepler güncel"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setUnreadOnly((prev) => !prev)}
          className={styles.unreadToggle}
          aria-pressed={unreadOnly}
        >
          <span
            className="size-1.5 rounded-full"
            style={{
              backgroundColor: unreadOnly ? "var(--surface, #18181b)" : "var(--accent, #3b82f6)",
            }}
          />
          Sadece Okunmamışlar
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={currentFolder === "inbox"}
            onClick={() => setCurrentFolder("inbox")}
            className={styles.tab}
          >
            {currentFolder === "inbox" && (
              <motion.div layoutId="triage-tab-indicator" className={styles.tabIndicator} />
            )}
            <Inbox className="size-3.5" />
            <span>Gelen Kutusu</span>
            <span className={styles.tabBadge}>{folderCounts.inbox}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={currentFolder === "snoozed"}
            onClick={() => setCurrentFolder("snoozed")}
            className={styles.tab}
          >
            {currentFolder === "snoozed" && (
              <motion.div layoutId="triage-tab-indicator" className={styles.tabIndicator} />
            )}
            <Clock className="size-3.5" />
            <span>Bekletilen</span>
            <span className={styles.tabBadge}>{folderCounts.snoozed}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={currentFolder === "archive"}
            onClick={() => setCurrentFolder("archive")}
            className={styles.tab}
          >
            {currentFolder === "archive" && (
              <motion.div layoutId="triage-tab-indicator" className={styles.tabIndicator} />
            )}
            <Archive className="size-3.5" />
            <span>Arşiv & Çözülen</span>
            <span className={styles.tabBadge}>{folderCounts.archive}</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className={styles.list}>
        {filteredMessages.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle className="size-8 opacity-40 text-emerald-400" />
            <p className="text-[13px] font-medium text-foreground">
              {currentFolder === "inbox"
                ? "Gelen kutusunda bekleyen talep yok!"
                : currentFolder === "snoozed"
                ? "Bekletilen talep bulunmuyor."
                : "Arşivde kayıtlı talep yok."}
            </p>
            <p className="text-[11.5px] text-muted-foreground">
              Öğrenciler destek modalından talep gönderdikçe burada otomatik listelenir.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isExpanded = expandedId === msg.id;
            const isFocused = focusedIndex === index;

            return (
              <div
                key={msg.id}
                className={`${styles.row} ${isFocused ? styles.rowSelected : ""}`}
              >
                {/* Summary Row */}
                <div className={styles.rowSummary} onClick={() => toggleExpand(msg.id)}>
                  {msg.unread ? (
                    <div className={styles.unreadDot} />
                  ) : (
                    <div className={styles.readDotPlaceholder} />
                  )}

                  <div className={styles.avatar}>
                    {msg.sender
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className={styles.meta}>
                    <div className={styles.senderRow}>
                      <span className={styles.senderName}>{msg.sender}</span>
                      <span className={styles.tagPill}>#{msg.id}</span>
                      {msg.topic && (
                        <span className={styles.tagPill}>{getTopicLabel(msg.topic)}</span>
                      )}
                    </div>

                    <div className={styles.contentRow}>
                      <span className={styles.subject}>{msg.subject}</span>
                      <span className={styles.snippet}>— {msg.snippet}</span>
                    </div>
                  </div>

                  <div className={styles.rightMeta}>
                    <span className={styles.time}>{msg.time}</span>

                    <div className={styles.quickActions} onClick={(e) => e.stopPropagation()}>
                      {msg.folder !== "archive" && (
                        <button
                          type="button"
                          title="Arşivle (E)"
                          onClick={() => moveMessage(msg.id, "archive")}
                          className={styles.iconBtn}
                        >
                          <Archive className="size-3.5" />
                        </button>
                      )}
                      {msg.folder === "inbox" && (
                        <button
                          type="button"
                          title="Beklet (S)"
                          onClick={() => moveMessage(msg.id, "snoozed")}
                          className={styles.iconBtn}
                        >
                          <Clock className="size-3.5" />
                        </button>
                      )}
                      {msg.folder !== "inbox" && (
                        <button
                          type="button"
                          title="Gelen Kutusuna Al (U)"
                          onClick={() => moveMessage(msg.id, "inbox")}
                          className={styles.iconBtn}
                        >
                          <RotateCcw className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      className={styles.details}
                    >
                      <div className={styles.detailsBody}>{msg.body}</div>

                      {/* Diagnostics Chips */}
                      {msg.diagnostics && (
                        <div className={styles.diagnosticsBar}>
                          <span className="text-muted-foreground mr-1 flex items-center gap-1">
                            <Monitor className="size-3" /> Donanım:
                          </span>
                          {msg.diagnostics.os && (
                            <span className={styles.diagChip}>{msg.diagnostics.os}</span>
                          )}
                          {msg.diagnostics.platform && (
                            <span className={styles.diagChip}>{msg.diagnostics.platform}</span>
                          )}
                          {msg.diagnostics.screen && (
                            <span className={styles.diagChip}>{msg.diagnostics.screen}</span>
                          )}
                          {msg.diagnostics.theme && (
                            <span className={styles.diagChip}>Tema: {msg.diagnostics.theme}</span>
                          )}
                        </div>
                      )}

                      {/* Attached Files */}
                      {msg.fileNames && msg.fileNames.length > 0 && (
                        <div className={styles.attachmentsRow}>
                          <span className="text-[11px] text-muted-foreground mr-1 flex items-center gap-1">
                            <FileText className="size-3" /> Ekler:
                          </span>
                          {msg.fileNames.map((fn, i) => (
                            <span key={i} className={styles.attachmentBadge}>
                              <FileText className="size-3" />
                              {fn}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className={styles.actionRow}>
                        <div className={styles.actionBtnGroup}>
                          {msg.folder === "inbox" ? (
                            <button
                              type="button"
                              onClick={() => moveMessage(msg.id, "snoozed")}
                              className={styles.btnAction}
                            >
                              <Clock className="size-3.5" />
                              Beklet (S)
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => moveMessage(msg.id, "inbox")}
                              className={styles.btnAction}
                            >
                              <RotateCcw className="size-3.5" />
                              Gelen Kutusuna Taşı (U)
                            </button>
                          )}

                          {msg.folder !== "archive" && (
                            <button
                              type="button"
                              onClick={() => moveMessage(msg.id, "archive")}
                              className={styles.btnAction}
                            >
                              <Archive className="size-3.5" />
                              Çözüldü Olarak Arşivle (E)
                            </button>
                          )}
                        </div>

                        {onOpenConversation && (
                          <button
                            type="button"
                            onClick={() => onOpenConversation(msg)}
                            className={styles.btnPrimaryAction}
                          >
                            <MessageSquare className="size-3.5" />
                            Yanıtla & Sohbet Başlat
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.shortcuts}>
          <span>
            <kbd className={styles.kbd}>↑</kbd> <kbd className={styles.kbd}>↓</kbd> Gezin
          </span>
          <span>
            <kbd className={styles.kbd}>Enter</kbd> Detay
          </span>
          <span>
            <kbd className={styles.kbd}>E</kbd> Arşivle
          </span>
          <span>
            <kbd className={styles.kbd}>S</kbd> Beklet
          </span>
        </div>

        {lastAction && (
          <div className={styles.undoToast}>
            <span>
              #{lastAction.id} {lastAction.to === "archive" ? "arşivlendi" : "taşındı"}.
            </span>
            <button type="button" onClick={undoLastAction} className={styles.undoBtn}>
              Geri Al
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getTopicLabel(topic?: string) {
  switch (topic) {
    case "canvas":
      return "Tuval & Render";
    case "network":
      return "Sınıf & Bağlantı";
    case "git":
      return "Git & Kayıt";
    case "perf":
      return "Performans";
    case "suggestion":
      return "Öneri";
    default:
      return "Teknik Destek";
  }
}

function formatRelativeTime(isoString?: string) {
  if (!isoString) return "Bugün";
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Az önce";
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} sa`;
    return "Dün";
  } catch (e) {
    return "Bugün";
  }
}
