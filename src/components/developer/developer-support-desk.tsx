"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Columns2,
  Inbox,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  InboxTriage,
  TriageMessage,
  DEFAULT_MESSAGES,
} from "@/components/arc/blocks/inbox-triage/inbox-triage";
import { SupportConversation } from "@/components/arc/blocks/support-conversation/support-conversation";

export interface DeveloperSupportDeskProps {
  isOpen: boolean;
  onClose: () => void;
  developerEmail?: string;
  developerName?: string;
}

export function DeveloperSupportDesk({
  isOpen,
  onClose,
  developerEmail = "onuracar.work@gmail.com",
  developerName = "Onur Acar",
}: DeveloperSupportDeskProps) {
  // Default to the first ticket so the chat is NEVER empty or hidden!
  const [selectedTicket, setSelectedTicket] = React.useState<TriageMessage>(DEFAULT_MESSAGES[0]);
  const [viewMode, setViewMode] = React.useState<"split" | "chat" | "triage">("split");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative w-full max-w-6xl h-[88vh] flex flex-col rounded-[22px] border border-white/12 bg-[#0e0e11] text-[#f4f4f6] shadow-2xl overflow-hidden select-none"
      >
        {/* macOS Window Title Bar */}
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-5 shrink-0 bg-[#16161a]">
          {/* Left: Dev Badge & Info */}
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-sm">
              <ShieldCheck className="size-4.5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-semibold tracking-tight text-white">
                  PixelCut Developer Desk
                </h2>
                <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  DEVELOPER / ADMIN
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Giriş Yapan: <span className="text-zinc-200 font-medium">{developerName}</span> ({developerEmail})
              </p>
            </div>
          </div>

          {/* Center: View Switcher (Split vs Chat vs Triage) */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/8 text-[12px]">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === "split"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Columns2 className="size-3.5" />
              <span>Bölünmüş Görünüm</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("chat")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === "chat"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <MessageSquare className="size-3.5" />
              <span>Canlı Sohbet ({selectedTicket.sender})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("triage")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === "triage"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Inbox className="size-3.5" />
              <span>Bilet Listesi</span>
            </button>
          </div>

          {/* Right: Close Window */}
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-white/5 hover:bg-white/12 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-hidden p-3 sm:p-4 flex gap-3.5 bg-[#0a0a0c]">
          {/* Left Column: Inbox Triage (Always visible in split and triage mode) */}
          {(viewMode === "split" || viewMode === "triage") && (
            <div
              className={`h-full flex flex-col transition-all ${
                viewMode === "split"
                  ? "w-full md:w-[380px] shrink-0"
                  : "w-full max-w-4xl mx-auto"
              }`}
            >
              <InboxTriage
                selectedTicketId={selectedTicket.id}
                onSelectTicket={(ticket) => {
                  setSelectedTicket(ticket);
                  if (viewMode === "triage") {
                    setViewMode("split");
                  }
                }}
                className="h-full"
              />
            </div>
          )}

          {/* Right Column: Support Conversation Chat Thread (Always visible in split and chat mode) */}
          {(viewMode === "split" || viewMode === "chat") && (
            <div className="flex-1 h-full min-w-0 flex flex-col">
              <SupportConversation
                ticket={selectedTicket}
                developerName={developerName}
                onBack={viewMode === "chat" ? () => setViewMode("split") : undefined}
                onResolve={(resolved) => {
                  setSelectedTicket((prev) => ({
                    ...prev,
                    folder: resolved ? "archive" : "inbox",
                  }));
                }}
                className="h-full"
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
