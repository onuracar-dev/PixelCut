"use client";

import * as React from "react";
import { Drawer as VaulDrawer } from "vaul";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE_CURVE = [0.76, 0, 0.24, 1] as const;

interface CurveProps {
  side?: "left" | "right";
  className?: string;
  curveWidth?: number;
  open?: boolean;
}

function Curve({ side = "left", className, curveWidth = 100, open = true }: CurveProps) {
  const isReduced = !!useReducedMotion();
  const ref = React.useRef<SVGSVGElement>(null);
  const [height, setHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    const update = () => {
      const parent = ref.current?.parentElement;
      const h = (parent && parent.offsetHeight) || (typeof window !== "undefined" ? window.innerHeight : 800);
      if (!height || height !== h) setHeight(h);
    };
    update();
    const parent = ref.current?.parentElement;
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (parent && observer) observer.observe(parent);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [height]);

  const isLeft = side === "left";
  const f = isLeft ? 0 : curveWidth;
  const v = isLeft ? 2 * curveWidth : -curveWidth;
  const w = `M${f} 0 L${f} ${height} Q${v} ${height / 2} ${f} 0`;
  const p = `M${f} 0 L${f} ${height} Q${f} ${height / 2} ${f} 0`;
  const b = open ? w : p;
  const g = open ? p : [p, p, w, p];
  const offset = `-${curveWidth - 1}px`;

  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute top-0 z-10 h-full overflow-visible fill-surface [fill:var(--mac-surface)]", className)}
      focusable="false"
      preserveAspectRatio="none"
      ref={ref}
      stroke="none"
      style={{
        width: curveWidth,
        ...(isLeft ? { right: offset } : { left: offset }),
      }}
    >
      {height > 0 ? (
        <motion.path
          animate={{ d: g }}
          d={p}
          initial={{ d: b }}
          transition={
            isReduced
              ? { duration: 0.01 }
              : open
              ? { type: "tween", duration: 1, ease: EASE_CURVE }
              : { type: "tween", duration: 0.8, ease: EASE_CURVE, times: [0, 0.36, 0.52, 1] }
          }
          key={`${open ? "open" : "closed"}-${height}`}
        />
      ) : null}
    </svg>
  );
}

interface CurveDrawerContextType {
  open: boolean;
  direction: "left" | "right" | "top" | "bottom";
}

const CurveDrawerContext = React.createContext<CurveDrawerContextType>({
  open: false,
  direction: "left",
});

export type CurveDrawerProps = React.ComponentProps<typeof VaulDrawer.Root> & {
  direction?: "left" | "right" | "top" | "bottom";
  handleOnly?: boolean;
};

export function CurveDrawer({
  open: controlledOpen,
  onOpenChange,
  children,
  direction = "left",
  handleOnly,
  ...props
}: CurveDrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const [delayedOpen, setDelayedOpen] = React.useState(isOpen);
  const [animatingOpen, setAnimatingOpen] = React.useState(isOpen);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    let t: NodeJS.Timeout | null = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isOpen) {
      t = setTimeout(() => {
        setDelayedOpen(true);
        setAnimatingOpen(true);
      }, 0);
      return () => {
        if (t) clearTimeout(t);
      };
    } else {
      t = setTimeout(() => {
        setAnimatingOpen(false);
      }, 0);
      timerRef.current = setTimeout(() => {
        setDelayedOpen(false);
        timerRef.current = null;
      }, 800);
      return () => {
        if (t) clearTimeout(t);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [isOpen]);

  const handleOpenChange = (openState: boolean) => {
    onOpenChange?.(openState);
    if (!isControlled) {
      setUncontrolledOpen(openState);
    }
  };

  return (
    <CurveDrawerContext.Provider value={{ open: animatingOpen, direction }}>
      <VaulDrawer.Root
        data-slot="curve-drawer"
        direction={direction}
        open={delayedOpen}
        onOpenChange={handleOpenChange}
        handleOnly={handleOnly}
        {...props}
      >
        {children}
      </VaulDrawer.Root>
    </CurveDrawerContext.Provider>
  );
}

export type CurveDrawerTriggerProps = React.ComponentProps<typeof VaulDrawer.Trigger> & {
  render?: React.ReactElement;
};

