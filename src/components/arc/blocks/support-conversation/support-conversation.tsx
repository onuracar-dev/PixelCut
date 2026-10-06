"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Monitor,
  Paperclip,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import styles from "./support-conversation.module.css";
import { TriageMessage } from "../inbox-triage/inbox-triage";

export interface ConversationMessage {
  id: string;
  sender: "student" | "developer" | "system";
  senderName: string;
  text: string;
  timestamp: string;
  attachments?: string[];
}

export interface SupportConversationProps {
  ticket: TriageMessage;
  developerName?: string;
  onBack?: () => void;
  onSend?: (message: string) => void;
  onResolve?: (resolved: boolean) => void;
  className?: string;
}

const DEFAULT_QUICK_REPLIES = [
  "Ekran kartı donanım hızlandırmasını kapatıp dene.",
  "Ctrl + Shift + R ile önbelleği temizleyip yeniden başlat.",
  "CSS koduna 'overflow: hidden' ekleyince düzeldi mi?",
  "Sürücü uyumsuzluğunu giderdik, yeni sürümü indirebilirsin.",
  "Sorun incelendi ve çözüldü olarak işaretlendi. Başarılar!",
];

export function SupportConversation({
  ticket,
  developerName = "Onur Acar (Developer)",
  onBack,
  onSend,
  onResolve,
  className,
}: SupportConversationProps) {
  const [isResolved, setIsResolved] = React.useState<boolean>(ticket.folder === "archive");
  const [inputText, setInputText] = React.useState<string>("");
  const [isTyping, setIsTyping] = React.useState<boolean>(false);
  const threadEndRef = React.useRef<HTMLDivElement>(null);

  // Initialize or re-synchronize thread messages whenever ticket.id changes
  const [messages, setMessages] = React.useState<ConversationMessage[]>(() => buildInitialMessages(ticket));

  React.useEffect(() => {
    setMessages(buildInitialMessages(ticket));
    setIsResolved(ticket.folder === "archive");
    setInputText("");
  }, [ticket.id, ticket.folder]);

  const scrollToBottom = () => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: ConversationMessage = {
      id: `dev-${Date.now()}`,
      sender: "developer",
      senderName: developerName,
      text,
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    onSend?.(text);

    // Simulate student response for rich live interaction
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `st-${Date.now()}`,
            sender: "student",
            senderName: ticket.sender,
            text: "Teşekkür ederim Onur hocam, hemen deniyorum!",
            timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1500);
    }, 600);
  };

  const handleToggleResolve = () => {
    const next = !isResolved;
    setIsResolved(next);
    onResolve?.(next);

    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "system",
        senderName: "Sistem",
        text: next
          ? "Talep geliştirici tarafından 'Çözüldü' olarak işaretlendi."
          : "Talep tekrar incelemeye açıldı.",
        timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className={`${styles.conversation} ${className || ""}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title="Geri Dön"
              className={styles.backBtn}
            >
              <ArrowLeft className="size-4" />
            </button>
          )}

          <div className={styles.avatar}>
            {ticket.sender
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
            <div className={styles.onlineBadge} />
          </div>

          <div className={styles.contactInfo}>
            <div className={styles.contactName}>
              <span>{ticket.sender}</span>
              <span className={styles.ticketTag}>#{ticket.id}</span>
            </div>
            <span className={styles.contactMeta}>{ticket.senderEmail}</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            onClick={handleToggleResolve}
            data-resolved={isResolved}
            className={styles.resolveBtn}
          >
            {isResolved ? (
              <>
                <CheckCircle2 className="size-3.5" />
                <span>Çözüldü</span>
              </>
            ) : (
              <>
                <RotateCcw className="size-3.5" />
                <span>Çözüldü Olarak İşaretle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message Thread */}
      <div className={styles.thread}>
        {messages.map((m) => {
          if (m.sender === "system") {
            return (
              <div key={m.id} className={styles.systemCard}>
                <Monitor className="size-3.5 inline mr-1.5 text-blue-400" />
                {m.text}
              </div>
            );
          }

          const isDev = m.sender === "developer";
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`${styles.messageRow} ${
                isDev ? styles.messageRowOutgoing : styles.messageRowIncoming
              }`}
            >
              <div
                className={`${styles.msgBubble} ${
                  isDev ? styles.msgOutgoing : styles.msgIncoming
                }`}
              >
                <div>{m.text}</div>

                {m.attachments && m.attachments.length > 0 && (
                  <div className={styles.attachmentList}>
                    {m.attachments.map((att, i) => (
                      <div key={i} className={styles.attachmentItem}>
                        <ImageIcon className="size-3" />
                        <span>{att}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.msgMeta}>
                  <span>{m.senderName}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {isTyping && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* Quick Reply Chips */}
      <div className={styles.quickReplies}>
        <Sparkles className="size-3.5 text-blue-400 shrink-0 mr-1" />
        {DEFAULT_QUICK_REPLIES.map((reply, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(reply)}
            className={styles.quickReplyChip}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form
        className={styles.composer}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Öğrenciye yanıt yaz veya hızlı yanıtlardan seç..."
          className={styles.inputField}
          autoFocus
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className={styles.sendBtn}
          title="Gönder (Enter)"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

function buildInitialMessages(ticket: TriageMessage): ConversationMessage[] {
  const list: ConversationMessage[] = [
    {
      id: `init-${ticket.id}`,
      sender: "student",
      senderName: ticket.sender,
      text: ticket.body,
      timestamp: ticket.time,
      attachments: ticket.fileNames,
    },
  ];

  if (ticket.diagnostics) {
    list.push({
      id: `sys-${ticket.id}`,
      sender: "system",
      senderName: "Sistem Raporu",
      text: `Donanım & Teşhis Raporu: ${ticket.diagnostics.os || "OS"} | ${ticket.diagnostics.platform || "Platform"} | ${ticket.diagnostics.screen || "Çözünürlük"} | Tema: ${ticket.diagnostics.theme || "Koyu"}`,
      timestamp: ticket.time,
    });
  }

  return list;
}
