"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronUp,
  LoaderCircle,
  LogOut,
  Monitor,
  Moon,
  Sun,
  SunMoon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type UserStatus = "available" | "busy" | "away";
export type ThemePreference = "light" | "dark" | "system";

export interface MorphingMenuItem {
  label: string;
  icon: React.ReactNode;
  keys?: string[];
  onSelect: () => void;
}

export interface MorphingUserMenuProps {
  user: {
    name: string;
    email: string;
    plan?: string;
    avatarSrc?: string;
  };
  status: UserStatus;
  onStatusChange: (status: UserStatus) => void;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  items: MorphingMenuItem[];
  onSignOut?: () => void | Promise<void>;
  className?: string;
}

function StatusDot({ status }: { status: UserStatus }) {
  return (
    <span
      className={cn(
        "relative inline-grid size-2.5 shrink-0 place-items-center rounded-full transition-all duration-200",
        status === "available" && "bg-sys-green shadow-[0_0_8px_rgba(48,209,88,0.5)]",
        status === "busy" && "bg-sys-red shadow-[0_0_8px_rgba(255,69,58,0.5)]",
        status === "away" && "bg-sys-yellow shadow-[0_0_8px_rgba(255,214,10,0.5)]"
      )}
    >
      {status === "busy" && (
        <span className="h-[2px] w-[5px] rounded-full bg-surface" />
      )}
      {status === "away" && (
        <span className="size-[4px] rounded-full bg-surface" />
      )}
    </span>
  );
}

export function MorphingUserMenu({
  user,
  status,
  onStatusChange,
  theme,
  onThemeChange,
  items,
  onSignOut,
  className,
}: MorphingUserMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Safely close on outside click or Escape with delayed listener registration
  React.useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    // Small delay ensures the opening click event finishes bubbling before the listener starts
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }, 50);

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Spacer maintaining 50px height in the sidebar footer so files above don't shift */}
      <div className="h-[50px] w-full pointer-events-none" />

      {/* Morphing single card anchored to bottom: When height grows, it expands UPWARDS */}
      <div
        ref={containerRef}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "absolute bottom-0 left-0 right-0 z-30 flex flex-col overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "border border-hairline bg-surface/95 dark:bg-[#1c1c20]/95 backdrop-blur-2xl",
          isOpen
            ? "rounded-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-1 ring-white/10"
            : "rounded-[12px] shadow-mac-xs hover:bg-fill-2 cursor-pointer"
        )}
      >
        {/* SINGLE User Header: Pushed UP automatically as the options expand beneath it */}
        <button
          type="button"
          onClick={toggleOpen}
          className="flex w-full items-center gap-2.5 p-2 text-left select-none transition-colors outline-none cursor-pointer hover:bg-fill/50"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Menüyü Kapat" : "Kullanıcı Menüsünü Aç"}
        >
          {/* Avatar with Status Dot */}
          <div className="relative size-[34px] shrink-0">
            {user.avatarSrc ? (
              <img
                src={user.avatarSrc}
                alt={user.name}
                className="size-full rounded-full object-cover border border-hairline"
              />
            ) : (
              <div className="grid size-full place-items-center rounded-full bg-fill text-[12px] font-bold text-label-2">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-surface p-0.5">
              <StatusDot status={status} />
            </span>
          </div>

          {/* User Name & Subtitle / Email */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[13px] font-semibold text-label">
                {user.name}
              </span>
            </div>
            <span className="truncate text-[11px] text-label-3">
              {isOpen ? user.email : user.plan ?? user.email}
            </span>
          </div>

          {/* Single rotating chevron */}
          <div
            className={cn(
              "grid size-6 shrink-0 place-items-center text-label-3 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isOpen ? "rotate-180" : "rotate-0"
            )}
          >
            <ChevronUp className="size-4" />
          </div>
        </button>

        {/* Options Section: Animates open cleanly underneath the header */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="morph-menu-items"
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
                transition: {
                  height: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.45, delay: 0.1, ease: "easeOut" },
                },
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  height: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.3, ease: "easeInOut" },
                },
              }}
              className="flex flex-col overflow-hidden"
            >
              {/* Divider */}
              <div className="mx-2 h-px bg-hairline" />

              {/* Action Items */}
              <div className="flex flex-col p-1 space-y-0.5 max-h-[260px] overflow-y-auto mac-scrollbar">
                {items.map((item, idx) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      item.onSelect();
                    }}
                    className="group flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[12.5px] text-label-2 hover:bg-fill hover:text-label transition-colors select-none cursor-pointer"
                  >
                    <span className="text-label-3 group-hover:text-label transition-colors">
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.keys && (
                      <div className="flex items-center gap-0.5 text-label-4 font-mono text-[10.5px]">
                        {item.keys.map((k, ki) => (
                          <kbd
                            key={ki}
                            className="grid min-w-[16px] place-items-center rounded-[4px] bg-fill px-1 py-0.5"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="mx-2 h-px bg-hairline" />

              {/* Presence Status & Theme Switchers */}
              <div className="p-2 space-y-2">
                {/* Status Switcher Row */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-[12px] text-label-2">
                    <StatusDot status={status} />
                    <span>Durum</span>
                  </div>
                  <div className="relative flex items-center rounded-full bg-fill p-0.5">
                    {(
                      [
                        { id: "available", label: "Müsait" },
                        { id: "busy", label: "Meşgul" },
                        { id: "away", label: "Uzakta" },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(s.id);
                        }}
                        className={cn(
                          "relative grid size-6 place-items-center rounded-full z-10 cursor-pointer transition-colors",
                          status === s.id && "bg-surface shadow-mac-xs"
                        )}
                        title={s.label}
                      >
                        <StatusDot status={s.id} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Switcher Row */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-[12px] text-label-2">
                    <SunMoon className="size-3.5 text-label-3" />
                    <span>Tema</span>
                  </div>
                  <div className="relative flex items-center rounded-full bg-fill p-0.5">
                    {(
                      [
                        {
                          id: "light",
                          icon: <Sun className="size-3.5" />,
                          title: "Aydınlık",
                        },
                        {
                          id: "dark",
                          icon: <Moon className="size-3.5" />,
                          title: "Karanlık",
                        },
                        {
                          id: "system",
                          icon: <Monitor className="size-3.5" />,
                          title: "Sistem",
                        },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onThemeChange(t.id);
                        }}
                        className={cn(
                          "relative grid size-6 place-items-center rounded-full z-10 transition-colors cursor-pointer",
                          theme === t.id
                            ? "bg-surface text-label shadow-mac-xs"
                            : "text-label-3 hover:text-label-2"
                        )}
                        title={t.title}
                      >
                        {t.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-2 h-px bg-hairline" />

              {/* Sign Out Row */}
              <div className="p-1">
                <button
                  type="button"
                  disabled={signingOut}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setSigningOut(true);
                    await onSignOut?.();
                    setSigningOut(false);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[12px] font-medium text-sys-red hover:bg-sys-red/10 transition-colors cursor-pointer"
                >
                  {signingOut ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : (
                    <LogOut className="size-3.5" />
                  )}
                  <span>{signingOut ? "Çıkış Yapılıyor..." : "Çıkış Yap"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MorphingUserMenu;
