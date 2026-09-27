"use client";

import * as React from "react";
import { Sliders } from "lucide-react";
import {
  ImageComparison,
  ImageComparisonLayer,
  ImageComparisonSlider,
} from "@/components/motion-primitives/image-comparison";
import type { SpringOptions } from "motion/react";
import { cn } from "@/lib/utils";

interface DiffSliderProps {
  studentHtml?: string;
  studentCss?: string;
  srcDoc?: string;
  targetImageUrl: string;
  height?: number | string;
  className?: string;
  springOptions?: SpringOptions;
}

/**
 * Soft spring options for the buttery-smooth gliding comparison feel.
 */
const DEFAULT_DIFF_SPRING: SpringOptions = {
  stiffness: 180,
  damping: 24,
  mass: 0.6,
};

export function DiffSlider({
  studentHtml = "",
  studentCss = "",
  srcDoc,
  targetImageUrl,
  height,
  className,
  springOptions = DEFAULT_DIFF_SPRING,
}: DiffSliderProps) {
  // Sandboxed HTML document fallback if srcDoc is not directly provided
  const finalSrcDoc = React.useMemo(() => {
    if (srcDoc) return srcDoc;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body, *, *::before, *::after { cursor: none !important; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: transparent;
              padding: 24px;
            }
            ${studentCss}
          </style>
          <script>
            (function() {
              window.addEventListener('mousemove', function(e) {
                try {
                  window.parent.postMessage({
                    type: '__CUSTOM_POINTER_MOVE__',
                    clientX: e.clientX,
                    clientY: e.clientY
                  }, '*');
                } catch(err) {}
              });
              window.addEventListener('mousedown', function() {
                try { window.parent.postMessage({ type: '__CUSTOM_POINTER_DOWN__' }, '*'); } catch(err) {}
              });
              window.addEventListener('mouseup', function() {
                try { window.parent.postMessage({ type: '__CUSTOM_POINTER_UP__' }, '*'); } catch(err) {}
              });
            })();
          </script>
        </head>
        <body>
          ${studentHtml}
        </body>
      </html>
    `;
  }, [srcDoc, studentHtml, studentCss]);

  return (
    <div
      style={height ? { height: typeof height === "number" ? `${height}px` : height } : undefined}
      className={cn(
        "relative w-full select-none overflow-hidden rounded-[22px] border border-[var(--mac-hairline-strong)] bg-[var(--mac-surface)] shadow-mac-lg",
        !height && "h-full",
        className
      )}
    >
      <ImageComparison
        springOptions={springOptions}
        enableHover={true}
        className="h-full w-full"
      >
        {/* Layer 1 (Left): Hedef Şablon Referans Görseli */}
        <ImageComparisonLayer
          position="left"
          className="flex h-full w-full items-center justify-center p-8 bg-[var(--mac-surface)]"
        >
          <img
            src={targetImageUrl}
            alt="Hedef Şablon"
            className="max-h-[85%] max-w-[85%] object-contain rounded-2xl shadow-mac-md pointer-events-none select-none"
          />
        </ImageComparisonLayer>

        {/* Layer 2 (Right): Öğrencinin Canlı Kodu (Sandbox iframe) */}
        <ImageComparisonLayer
          position="right"
          className="flex h-full w-full items-center justify-center overflow-hidden bg-[var(--mac-surface)]"
        >
          <iframe
            srcDoc={finalSrcDoc}
            sandbox="allow-scripts"
            title="Öğrenci Kodu Önizleme"
            className="h-full w-full border-0 pointer-events-none"
          />
        </ImageComparisonLayer>

        {/* Soft Motion-Primitives Slider Handle (Monochrome) */}
        <ImageComparisonSlider className="bg-label/40 hover:bg-label/60 transition-colors shadow-[0_0_14px_rgba(255,255,255,0.25)]">
          {/* Center Thumb */}
          <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-surface shadow-mac-md ring-1 ring-hairline-strong text-label hover:scale-110 active:scale-95 transition-transform pointer-events-auto">
            <Sliders className="size-3.5 rotate-90" />
          </div>

          {/* Inset Badges floating with the slider */}
          <span className="absolute top-4 right-4 rounded-full border border-hairline bg-surface/90 px-2.5 py-0.5 text-[10px] font-semibold text-label shadow-mac-xs backdrop-blur-md pointer-events-none whitespace-nowrap">
            HEDEF ŞABLON
          </span>
          <span className="absolute top-4 left-4 rounded-full border border-hairline bg-surface/90 px-2.5 py-0.5 text-[10px] font-semibold text-label shadow-mac-xs backdrop-blur-md pointer-events-none whitespace-nowrap">
            SENİN KODUN
          </span>
        </ImageComparisonSlider>
      </ImageComparison>
    </div>
  );
}

export default DiffSlider;
