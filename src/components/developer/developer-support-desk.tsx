"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Cpu,
  HelpCircle,
  Laptop,
  LifeBuoy,
  MessageSquare,
  ShieldCheck,
  Terminal,
  X,
} from "lucide-react";
import { InboxTriage, TriageMessage } from "@/components/arc/blocks/inbox-triage/inbox-triage";
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
  const [activeTicket, setActiveTicket] = React.useState<TriageMessage | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-[26px] border border-hairline/90 bg-surface/98 dark:bg-[#141416]/98 backdrop-blur-3xl shadow-mac-2xl overflow-hidden text-label"
      >
        {/* macOS Developer Header Bar */}
        <div className="flex h-14 items-center justify-between border-b border-hairline px-6 shrink-0 select-none bg-well/40">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-mac-xs">
              <ShieldCheck className="size-4.5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-semibold text-label">
                  PixelCut Developer Desk
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold border border-blue-500/20">
                  DEVELOPER / ADMIN
                </span>
              </div>
              <p className="text-[11px] text-label-3">
                Giriş Yapan: <span className="text-label-2 font-medium">{developerName}</span> ({developerEmail})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="grid size-8 place-items-center rounded-full hover:bg-well text-label-3 hover:text-label transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {activeTicket ? (
              <motion.div
                key="conversation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                <SupportConversation
                  ticket={activeTicket}
                  developerName={developerName}
                  onBack={() => setActiveTicket(null)}
                  onResolve={(resolved) => {
                    // Update active ticket folder status
                    setActiveTicket((prev) =>
                      prev ? { ...prev, folder: resolved ? "archive" : "inbox" } : null
                    );
                  }}
                  className="h-full max-h-[72vh]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="inbox"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.18 }}
                className="w-full flex flex-col items-center"
              >
                <InboxTriage
                  onOpenConversation={(ticket) => setActiveTicket(ticket)}
                  className="w-full max-w-4xl"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
