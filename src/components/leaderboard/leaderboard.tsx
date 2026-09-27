"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Code2,
  ExternalLink,
  Eye,
  Filter,
  Flame,
  Medal,
  Minus,
  Search,
  X,
  Zap,
} from "lucide-react";
import { LeaderboardEntry } from "@/types";
import { PracticeChallenge } from "@/lib/mock-data";
import { AnimatedNumber } from "@/components/apple/animated-number";
import { ActivityRing } from "@/components/apple/activity-ring";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentStudentId?: string;
  className?: string;
  onSelectPracticeChallenge?: (challenge: PracticeChallenge) => void;
}

export function Leaderboard({
  entries,
  currentStudentId = "st-1",
  className,
  onSelectPracticeChallenge,
}: LeaderboardProps) {
  const [filterPeriod, setFilterPeriod] = React.useState<"week" | "all">("week");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBadgeFilter, setSelectedBadgeFilter] = React.useState<string>("all");
  const [selectedStudentForModal, setSelectedStudentForModal] =
    React.useState<LeaderboardEntry | null>(null);

  // Sort and filter entries
  const sortedEntries = React.useMemo(() => {
    return [...entries].sort((a, b) => b.totalScore - a.totalScore);
  }, [entries]);

  const filteredEntries = React.useMemo(() => {
    return sortedEntries.filter((entry) => {
      const matchesSearch =
        entry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.studentNo.includes(searchQuery);

      if (!matchesSearch) return false;

      if (selectedBadgeFilter === "badges") {
        return entry.badges && entry.badges.length > 0;
      }
      if (selectedBadgeFilter === "accuracy") {
        return entry.visualScore >= 93;
      }
      if (selectedBadgeFilter === "clean") {
        return entry.cleanScore >= 95;
      }

      return true;
    });
  }, [sortedEntries, searchQuery, selectedBadgeFilter]);

  // Current student standing
  const currentStudent = React.useMemo(() => {
    return (
      sortedEntries.find((e) => e.studentId === currentStudentId) || sortedEntries[1]
    );
  }, [sortedEntries, currentStudentId]);

  const currentStudentRank = currentStudent
    ? sortedEntries.findIndex((e) => e.studentId === currentStudent.studentId) + 1
    : 2;

  const firstPlace = sortedEntries[0];
  const pointsToLeader =
    firstPlace && currentStudent
      ? Math.max(firstPlace.totalScore - currentStudent.totalScore, 0)
      : 0;

  const top3 = sortedEntries.slice(0, 3);
  const rest = filteredEntries.filter((e) => !top3.some((t) => t.studentId === e.studentId));

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-canvas overflow-y-auto select-none",
        className
      )}
    >
      <div className="max-w-5xl mx-auto w-full p-6 sm:p-8 space-y-6">
        {/* Student's Personal Standing (Apple Minimal Card) */}
        {currentStudent && (
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-[24px] border border-hairline bg-surface/75 p-5 sm:p-6 backdrop-blur-xl shadow-mac-xs transition-all">
            {/* Left: User identity & info */}
            <div className="flex items-center gap-3.5">
              <img
                src={currentStudent.avatarUrl}
                alt={currentStudent.studentName}
                className="size-12 rounded-full object-cover border border-hairline shadow-mac-xs bg-fill"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-semibold text-label tracking-tight">
                    {currentStudent.studentName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-well text-[10.5px] font-medium text-label-2 border border-hairline">
                    Senin Durumun
                  </span>
                </div>
                <p className="font-mono text-[11.5px] text-label-3 mt-0.5">
                  CSS-302 Grubu
                </p>
              </div>
            </div>

            {/* Middle: Clean Minimal Metrics */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 py-2 md:py-0 border-y md:border-y-0 border-hairline">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-label-3 block">Toplam Puan</span>
                <span className="text-[16px] font-semibold font-mono text-label tabular-nums">
                  <AnimatedNumber value={currentStudent.totalScore} /> XP
                </span>
              </div>

              <div className="hidden sm:block h-7 w-px bg-hairline" />

              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-label-3 block">Görsel Doğruluk</span>
                <span className="text-[16px] font-semibold font-mono text-label">
                  %{currentStudent.visualScore}
                </span>
              </div>

              <div className="hidden sm:block h-7 w-px bg-hairline" />

              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-label-3 block">Kod Satırı</span>
                <span className="text-[16px] font-semibold font-mono text-label">
                  {currentStudent.linesCount || 45}
                </span>
              </div>

              <div className="hidden sm:block h-7 w-px bg-hairline" />

              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-label-3 block">Seri</span>
                <span className="text-[16px] font-semibold font-mono text-label">
                  {currentStudent.streakDays || 5} Gün
                </span>
              </div>
            </div>

            {/* Right: Clean Rank Pill */}
            <div className="flex items-center sm:justify-end">
              <div className="flex items-center gap-2 rounded-full border border-hairline bg-well/70 px-3.5 py-1.5 shadow-mac-xs text-[12px] font-mono">
                <span className="font-bold text-label">#{currentStudentRank}</span>
                <span className="text-label-3">•</span>
                <span className="text-label-2 font-sans font-medium">Genel Sıralama</span>
              </div>
            </div>
          </div>
        )}

        {/* Apple Podium (Top 3 Stage) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* 2nd Place */}
          {top3[1] && (
            <div
              onClick={() => setSelectedStudentForModal(top3[1])}
              className="order-2 md:order-1 group cursor-pointer flex flex-col items-center rounded-[24px] border border-hairline bg-surface/75 p-6 backdrop-blur-xl shadow-mac-xs hover:border-hairline-strong hover:shadow-mac-md transition-all relative overflow-hidden"
            >
              <div className="relative">
                <img
                  src={top3[1].avatarUrl}
                  alt={top3[1].studentName}
                  className="size-16 rounded-full bg-fill object-cover ring-2 ring-hairline shadow-mac-xs group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-surface border border-hairline text-label text-[11px] font-mono font-bold shadow-mac-xs">
                  2
                </span>
              </div>

              <h3 className="mt-3.5 text-[15px] font-semibold text-label text-center truncate max-w-[200px]">
                {top3[1].studentName}
              </h3>

              <div className="mt-2 flex items-baseline gap-1 text-label font-mono">
                <span className="text-2xl font-bold tracking-tight">
                  <AnimatedNumber value={top3[1].totalScore} />
                </span>
                <span className="text-[12px] text-label-3">XP</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div
              onClick={() => setSelectedStudentForModal(top3[0])}
              className="order-1 md:order-2 group cursor-pointer flex flex-col items-center rounded-[24px] border border-hairline-strong bg-surface/90 p-6 backdrop-blur-xl shadow-mac-sm hover:shadow-mac-md transition-all relative overflow-hidden md:-translate-y-2"
            >
              <div className="relative">
                <img
                  src={top3[0].avatarUrl}
                  alt={top3[0].studentName}
                  className="size-20 rounded-full bg-fill object-cover ring-2 ring-label shadow-mac-sm group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-label text-surface text-[12px] font-mono font-bold shadow-mac-xs">
                  1
                </span>
              </div>

              <h3 className="mt-3.5 text-[16px] font-bold text-label text-center truncate max-w-[220px]">
                {top3[0].studentName}
              </h3>

              <div className="mt-2 flex items-baseline gap-1 text-label font-mono">
                <span className="text-3xl font-extrabold tracking-tight">
                  <AnimatedNumber value={top3[0].totalScore} />
                </span>
                <span className="text-[13px] text-label-3">XP</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div
              onClick={() => setSelectedStudentForModal(top3[2])}
              className="order-3 group cursor-pointer flex flex-col items-center rounded-[24px] border border-hairline bg-surface/75 p-6 backdrop-blur-xl shadow-mac-xs hover:border-hairline-strong hover:shadow-mac-md transition-all relative overflow-hidden"
            >
              <div className="relative">
                <img
                  src={top3[2].avatarUrl}
                  alt={top3[2].studentName}
                  className="size-16 rounded-full bg-fill object-cover ring-2 ring-hairline shadow-mac-xs group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-surface border border-hairline text-label text-[11px] font-mono font-bold shadow-mac-xs">
                  3
                </span>
              </div>

              <h3 className="mt-3.5 text-[15px] font-semibold text-label text-center truncate max-w-[200px]">
                {top3[2].studentName}
              </h3>

              <div className="mt-2 flex items-baseline gap-1 text-label font-mono">
                <span className="text-2xl font-bold tracking-tight">
                  <AnimatedNumber value={top3[2].totalScore} />
                </span>
                <span className="text-[12px] text-label-3">XP</span>
              </div>
            </div>
          )}
        </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {/* Search input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-label-3" />
                <input
                  type="text"
                  placeholder="Öğrenci ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-[12px] border border-hairline bg-surface py-1.5 pl-8 pr-3 font-sans text-[12px] text-label placeholder:text-label-3 outline-none focus:border-hairline-strong shadow-mac-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-label-3 hover:text-label"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-medium text-label-2">
                <button
                  type="button"
                  onClick={() => setSelectedBadgeFilter("all")}
                  className={cn(
                    "rounded-[8px] border px-2.5 py-1 transition-colors",
                    selectedBadgeFilter === "all"
                      ? "border-hairline-strong bg-surface text-label shadow-mac-xs font-semibold"
                      : "border-hairline bg-well/60 hover:bg-well"
                  )}
                >
                  Tümü ({sortedEntries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBadgeFilter("badges")}
                  className={cn(
                    "rounded-[8px] border px-2.5 py-1 transition-colors",
                    selectedBadgeFilter === "badges"
                      ? "border-hairline-strong bg-surface text-label shadow-mac-xs font-semibold"
                      : "border-hairline bg-well/60 hover:bg-well"
                  )}
                >
                  Rozetliler
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBadgeFilter("accuracy")}
                  className={cn(
                    "rounded-[8px] border px-2.5 py-1 transition-colors",
                    selectedBadgeFilter === "accuracy"
                      ? "border-hairline-strong bg-surface text-label shadow-mac-xs font-semibold"
                      : "border-hairline bg-well/60 hover:bg-well"
                  )}
                >
                  %93+ Doğruluk
                </button>
              </div>
            </div>

            {/* Engineered Data Table */}
            <div className="space-y-2">
              <span className="section-label block pl-1">
                Tüm Öğrenciler Listesi ({filteredEntries.length})
              </span>

              <div className="rounded-[18px] border border-hairline bg-surface shadow-mac-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 items-center border-b border-hairline bg-well/50 px-4 py-2 text-[10.5px] font-mono uppercase tracking-wider text-label-3">
                  <div className="col-span-1 text-center">Sıra</div>
                  <div className="col-span-5 sm:col-span-4">Öğrenci</div>
                  <div className="col-span-2 hidden sm:block text-center">Trend</div>
                  <div className="col-span-3 sm:col-span-2 text-center">Doğruluk</div>
                  <div className="col-span-3 sm:col-span-3 text-right">Toplam XP</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-hairline">
                  {filteredEntries.map((entry, index) => {
                    const isCurrentUser = entry.studentId === currentStudentId;
                    const rankNumber = sortedEntries.findIndex((e) => e.studentId === entry.studentId) + 1;

                    return (
                      <div
                        key={entry.studentId}
                        onClick={() => setSelectedStudentForModal(entry)}
                        className={cn(
                          "grid grid-cols-12 items-center px-4 py-3 transition-colors cursor-pointer group",
                          isCurrentUser
                            ? "bg-well/80 hover:bg-well"
                            : "hover:bg-fill-2"
                        )}
                      >
                        {/* Rank */}
                        <div className="col-span-1 text-center font-mono text-[13px] font-bold text-label">
                          #{rankNumber}
                        </div>

                        {/* Student Info */}
                        <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                          <img
                            src={entry.avatarUrl}
                            alt={entry.studentName}
                            className="size-8 rounded-[10px] bg-fill object-cover shadow-mac-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 truncate">
                              <h4 className="truncate text-[13px] font-semibold text-label group-hover:text-tint transition-colors">
                                {entry.studentName}
                              </h4>
                              {isCurrentUser && (
                                <span className="pill bg-well border border-hairline font-mono text-[9.5px] text-label-2 shrink-0">
                                  Sen
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Trend Delta */}
                        <div className="col-span-2 hidden sm:flex items-center justify-center">
                          {entry.trend === "up" ? (
                            <span className="inline-flex items-center gap-0.5 font-mono text-[11px] text-label font-medium">
                              <ArrowUp className="size-3 text-label" />
                              <span>+{entry.trendDelta || 1}</span>
                            </span>
                          ) : entry.trend === "down" ? (
                            <span className="inline-flex items-center gap-0.5 font-mono text-[11px] text-label-3">
                              <ArrowDown className="size-3 text-label-3" />
                              <span>-{entry.trendDelta || 1}</span>
                            </span>
                          ) : (
                            <span className="font-mono text-[12px] text-label-4">—</span>
                          )}
                        </div>

                        {/* Visual Match Accuracy */}
                        <div className="col-span-3 sm:col-span-2 flex items-center justify-center gap-1.5">
                          <span className="font-mono text-[12px] font-semibold text-label">
                            %{entry.visualScore}
                          </span>
                        </div>

                        {/* Total Score & Action */}
                        <div className="col-span-3 sm:col-span-3 flex items-center justify-end gap-3 text-right">
                          <div>
                            <span className="font-mono text-[15px] font-bold text-label tabular-nums">
                              <AnimatedNumber value={entry.totalScore} />
                            </span>
                            <span className="font-mono text-[10.5px] text-label-3 ml-1">
                              XP
                            </span>
                          </div>
                          <Eye className="size-3.5 text-label-3 group-hover:text-label transition-colors shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

      {/* Student Engineering Scorecard Modal (Detail View) */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-md rounded-[24px] border border-hairline bg-surface p-6 shadow-mac-lg animate-in zoom-in-95 duration-150 select-none space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedStudentForModal.avatarUrl}
                  alt={selectedStudentForModal.studentName}
                  className="size-14 rounded-[18px] bg-fill object-cover ring-2 ring-hairline shadow-mac-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[16px] font-bold text-label">
                      {selectedStudentForModal.studentName}
                    </h3>
                    <span className="pill bg-well border border-hairline font-mono text-[10.5px] text-label-2">
                      #{sortedEntries.findIndex((e) => e.studentId === selectedStudentForModal.studentId) + 1}. Sıra
                    </span>
                  </div>
                  <p className="font-mono text-[12px] text-label-3 mt-0.5">
                    {selectedStudentForModal.studentNo} • CSS-302
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForModal(null)}
                className="mac-icon-btn -mr-1 -mt-1"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Score Metrics Grid (4 KPI Cards) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-[14px] border border-hairline bg-well/70 p-3 space-y-0.5">
                <span className="text-[10.5px] font-mono text-label-3 uppercase tracking-wider block">
                  Piksel Doğruluğu
                </span>
                <span className="font-mono text-[18px] font-bold text-label">
                  %{selectedStudentForModal.visualScore}
                </span>
              </div>

              <div className="rounded-[14px] border border-hairline bg-well/70 p-3 space-y-0.5">
                <span className="text-[10.5px] font-mono text-label-3 uppercase tracking-wider block">
                  Kod Hijyen Skoru
                </span>
                <span className="font-mono text-[18px] font-bold text-label">
                  %{selectedStudentForModal.cleanScore}
                </span>
              </div>

              <div className="rounded-[14px] border border-hairline bg-well/70 p-3 space-y-0.5">
                <span className="text-[10.5px] font-mono text-label-3 uppercase tracking-wider block">
                  Satır Verimi
                </span>
                <span className="font-mono text-[18px] font-bold text-label">
                  {selectedStudentForModal.linesCount || 48} Satır
                </span>
              </div>

              <div className="rounded-[14px] border border-hairline bg-well/70 p-3 space-y-0.5">
                <span className="text-[10.5px] font-mono text-label-3 uppercase tracking-wider block">
                  Toplam Mühendislik XP
                </span>
                <span className="font-mono text-[18px] font-bold text-label">
                  {selectedStudentForModal.totalScore} XP
                </span>
              </div>
            </div>

            {/* Badges Earned */}
            <div className="space-y-2">
              <span className="section-label block">Kazanılan Rozetler</span>
              <div className="flex flex-wrap gap-2">
                {selectedStudentForModal.badges && selectedStudentForModal.badges.length > 0 ? (
                  selectedStudentForModal.badges.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-1.5 rounded-[10px] border border-hairline bg-well px-2.5 py-1.5 text-[11.5px] text-label"
                      title={b.description}
                    >
                      <span>{b.icon}</span>
                      <span className="font-medium">{b.label}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[11.5px] text-label-3">
                    Henüz rozet kazanılmadı (Ders dışı görevleri tamamlayarak açılabilir).
                  </span>
                )}
              </div>
            </div>

            {/* Close action */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForModal(null)}
                className="mac-btn mac-btn-primary h-8 px-5 text-[12px] font-medium"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
