"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/utils";

export interface PointerProps extends HTMLMotionProps<"div"> {
  /** Optional name or role tag to display beside the pointer (e.g. "Tasarımcı" or "CSS Slicer") */
  name?: string;
  children?: React.ReactNode;
  /**
   * If true (default is true), tracks the mouse across the entire window and suppresses the OS cursor app-wide.
   * If false, only tracks mouse over its immediate parent element.
   */
  global?: boolean;
}

/**
 * MagicUI Pointer Component (Colored Pointer variant).
 * Displays an animated custom pointer that follows the mouse across the entire application.
 * 
 * - In Light mode: Black arrow with crisp white stroke and shadow.
 * - In Dark mode: White arrow with crisp dark stroke and shadow.
 * - Perfectly calibrated hotspot at (0, 0).
 * - App-wide coverage: Works across toolbar, sidebar, tabs, Monaco editor, canvas, and drawers.
 * - Interactive feedback: Scales down slightly on click, scales up subtly on hover over clickable elements.
 */
export function Pointer({
  className,
  style,
  children,
  name,
  global = true,
  ...props
}: PointerProps): React.ReactNode {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const [isActive, setIsActive] = React.useState<boolean>(false);
  const [isPressed, setIsPressed] = React.useState<boolean>(false);
  const [isInteractive, setIsInteractive] = React.useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Only disable custom cursor on strictly touch-only devices without a fine mouse/trackpad pointer
    const isTouchOnly =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(any-pointer: fine)").matches &&
      !window.matchMedia("(pointer: fine)").matches &&
      !(window as any).electronAPI?.isElectron;

    if (isTouchOnly) {
      return;
    }

    if (global) {
      document.documentElement.classList.add("custom-pointer-active");

      const handlePointerMove = (e: PointerEvent) => {
        x.set(e.clientX);
        y.set(e.clientY);
        if (!isActive) setIsActive(true);

        const target = e.target as HTMLElement | null;
        if (target) {
          const interactive = Boolean(
            target.closest(
              'button, a, input, select, textarea, [role="button"], [role="tab"], [role="option"], [role="menuitem"], .cursor-pointer, [data-interactive="true"]'
            )
          );
          setIsInteractive(interactive);
        }
      };

      const handlePointerDown = () => setIsPressed(true);
      const handlePointerUp = () => setIsPressed(false);

      const handleMouseLeave = (e: MouseEvent) => {
        // If mouse left the browser/app window entirely
        if (!e.relatedTarget) {
          setIsActive(false);
        }
      };

      const handleMouseEnter = (e: MouseEvent) => {
        x.set(e.clientX);
        y.set(e.clientY);
        setIsActive(true);
      };

      const handleBlur = () => setIsActive(false);
      const handleFocus = () => setIsActive(true);

      // Support bridging mouse events from sandboxed iframes
      const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === "__CUSTOM_POINTER_MOVE__") {
          const iframes = document.querySelectorAll("iframe");
          for (let i = 0; i < iframes.length; i++) {
            const ifr = iframes[i];
            if (ifr.contentWindow === e.source) {
              const rect = ifr.getBoundingClientRect();
              x.set(rect.left + (e.data.clientX || 0));
              y.set(rect.top + (e.data.clientY || 0));
              if (!isActive) setIsActive(true);
              break;
            }
          }
        } else if (e.data?.type === "__CUSTOM_POINTER_DOWN__") {
          setIsPressed(true);
        } else if (e.data?.type === "__CUSTOM_POINTER_UP__") {
          setIsPressed(false);
        }
      };

      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerdown", handlePointerDown, { passive: true });
      window.addEventListener("pointerup", handlePointerUp, { passive: true });
      document.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("mouseenter", handleMouseEnter);
      window.addEventListener("blur", handleBlur);
      window.addEventListener("focus", handleFocus);
      window.addEventListener("message", handleMessage);

      return () => {
        document.documentElement.classList.remove("custom-pointer-active");
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointerup", handlePointerUp);
        document.removeEventListener("mouseleave", handleMouseLeave);
        document.removeEventListener("mouseenter", handleMouseEnter);
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("message", handleMessage);
      };
    } else {
      // Container-scoped mode
      const parentElement = containerRef.current?.parentElement ?? null;
      if (!parentElement) return;

      const handleMouseMove = (e: MouseEvent) => {
        x.set(e.clientX);
        y.set(e.clientY);
        if (!isActive) setIsActive(true);
      };

      const handleMouseEnter = (e: MouseEvent) => {
        x.set(e.clientX);
        y.set(e.clientY);
        setIsActive(true);
        parentElement.style.cursor = "none";
      };

      const handleMouseLeave = () => {
        setIsActive(false);
        parentElement.style.cursor = "";
      };

      parentElement.addEventListener("mousemove", handleMouseMove);
      parentElement.addEventListener("mouseenter", handleMouseEnter);
      parentElement.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        parentElement.style.cursor = "";
        parentElement.removeEventListener("mousemove", handleMouseMove);
        parentElement.removeEventListener("mouseenter", handleMouseEnter);
        parentElement.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [global, x, y, isActive]);

  return (
    <>
      {!global && <div ref={containerRef} className="hidden" />}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="pointer-events-none fixed z-[999999] origin-top-left will-change-transform"
            style={{
              top: y,
              left: x,
              ...style,
            }}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: isPressed ? 0.85 : isInteractive ? 1.08 : 1,
              opacity: 1,
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 550,
              damping: 32,
              mass: 0.5,
            }}
            {...props}
          >
            {children || (
              <div
                className="relative flex items-center gap-1.5 select-none"
                style={{
                  transform: "translate(-6.3px, -0.4px)",
                }}
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="1.2"
                  viewBox="0 0 16 16"
                  height="22"
                  width="22"
                  xmlns="http://www.w3.org/2000/svg"
                  className={cn(
                    "rotate-[-70deg] stroke-white fill-black text-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-colors duration-200",
                    "dark:stroke-zinc-950 dark:fill-white dark:text-white dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]",
                    className
                  )}
                >
                  <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
                </svg>
                {name && (
                  <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-medium text-white shadow-mac-xs dark:bg-white dark:text-black">
                    {name}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Pointer;
