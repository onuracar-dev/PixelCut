"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpotlightItem {
  id: string;
  label: string;
  group: string;
  icon?: React.ReactNode;
  hint?: string;
  keywords?: string;
  onSelect: () => void;
}

interface SpotlightProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SpotlightItem[];
  sidebarOffset?: number;
}

/** macOS Spotlight–style command palette (⌘K / Ctrl+K). */
export function Spotlight({ open, onOpenChange, items, sidebarOffset = 0 }: SpotlightProps) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Global shortcut
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.group} ${i.keywords ?? ""}`.toLocaleLowerCase("tr").includes(q));
  }, [items, query]);

  const groups = React.useMemo(() => {
    const map = new Map<string, Array<{ item: SpotlightItem; index: number }>>();
    filtered.forEach((item, index) => map.set(item.group, [...(map.get(item.group) ?? []), { item, index }]));
    return Array.from(map.entries());
  }, [filtered]);

  const run = (item?: SpotlightItem) => {
    if (!item) return;
    item.onSelect();
    onOpenChange(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(filtered[active]);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  React.useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/10 dark:bg-black/35 pointer-events-auto"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={false}
            animate={{ left: sidebarOffset }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 32,
              mass: 0.8,
            }}
            className="absolute inset-y-0 right-0 flex items-start justify-center pt-[14vh] pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, y: -4, filter: "blur(4px)", transition: { duration: 0.14 } }}
              transition={{ type: "spring", stiffness: 480, damping: 34 }}
              className="glass relative w-[560px] max-w-[calc(100%-32px)] overflow-hidden rounded-[20px] pointer-events-auto shadow-mac-lg"
              onKeyDown={onKeyDown}
            >
              <div className="flex items-center gap-3 px-4 h-14">
                <Search className="size-[18px] text-label-2" strokeWidth={2} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  placeholder="Ara veya komut yaz..."
                  className="flex-1 bg-transparent text-[19px] font-[450] tracking-[-0.02em] text-label outline-none placeholder:text-label-3"
                />
                <span className="kbd text-[10px]">ESC</span>
              </div>

              <div ref={listRef} className="max-h-[360px] overflow-y-auto border-t border-hairline p-1.5">
                {groups.length === 0 && (
                  <div className="py-10 text-center text-[13px] text-label-3">“{query}” için sonuç yok</div>
                )}
                {groups.map(([group, groupItems]) => (
                  <div key={group} className="mb-1">
                    <div className="px-2.5 pt-2 pb-1 text-[11px] font-semibold text-label-3">{group}</div>
                    {groupItems.map(({ item, index: i }) => {
                      const isActive = i === active;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-index={i}
                          onPointerMove={() => setActive(i)}
                          onClick={() => run(item)}
                          className={cn(
                            "relative flex w-full items-center gap-3 rounded-[10px] px-2.5 h-9 text-left text-[13px]",
                            isActive ? "text-white" : "text-label"
                          )}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="spotlight-active"
                              className="absolute inset-0 -z-0 rounded-[10px] bg-tint"
                              transition={{ type: "spring", stiffness: 700, damping: 45 }}
                            />
                          )}
                          <span
                            className={cn(
                              "relative grid size-6 place-items-center rounded-[7px]",
                              isActive ? "bg-white/20 text-white" : "bg-fill-2 text-label-2"
                            )}
                          >
                            {item.icon}
                          </span>
                          <span className="relative flex-1 truncate font-medium">{item.label}</span>
                          {item.hint && (
                            <span className={cn("relative text-[11.5px]", isActive ? "text-white/75" : "text-label-3")}>
                              {item.hint}
                            </span>
                          )}
                          {isActive && <CornerDownLeft className="relative size-3.5 text-white/80" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
