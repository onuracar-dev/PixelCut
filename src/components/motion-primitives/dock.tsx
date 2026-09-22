'use client';

import * as React from 'react';
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from 'motion/react';
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

const DOCK_HEIGHT = 100;
const DEFAULT_MAGNIFICATION = 68;
const DEFAULT_DISTANCE = 130;
const DEFAULT_PANEL_HEIGHT = 52;

export type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

export type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
};

export type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

export type DocContextType = {
  mouseX: MotionValue;
  spring: SpringOptions;
  magnification: number;
  distance: number;
  panelHeight: number;
  baseItemWidth: number;
};

export type DockProviderProps = {
  children: React.ReactNode;
  value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within an DockProvider');
  }
  return context;
}

function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 160, damping: 14 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const isCompact = panelHeight <= 40;
  const baseItemWidth = isCompact ? 28 : 38;

  const maxHeight = useMemo(() => {
    if (isCompact) return panelHeight;
    return Math.max(DOCK_HEIGHT, magnification + 20);
  }, [isCompact, magnification, panelHeight]);

  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{
        height: isCompact ? panelHeight : height,
        scrollbarWidth: 'none',
      }}
      className={cn(
        'flex max-w-full justify-center overflow-visible select-none',
        isCompact ? 'items-center' : 'items-end'
      )}
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          'flex w-fit items-center gap-2 rounded-[20px] px-3 border border-hairline bg-surface/85 shadow-mac-lg backdrop-blur-2xl transition-colors duration-200',
          className
        )}
        style={{ height: panelHeight }}
        role='toolbar'
        aria-label='macOS Application Dock'
      >
        <DockProvider value={{ mouseX, spring, distance, magnification, panelHeight, baseItemWidth }}>
          {children}
        </DockProvider>
      </motion.div>
    </motion.div>
  );
}

function DockItem({ children, className, onClick, isActive }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { distance, magnification, mouseX, spring, baseItemWidth } = useDock();

  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - domRect.x - domRect.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemWidth, magnification, baseItemWidth]
  );

  const width = useSpring(widthTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn(
        'relative inline-flex items-center justify-center cursor-pointer group outline-none',
        className
      )}
      tabIndex={0}
      role='button'
      aria-haspopup='true'
      onClick={onClick}
    >
      {Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return cloneElement(child as React.ReactElement<{ width?: MotionValue<number>; isHovered?: MotionValue<number> }>, {
            width,
            isHovered,
          });
        }
        return child;
      })}
      {/* macOS Running / Active App Dot Indicator */}
      {isActive && (
        <span className="absolute -bottom-1.5 size-1 rounded-full bg-tint shadow-[0_0_6px_var(--mac-tint)]" />
      )}
    </motion.div>
  );
}

export type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
};

function DockLabel({ children, className, side = "top", ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps['isHovered'] as MotionValue<number> | undefined;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  const isBottom = side === "bottom";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: isBottom ? -4 : 0, scale: 0.92 }}
          animate={{ opacity: 1, y: isBottom ? 6 : -10, scale: 1 }}
          exit={{ opacity: 0, y: isBottom ? -4 : 0, scale: 0.92 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className={cn(
            'pointer-events-none absolute left-1/2 w-fit whitespace-pre rounded-full border border-hairline bg-surface/95 px-2.5 py-0.5 text-[11px] font-medium text-label shadow-mac-sm backdrop-blur-xl z-50',
            isBottom ? 'top-full mt-1.5' : '-top-8',
            className
          )}
          role='tooltip'
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const width = restProps['width'] as MotionValue<number> | undefined;

  const widthTransform = useTransform(width || useMotionValue(38), (val) => Math.max(18, val * 0.52));

  return (
    <motion.div
      style={{ width: widthTransform, height: widthTransform }}
      className={cn('flex items-center justify-center rounded-[12px] transition-colors', className)}
    >
      {children}
    </motion.div>
  );
}

function DockDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-6 w-px bg-hairline-strong/60 mx-1 shrink-0', className)}
      role='separator'
      aria-orientation='vertical'
    />
  );
}

export { Dock, DockIcon, DockItem, DockLabel, DockDivider };
