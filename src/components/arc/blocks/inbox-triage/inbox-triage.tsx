"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Archive,
  Clock,
  CheckCircle,
  FileText,
  Inbox,
  MessageSquare,
  Monitor,
  RotateCcw,
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

export const DEFAULT_MESSAGES: TriageMessage[] = [];

export interface InboxTriageProps {
  initialMessages?: TriageMessage[];
  selectedTicketId?: string | null;
  onSelectTicket?: (message: TriageMessage) => void;
  onOpenConversation?: (message: TriageMessage) => void;
  className?: string;
}

export function InboxTriage({
  initialMessages = DEFAULT_MESSAGES,
  selectedTicketId,
  onSelectTicket,
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

  const handleRowClick = (msg: TriageMessage) => {
    // Mark as read
    if (msg.unread) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, unread: false } : m))
      );
    }
    // Select ticket for active conversation
    onSelectTicket?.(msg);
    onOpenConversation?.(msg);
  };

  return (
    <div className={`${styles.triage} ${className || ""}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Destek Talepleri</h2>
          <span className={styles.unreadCount}>
            {unreadCount > 0 ? `${unreadCount} yeni` : "Tümü okundu"}
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
              backgroundColor: unreadOnly ? "#141416" : "#3b82f6",
            }}
          />
          Okunmamış
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
            <span>Gelen</span>
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
            <span>Bekleyen</span>
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
            <span>Çözülen</span>
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
            const isSelected = selectedTicketId === msg.id;

            return (
              <div
                key={msg.id}
                className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
                onClick={() => handleRowClick(msg)}
              >
                {/* Summary Row */}
                <div className={styles.rowSummary}>
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

                  <div className={styles.rightMeta} onClick={(e) => e.stopPropagation()}>
                    <span className={styles.time}>{msg.time}</span>

                    <div className={styles.quickActions}>
                      <button
                        type="button"
                        title="Sohbeti Aç"
                        onClick={() => handleRowClick(msg)}
                        className={styles.iconBtn}
                      >
                        <MessageSquare className="size-3.5 text-blue-400" />
                      </button>

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
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.shortcuts}>
          <span>
            <kbd className={styles.kbd}>Tıkla</kbd> Sohbeti Aç
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
