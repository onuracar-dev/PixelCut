"use client";

import * as React from "react";
import { Challenge, UserRole } from "@/types";
import {
  CheckCircle2,
  Clock,
  Radio,
  Search,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomsArenaViewProps {
  challenges: Challenge[];
  activeChallengeId: string;
  onSelectChallenge: (challenge: Challenge) => void;
  userRole?: UserRole;
  onBroadcastChallenge?: (challengeId: string) => void;
  mode?: "all" | "in_class" | "practice";
}

export function RoomsArenaView({
  challenges,
  activeChallengeId,
  onSelectChallenge,
  userRole = "student",
  onBroadcastChallenge,
  mode = "all",
}: RoomsArenaViewProps) {
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Track completed challenges from localStorage
  const [completedIds] = React.useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("csspg_completed_challenges");
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const totalXp = React.useMemo(() => {
    return challenges
      .filter((c) => completedIds.includes(c.id))
      .reduce((sum, c) => sum + (c.xpReward || 50), 0);
  }, [challenges, completedIds]);

  // Section 1: Ders İçi ve Canlı Lab Odaları (live_lab & homework)
  const inClassChallenges = React.useMemo(() => {
    return challenges.filter((c) => {
      const isInClass = c.roomType === "live_lab" || c.roomType === "homework";
      if (!isInClass) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [challenges, searchQuery]);

  // Section 2: Ders Dışı CSSBattle Pratik Odaları (practice)
  const practiceChallenges = React.useMemo(() => {
    return challenges.filter((c) => {
      const isPractice =
        c.roomType === "practice" ||
        (!c.roomType && c.roomType !== "live_lab" && c.roomType !== "homework");
      if (!isPractice) return false;

      if (difficultyFilter !== "all" && c.difficulty !== difficultyFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [challenges, difficultyFilter, searchQuery]);

  // Render a single challenge card with strict Apple neutral palette
  const renderCard = (challenge: Challenge) => {
    const isActive = challenge.id === activeChallengeId;
    const isCompleted = completedIds.includes(challenge.id);
    const isLive = challenge.roomType === "live_lab";
    const isHomework = challenge.roomType === "homework";

    return (
      <div
        key={challenge.id}
        className={cn(
          "group relative flex flex-col justify-between rounded-[18px] border p-4 sm:p-5 transition-all duration-200 shadow-mac-xs bg-surface/80 hover:bg-surface hover:shadow-mac-sm",
          isActive
            ? "border-tint ring-1.5 ring-tint/30 bg-surface"
            : "border-hairline hover:border-hairline-strong"
        )}
      >
        <div>
          {/* Card Top Row: Room Type Badge & Difficulty & XP */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isLive ? (
                <span className="pill bg-well border border-hairline text-label font-mono text-[10.5px] inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-tint animate-pulse" />
                  Canlı Lab Odası
                </span>
              ) : isHomework ? (
                <span className="pill bg-well border border-hairline text-label-2 font-mono text-[10.5px] inline-flex items-center gap-1.5">
                  <Clock className="size-3 text-label-3" />
                  Haftalık Ödev
                </span>
              ) : (
                <span className="pill bg-well border border-hairline text-label-2 font-mono text-[10.5px] inline-flex items-center gap-1.5">
                  <Zap className="size-3 text-label-3" />
                  CSSBattle Pratiği
                </span>
              )}

              {/* Minimalist monochrome difficulty pill */}
              <span className="pill bg-well border border-hairline text-label-3 font-mono text-[10.5px]">
                {challenge.difficulty}
              </span>
            </div>

            <span className="pill bg-well border border-hairline text-label-3 font-mono text-[10.5px] font-semibold">
              +{challenge.xpReward || 50} XP
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="text-[13.5px] font-semibold text-label tracking-tight group-hover:text-tint transition-colors">
            {challenge.title}
          </h3>
          <p className="mt-1 text-[12px] text-label-2 leading-relaxed line-clamp-2">
            {challenge.description}
          </p>

          {/* Room Metadata */}
          <div className="mt-3.5 flex items-center gap-3 text-[11px] text-label-3 font-mono flex-wrap">
            {isLive && challenge.activeStudentsCount && (
              <span className="flex items-center gap-1 text-label-2">
                <Users className="size-3 text-label-3" />
                {challenge.activeStudentsCount} Öğrenci Aktif
              </span>
            )}

            {challenge.deadline && (
              <span className="flex items-center gap-1">
                <Clock className="size-3 text-label-3" />
                {challenge.deadline}
              </span>
            )}

            {challenge.maxLinesGoal && (
              <span>Hedef: ≤{challenge.maxLinesGoal} Satır</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3.5 border-t border-hairline flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {isCompleted && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-label-2 font-mono">
                <CheckCircle2 className="size-3.5 text-tint" />
                Tamamlandı
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {userRole === "teacher" && isLive && onBroadcastChallenge && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBroadcastChallenge(challenge.id);
                }}
                className="mac-btn mac-btn-secondary h-7 px-2.5 text-[11px] text-label-2 hover:text-label gap-1 cursor-pointer"
                title="Tüm sınıfın aktif görevini bu odaya güncelle"
              >
                <Radio className="size-3 text-label-3" />
                <span>Sınıfa Yayınla</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSelectChallenge(challenge)}
              className={cn(
                "mac-btn h-7 px-3 text-[11.5px] font-medium transition-all cursor-pointer",
                isActive
                  ? "bg-tint text-white font-medium shadow-mac-xs"
                  : "mac-btn-secondary text-label hover:border-hairline-strong hover:bg-fill"
              )}
            >
              {isActive ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Aktif Oda
                </span>
              ) : isLive ? (
                "Odaya Bağlan"
              ) : isHomework ? (
                "Ödevi Başlat"
              ) : (
                "Görevi Başlat"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const isOnlyInClass = mode === "in_class";
  const isOnlyPractice = mode === "practice";

  return (
    <div className="flex h-full w-full flex-col bg-canvas overflow-y-auto p-5 sm:p-7 select-none">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Sleek Minimalist Bar: Search & Quick XP Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
          <div>
            <h1 className="text-[18px] font-bold tracking-tight text-label">
              {isOnlyInClass
                ? "Ders İçi"
                : isOnlyPractice
                ? "Ders Dışı"
                : "Ders İçi & Ders Dışı"}
            </h1>
            <p className="text-[12px] text-label-2 mt-0.5">
              {isOnlyInClass
                ? "Eğitmeninizin yönettiği canlı sınıf oturumları, anlık radar takibi ve haftalık teslimli ödevler."
                : isOnlyPractice
                ? "Bileşen dilimleme pratikleri, bağımsız çalışmalar ve XP kazandıran CSSBattle mücadeleleri."
                : "Ders içi canlı laboratuvar odalarına bağlanın veya ders dışı CSSBattle pratikleriyle becerilerinizi geliştirin."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 rounded-[12px] bg-well border border-hairline px-3 py-1.5 shadow-mac-xs text-[11.5px] font-mono text-label-2">
              <span className="flex items-center gap-1">
                <Trophy className="size-3.5 text-label-3" />
                {totalXp} XP
              </span>
              <span className="text-hairline-strong">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="size-3.5 text-label-3" />
                {completedIds.length}/{challenges.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-48 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-label-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Oda veya görev ara..."
                className="mac-field pl-7.5 w-full text-[11.5px] h-[30px]"
              />
            </div>
          </div>
        </div>

        {/* 1. DERS İÇİ VE CANLI LAB ODALARI */}
        {!isOnlyPractice && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-[14.5px] font-semibold tracking-tight text-label">
                  Ders İçi
                </h2>
                <span className="pill bg-well border border-hairline text-label-3 font-mono text-[10.5px]">
                  {inClassChallenges.length} Oda
                </span>
              </div>
              <span className="text-[11.5px] text-label-3 hidden sm:inline">
                Laboratuvar oturumları ve haftalık teslimli ödevler
              </span>
            </div>

            {inClassChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {inClassChallenges.map(renderCard)}
              </div>
            ) : (
              <div className="rounded-[16px] border border-dashed border-hairline bg-surface/40 p-6 text-center text-[12px] text-label-3">
                Aramanıza uygun ders içi laboratuvar veya ödev odası bulunamadı.
              </div>
            )}
          </section>
        )}

        {/* 2. DERS DIŞI */}
        {!isOnlyInClass && (
          <section className={cn("space-y-3", !isOnlyPractice && "pt-4 border-t border-hairline")}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-[14.5px] font-semibold tracking-tight text-label">
                  Ders Dışı
                </h2>
                <span className="pill bg-well border border-hairline text-label-3 font-mono text-[10.5px]">
                  {practiceChallenges.length} Görev
                </span>
              </div>

              {/* Restrained Monochrome Difficulty Filter */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {["all", "Kolay", "Orta", "İleri"].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficultyFilter(diff)}
                    className={cn(
                      "rounded-[8px] px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer",
                      difficultyFilter === diff
                        ? "bg-tint text-white shadow-mac-xs font-semibold"
                        : "bg-well text-label-3 hover:text-label hover:bg-fill border border-hairline"
                    )}
                  >
                    {diff === "all" ? "Tümü" : diff}
                  </button>
                ))}
              </div>
            </div>

            {practiceChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {practiceChallenges.map(renderCard)}
              </div>
            ) : (
              <div className="rounded-[16px] border border-dashed border-hairline bg-surface/40 p-6 text-center text-[12px] text-label-3">
                Aramanıza veya filtre kriterlerinize uygun ders dışı pratik görev bulunamadı.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default RoomsArenaView;
