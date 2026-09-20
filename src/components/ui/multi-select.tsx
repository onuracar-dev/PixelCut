"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Seçiniz...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (val: string) => {
    if (value.includes(val)) {
      onValueChange(value.filter((v) => v !== val));
    } else {
      onValueChange([...value, val]);
    }
  };

  const removeOption = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(value.filter((v) => v !== val));
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));
  const visibleChips = selectedOptions.slice(0, 2);
  const overflowCount = selectedOptions.length - visibleChips.length;

  return (
    <div className={cn("relative flex flex-col gap-1.5", className)} ref={containerRef}>
      <label className="text-xs font-medium text-zinc-300 font-mono">{label}</label>

      {/* Select Box / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-[42px] w-full items-center justify-between rounded-xl border border-white/8 bg-[#141418] px-3 py-1.5 text-xs text-zinc-200 shadow-sm transition-colors hover:border-white/16 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedOptions.length === 0 ? (
            <span className="text-zinc-500">{placeholder}</span>
          ) : (
            <>
              {visibleChips.map((chip) => (
                <span
                  key={chip.value}
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-zinc-200"
                >
                  {chip.label}
                  <X
                    className="size-3 cursor-pointer text-zinc-400 hover:text-zinc-100"
                    onClick={(e) => removeOption(chip.value, e)}
                  />
                </span>
              ))}
              {overflowCount > 0 && (
                <span className="inline-flex items-center rounded-md border border-white/10 bg-emerald-950/40 px-1.5 py-0.5 text-[11px] font-mono text-emerald-400">
                  +{overflowCount}
                </span>
              )}
            </>
          )}
        </div>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-zinc-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#18181f] p-1.5 shadow-2xl backdrop-blur-xl"
          >
            {options.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => toggleOption(opt.value)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors",
                    isSelected
                      ? "bg-emerald-500/10 text-emerald-400 font-medium"
                      : "text-zinc-300 hover:bg-white/5",
                    opt.disabled && "cursor-not-allowed opacity-40"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="size-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
