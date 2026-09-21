"use client";

import * as React from "react";
import { CheckCircle2, Code2, Eye, Sparkles, Terminal } from "lucide-react";
import { StudentLiveState } from "@/types";
import { GlowCard } from "@/components/apple/glow-card";
import { ActivityRing } from "@/components/apple/activity-ring";
import { AnimatedNumber } from "@/components/apple/animated-number";
import { cn } from "@/lib/utils";

interface StudentCardProps {
  student: StudentLiveState;
  onInspect?: (student: StudentLiveState) => void;
  onAssist?: (student: StudentLiveState) => void;
  onGrade?: (studentId: string, grade: number) => void;
  className?: string;
}

export function StudentCard({ student, onInspect, onAssist, className }: StudentCardProps) {
  const isNeedingHelp = student.status === "needs_help";

  return (
    <GlowCard
      radius={18}
      glowColor="var(--mac-tint)"
      className={cn(
        "flex flex-col justify-between p-4 transition-all duration-200 select-none",
        isNeedingHelp && "ring-1 ring-hairline-strong bg-well/30",
        className
      )}
    >
      <div>
        {/* Header: Student Identity & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <img
                src={student.avatarUrl}
                alt={student.studentName}
                className="size-10 rounded-[12px] bg-fill object-cover shadow-mac-xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex size-2.5">
                <span className="relative size-2.5 rounded-full border border-surface bg-label-3" />
              </span>
            </div>

            <div className="min-w-0">
              <h4 className="truncate text-[13.5px] font-semibold tracking-[-0.015em] text-label">
                {student.studentName}
              </h4>
              <p className="truncate font-mono text-[11px] text-label-3">
                {student.studentNo}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {isNeedingHelp && (
              <span className="pill bg-well border border-hairline text-label font-medium">
                <span>Yardım Talebi</span>
              </span>
            )}
            {student.status === "coding" && (
              <span className="pill bg-well text-label-2">
                <Terminal className="size-3" />
                <span>Yazıyor</span>
              </span>
            )}
            {student.status === "scanning" && (
              <span className="pill bg-well text-label-2">
                <Sparkles className="size-3" />
                <span>Taranıyor</span>
              </span>
            )}
            {student.status === "submitted" && (
              <span className="pill bg-well text-label font-medium border border-hairline">
                <CheckCircle2 className="size-3" />
                <span>Teslim</span>
              </span>
            )}
            {student.status === "approved" && (
              <span className="pill bg-well text-label font-medium border border-hairline">
                <CheckCircle2 className="size-3" />
                <span>{student.grade ? `${student.grade}p` : "Onay"}</span>
              </span>
            )}
          </div>
        </div>

        {/* Help Topic Alert Banner */}
        {isNeedingHelp && student.helpTopic && (
          <div className="mt-3 flex items-start gap-2 rounded-[10px] bg-well/70 p-2 text-[11px] text-label-2 border border-hairline">
            <span className="shrink-0 font-medium text-label">Konu:</span>
            <span className="line-clamp-2">{student.helpTopic}</span>
          </div>
        )}

        {/* Visual Match Metric Box */}
        <div className="mt-3.5 flex items-center justify-between rounded-[12px] bg-well p-2.5">
          <div className="flex items-center gap-2.5">
            <ActivityRing value={student.visualMatch} size={34} stroke={4} color="var(--mac-label)" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-label-3">Görsel Eşleşme</span>
              <span className="text-[13px] font-bold font-mono text-label tabular-nums">
                <AnimatedNumber value={student.visualMatch} decimals={1} prefix="%" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11.5px] text-label-3">
            <Code2 className="size-3.5" />
            <span>{student.linesCount} satır</span>
          </div>
        </div>
      </div>

      {/* Footer Dual Actions */}
      <div className="mt-3.5 flex items-center justify-end border-t border-hairline pt-2.5 gap-2">
        <button
          type="button"
          onClick={() => onInspect?.(student)}
          className="mac-btn mac-btn-secondary h-[26px] px-2 text-[11.5px]"
          title="Sessiz Gözlem Modu"
        >
          <Eye className="size-3 text-label-3" />
          <span>İzle</span>
        </button>

        <button
          type="button"
          onClick={() => onAssist?.(student)}
          className="mac-btn mac-btn-primary h-[26px] px-2.5 text-[11.5px] font-medium"
          title="Canlı Masaya Bağlan"
        >
          <span>Masaya Bağlan</span>
        </button>
      </div>
    </GlowCard>
  );
}
