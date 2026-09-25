"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Layers,
  ScanEye,
  Sliders,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface InspectedElementData {
  tagName: string;
  className: string;
  id?: string;
  width: number;
  height: number;
  display: string;
  color: string;
  backgroundColor: string;
  fontSize: string;
  fontWeight: string;
  padding: string;
  margin: string;
  borderRadius: string;
  boxShadow?: string;
}

interface LiveCssInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function LiveCssInspector({
  isOpen,
  onClose,
  className,
}: LiveCssInspectorProps) {
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [inspectedNode, setInspectedNode] = React.useState<InspectedElementData>({
    tagName: "div",
    className: "pricing-card",
    width: 320,
    height: 440,
    display: "flex",
    color: "rgb(29, 29, 31)",
    backgroundColor: "rgb(255, 255, 255)",
    fontSize: "14px",
    fontWeight: "600",
    padding: "24px",
    margin: "0px",
    borderRadius: "16px",
    boxShadow: "Aktif",
  });

  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "__CSS_INSPECT_NODE__" && e.data?.node) {
        setInspectedNode(e.data.node);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 15 }}
      transition={{ type: "spring", stiffness: 450, damping: 35 }}
      className={cn(
        "glass absolute bottom-5 right-5 z-30 w-80 select-none overflow-hidden rounded-[20px] p-3.5 shadow-mac-lg border border-hairline",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
        <div className="flex items-center gap-2">
          <div className="grid size-6 place-items-center rounded-[7px] bg-tint/15 text-tint">
            <ScanEye className="size-3.5" />
          </div>
          <div>
            <h4 className="text-[12px] font-semibold text-label leading-tight">
              Canlı DOM & CSS Denetçisi
            </h4>
            <p className="text-[10px] text-label-3">Önizlemede öğeye gelin</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="grid size-5 place-items-center rounded-md text-label-2 transition-colors hover:bg-fill-2 hover:text-label"
            title={isMinimized ? "Genişlet" : "Simge durumuna küçült"}
          >
            {isMinimized ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="grid size-5 place-items-center rounded-md text-label-2 transition-colors hover:bg-fill-2 hover:text-label"
            title="Kapat (Ayarlardan açılabilir)"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
            className="space-y-3 pt-2 text-[12px]"
          >
            {/* Element Tag & Dimension Pill */}
            <div className="flex items-center justify-between rounded-[10px] bg-well/70 px-2.5 py-1.5 border border-hairline/50">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-mono text-[11px] font-bold text-tint">
                  &lt;{inspectedNode.tagName}&gt;
                </span>
                {inspectedNode.className && (
                  <span className="truncate font-mono text-[10.5px] text-label-2">
                    .{inspectedNode.className.split(" ")[0]}
                  </span>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold text-label-2 shadow-xs">
                {inspectedNode.width} × {inspectedNode.height} px
              </span>
            </div>

            {/* Box Model Mini Representation */}
            <div className="rounded-[12px] bg-well/50 p-2 border border-hairline/40 text-[10.5px] font-mono">
              <div className="flex items-center justify-between text-label-3 mb-1">
                <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-label-3">Kutu Modeli</span>
                <span>display: {inspectedNode.display}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-label-2">
                <div className="flex justify-between bg-surface/60 rounded px-1.5 py-0.5">
                  <span className="text-label-3">padding:</span>
                  <span className="text-label font-medium truncate max-w-[80px]">{inspectedNode.padding}</span>
                </div>
                <div className="flex justify-between bg-surface/60 rounded px-1.5 py-0.5">
                  <span className="text-label-3">margin:</span>
                  <span className="text-label font-medium truncate max-w-[80px]">{inspectedNode.margin}</span>
                </div>
              </div>
            </div>

            {/* Computed CSS Properties Table */}
            <div className="space-y-1">
              <span className="section-label block mb-1">Hesaplanan Stiller (Computed)</span>
              <div className="max-h-36 overflow-y-auto space-y-1 rounded-[10px] bg-surface/60 p-2 border border-hairline/60">
                {[
                  { label: "color", val: inspectedNode.color },
                  { label: "background", val: inspectedNode.backgroundColor },
                  { label: "font-size", val: inspectedNode.fontSize },
                  { label: "font-weight", val: inspectedNode.fontWeight },
                  { label: "border-radius", val: inspectedNode.borderRadius },
                  { label: "box-shadow", val: inspectedNode.boxShadow || "Yok" },
                ].map(({ label, val }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-0.5 text-[11px] group/item"
                  >
                    <span className="font-mono text-label-3">{label}:</span>
                    <div className="flex items-center gap-1.5 max-w-[150px]">
                      <span className="font-mono text-label truncate font-medium">{val}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${label}: ${val};`, label)}
                        className="opacity-0 group-hover/item:opacity-100 transition-opacity text-label-3 hover:text-tint"
                        title="Kuralı Kopyala"
                      >
                        {copiedKey === label ? (
                          <Check className="size-3 text-sys-green" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default LiveCssInspector;
