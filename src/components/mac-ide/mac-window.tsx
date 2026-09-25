"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Pointer } from "@/components/ui/pointer";

interface MacWindowProps {
  /** Full-height vibrancy sidebar (traffic lights are rendered above it). If omitted, traffic lights move to header. */
  sidebar?: React.ReactNode;
  /** Action buttons positioned on the left side of the toolbar (e.g. sidebar drawer toggle). */
  toolbarLeft?: React.ReactNode;
  /** Unified toolbar title. */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  toolbarCenter?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  topBanner?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * macOS Sonoma window: translucent full-height sidebar over a soft wallpaper,
 * unified toolbar, and an inset content area. Drop the rounding when maximized.
 */
export function MacWindow({
  sidebar,
  toolbarLeft,
  title,
  subtitle,
  toolbarCenter,
  toolbarRight,
  topBanner,
  children,
}: MacWindowProps) {
  const [maximized, setMaximized] = React.useState(false);

  React.useEffect(() => {
    const api = typeof window !== "undefined" ? window.electronAPI : undefined;
    if (!api) return;
    api.isMaximized?.().then(setMaximized).catch(() => {});
    return api.onMaximizeChange?.(setMaximized);
  }, []);

  // Smooth custom drag handling without -webkit-app-region: drag (which forces Windows OS arrow cursor)
  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return; // Only primary left-click

    const target = e.target as HTMLElement;
    // Don't drag if clicking buttons, inputs, links, or interactive elements
    if (target.closest("button, a, input, select, textarea, [role='button']")) {
      return;
    }

    const api = typeof window !== "undefined" ? window.electronAPI : undefined;
    if (!api?.dragStart) return;

    api.dragStart(e.screenX, e.screenY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      api.dragMove?.(moveEvent.screenX, moveEvent.screenY);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      api.dragEnd?.();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleHeaderDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, [role='button']")) {
      return;
    }
    const api = typeof window !== "undefined" ? window.electronAPI : undefined;
    api?.maximize?.();
  };

  return (
    <div
      className={cn(
        "relative flex h-screen w-screen overflow-hidden font-sans text-label select-none",
        "[background:var(--mac-wallpaper)]",
        maximized ? "rounded-none" : "rounded-[12px] shadow-[inset_0_0_0_0.5px_var(--mac-hairline-strong)]"
      )}
    >
      {/* Global Application-Wide MagicUI Pointer */}
      <Pointer global />

      {/* Sidebar column (when static sidebar is used) */}
      {sidebar && (
        <aside className="vibrancy relative z-10 flex w-[232px] shrink-0 flex-col border-r border-hairline">
          <div className="flex h-[52px] shrink-0 items-center px-[18px]">
            <TrafficLights />
          </div>
          <div className="flex min-h-0 flex-1 flex-col">{sidebar}</div>
        </aside>
      )}

      {/* Main column */}
      <div className="relative flex min-w-0 flex-1 flex-col bg-window">
        <header
          onMouseDown={handleHeaderMouseDown}
          onDoubleClick={handleHeaderDoubleClick}
          className="relative z-20 flex h-[52px] shrink-0 items-center gap-3 border-b border-hairline bg-toolbar px-4 backdrop-blur-xl select-none"
        >
          {/* If there is no static sidebar, render TrafficLights + toolbarLeft inside header */}
          {!sidebar && (
            <div className="flex items-center gap-3 pr-2">
              <div className="flex items-center pr-1">
                <TrafficLights />
              </div>
              {toolbarLeft && <div className="flex items-center">{toolbarLeft}</div>}
            </div>
          )}

          {sidebar && toolbarLeft && (
            <div className="flex items-center">{toolbarLeft}</div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[13.5px] font-semibold leading-tight tracking-[-0.01em] text-label">{title}</h1>
            {subtitle && <p className="truncate text-[11.5px] leading-tight text-label-2">{subtitle}</p>}
          </div>

          {toolbarCenter && (
            <div className="absolute left-1/2 -translate-x-1/2">{toolbarCenter}</div>
          )}

          <div className="flex flex-1 items-center justify-end gap-1.5">{toolbarRight}</div>
        </header>

        {topBanner && <div className="relative z-30">{topBanner}</div>}

        <main className="relative flex min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

function TrafficLights() {
  const call = (fn: "close" | "minimize" | "maximize") => {
    if (typeof window !== "undefined" && window.electronAPI) window.electronAPI[fn]();
  };

  const lights = [
    { fn: "close" as const, title: "Kapat", color: "#ff5f57", ring: "#e0443e", glyph: <path d="M3.2 3.2l3.6 3.6M6.8 3.2L3.2 6.8" /> },
    { fn: "minimize" as const, title: "Küçült", color: "#febc2e", ring: "#dea123", glyph: <path d="M2.6 5h4.8" /> },
    {
      fn: "maximize" as const,
      title: "Büyüt",
      color: "#28c840",
      ring: "#1aab29",
      glyph: <path d="M3 7V3.6M3 3h3.4M7 3v3.4M7 7H3.6" strokeLinejoin="round" />,
    },
  ];

  return (
    <div className="group flex items-center gap-2">
      {lights.map((l) => (
        <button
          key={l.fn}
          type="button"
          title={l.title}
          aria-label={l.title}
          onClick={(e) => {
            e.stopPropagation();
            call(l.fn);
          }}
          className="grid size-3 place-items-center rounded-full transition-[filter] active:brightness-90 cursor-pointer"
          style={{ backgroundColor: l.color, boxShadow: `inset 0 0 0 0.5px ${l.ring}` }}
        >
          <svg
            viewBox="0 0 10 10"
            className="size-[8px] opacity-0 transition-opacity duration-100 group-hover:opacity-100"
            fill="none"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth={1.3}
            strokeLinecap="round"
          >
            {l.glyph}
          </svg>
        </button>
      ))}
    </div>
  );
}

export default MacWindow;
