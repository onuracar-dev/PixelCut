"use client";

import * as React from "react";
import { Wifi, Battery } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobilePreviewFrameProps {
  srcDoc: string;
  className?: string;
}

/**
 * Ultra-soft, photorealistic iPhone chassis with Dynamic Island and status indicators.
 */
export function MobilePreviewFrame({ srcDoc, className }: MobilePreviewFrameProps) {
  const [time, setTime] = React.useState("09:41");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("relative mx-auto flex items-center justify-center py-4 select-none", className)}>
      {/* Outer Titanium Chassis */}
      <div
        className="relative h-[660px] w-[330px] rounded-[52px] p-[10px] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[0_28px_72px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] bg-gradient-to-b from-[#2e2e34] via-[#202025] to-[#161619] transition-all"
      >
        {/* Inner Screen Bezel */}
        <div className="relative h-full w-full overflow-hidden rounded-[42px] bg-[#0c0c0e] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 z-40 flex h-11 items-center justify-between px-7 pt-1 text-[12px] font-semibold text-white/90">
            <span>{time}</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Wifi className="size-3.5" />
              <Battery className="size-4" />
            </div>
          </div>

          {/* Dynamic Island */}
          <div className="absolute top-2.5 left-1/2 z-50 h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-black shadow-[0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-between px-3">
            <div className="size-2.5 rounded-full bg-[#121214] ring-1 ring-white/10" />
            <div className="size-2 rounded-full bg-[#0a1829] ring-1 ring-cyan-500/20" />
          </div>

          {/* Sandboxed Live Web Preview */}
          <iframe
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            title="Mobil Önizleme"
            className="h-full w-full border-0 bg-transparent pt-10 pb-6"
          />

          {/* Home Bar Indicator */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-40 h-[4px] w-32 -translate-x-1/2 rounded-full bg-white/40 shadow-xs" />
        </div>
      </div>
    </div>
  );
}