export function CurveDrawerTrigger({ render, children, asChild, ...props }: CurveDrawerTriggerProps) {
  if (render) {
    return (
      <VaulDrawer.Trigger asChild data-slot="curve-drawer-trigger" {...props}>
        {React.cloneElement(render, {}, children ?? (render.props as any).children)}
      </VaulDrawer.Trigger>
    );
  }
  return <VaulDrawer.Trigger asChild={asChild} data-slot="curve-drawer-trigger" {...props}>{children}</VaulDrawer.Trigger>;
}

export function CurveDrawerPortal(props: React.ComponentProps<typeof VaulDrawer.Portal>) {
  return <VaulDrawer.Portal data-slot="curve-drawer-portal" {...props} />;
}

export type CurveDrawerCloseProps = React.ComponentProps<typeof VaulDrawer.Close> & {
  render?: React.ReactElement;
};

export function CurveDrawerClose({ render, children, asChild, ...props }: CurveDrawerCloseProps) {
  if (render) {
    return (
      <VaulDrawer.Close asChild data-slot="curve-drawer-close" {...props}>
        {React.cloneElement(render, {}, children ?? (render.props as any).children)}
      </VaulDrawer.Close>
    );
  }
  return <VaulDrawer.Close asChild={asChild} data-slot="curve-drawer-close" {...props}>{children}</VaulDrawer.Close>;
}

export function CurveDrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Overlay>) {
  return (
    <VaulDrawer.Overlay
      className={cn(
        "fixed inset-0 z-[110] bg-black/25 backdrop-blur-xs transition-opacity duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      data-slot="curve-drawer-overlay"
      {...props}
    />
  );
}

export type CurveDrawerContentProps = React.ComponentProps<typeof VaulDrawer.Content> & {
  curveSide?: "left" | "right";
  curveWidth?: number;
};

export function CurveDrawerContent({
  className,
  children,
  curveSide,
  curveWidth = 100,
  style,
  ...props
}: CurveDrawerContentProps) {
  const { open, direction } = React.useContext(CurveDrawerContext);
  const isReduced = !!useReducedMotion();
  const side = curveSide ?? (direction === "left" || direction === "right" ? direction : undefined);
  const hasCurve = side === "left" || side === "right";
  const hiddenTranslate =
    side === "left" ? `calc(-100% - ${curveWidth}px)` : side === "right" ? `calc(100% + ${curveWidth}px)` : "0";

  return (
    <CurveDrawerPortal data-slot="curve-drawer-portal">
      <CurveDrawerOverlay />
      <VaulDrawer.Content
        asChild
        data-slot="curve-drawer-content"
        {...props}
      >
        <motion.div
          animate={{
            x: open ? "0" : hiddenTranslate,
            transition: { duration: isReduced ? 0.01 : 0.8, ease: EASE_CURVE },
          }}
          initial={{ x: hiddenTranslate }}
          style={{ ...style, animation: "none", transition: "none" }}
          className={cn(
            "group/curve-drawer-content fixed z-[110] flex h-auto flex-col overflow-visible bg-surface text-sm text-foreground shadow-mac-lg outline-none",
            "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:h-full data-[vaul-drawer-direction=left]:w-[280px] data-[vaul-drawer-direction=left]:max-w-sm data-[vaul-drawer-direction=left]:rounded-r-none border-r border-hairline",
            "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-[280px] data-[vaul-drawer-direction=right]:max-w-sm data-[vaul-drawer-direction=right]:rounded-l-none border-l border-hairline",
            className
          )}
        >
          <div className="relative h-full w-full overflow-visible">
            {children}
            {hasCurve ? <Curve curveWidth={curveWidth} open={open} side={side} /> : null}
          </div>
        </motion.div>
      </VaulDrawer.Content>
    </CurveDrawerPortal>
  );
}

export function CurveDrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-0.5 p-4 md:gap-0.5 md:text-left", className)}
      data-slot="curve-drawer-header"
      {...props}
    />
  );
}

export function CurveDrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Title>) {
  return (
    <VaulDrawer.Title
      className={cn("font-medium text-base text-foreground", className)}
      data-slot="curve-drawer-title"
      {...props}
    />
  );
}

export function CurveDrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Description>) {
  return (
    <VaulDrawer.Description
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="curve-drawer-description"
      {...props}
    />
  );
}
