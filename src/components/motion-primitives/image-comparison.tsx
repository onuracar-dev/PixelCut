'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  motion,
  MotionValue,
  SpringOptions,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';

export type ImageComparisonContextType = {
  sliderPosition: number;
  setSliderPosition: (pos: number) => void;
  motionSliderPosition: MotionValue<number>;
  isDragging: boolean;
};

const ImageComparisonContext = React.createContext<
  ImageComparisonContextType | undefined
>(undefined);

export function useImageComparison() {
  const context = React.useContext(ImageComparisonContext);
  if (!context) {
    throw new Error('useImageComparison must be used within an ImageComparison provider');
  }
  return context;
}

export type ImageComparisonProps = {
  children: React.ReactNode;
  className?: string;
  enableHover?: boolean;
  springOptions?: SpringOptions;
  initialPosition?: number;
  onPositionChange?: (position: number) => void;
};

/**
 * Default spring options tuned for a soft, fluid, cushioned gliding motion.
 */
const DEFAULT_SOFT_SPRING_OPTIONS: SpringOptions = {
  stiffness: 180,
  damping: 24,
  mass: 0.6,
};

function ImageComparison({
  children,
  className,
  enableHover = true,
  springOptions = DEFAULT_SOFT_SPRING_OPTIONS,
  initialPosition = 50,
  onPositionChange,
}: ImageComparisonProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const motionValue = useMotionValue(initialPosition);
  const motionSliderPosition = useSpring(
    motionValue,
    springOptions ?? DEFAULT_SOFT_SPRING_OPTIONS
  );
  const [sliderPosition, setSliderPosition] = React.useState(initialPosition);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleDrag = React.useCallback(
    (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
      if (!isDragging && !enableHover) return;
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const clientX =
        'touches' in event
          ? event.touches[0].clientX
          : (event as MouseEvent).clientX;

      const x = clientX - containerRect.left;
      const percentage = Math.min(
        Math.max((x / containerRect.width) * 100, 0),
        100
      );

      motionValue.set(percentage);
      setSliderPosition(percentage);
      onPositionChange?.(percentage);
    },
    [isDragging, enableHover, motionValue, onPositionChange]
  );

  React.useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: MouseEvent | TouchEvent) => handleDrag(e);
    const onPointerUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [isDragging, handleDrag]);

  return (
    <ImageComparisonContext.Provider
      value={{ sliderPosition, setSliderPosition, motionSliderPosition, isDragging }}
    >
      <div
        ref={containerRef}
        className={cn(
          'relative select-none overflow-hidden touch-none',
          enableHover ? 'cursor-ew-resize' : isDragging ? 'cursor-grabbing' : 'cursor-grab',
          className
        )}
        onMouseMove={handleDrag}
        onMouseDown={(e) => {
          if (!enableHover) {
            setIsDragging(true);
            handleDrag(e);
          }
        }}
        onTouchStart={(e) => {
          if (!enableHover) {
            setIsDragging(true);
            handleDrag(e);
          }
        }}
      >
        {children}
      </div>
    </ImageComparisonContext.Provider>
  );
}

const ImageComparisonImage = ({
  className,
  alt,
  src,
  position,
}: {
  className?: string;
  alt: string;
  src: string;
  position: 'left' | 'right';
}) => {
  const { motionSliderPosition } = useImageComparison();

  // Reveals left side from [0 -> value%]
  const leftClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 ${100 - value}% 0 0)`
  );

  // Reveals right side from [value% -> 100%]
  const rightClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 0 0 ${value}%)`
  );

  return (
    <motion.img
      src={src}
      alt={alt}
      className={cn('absolute inset-0 h-full w-full object-cover pointer-events-none', className)}
      style={{
        clipPath: position === 'left' ? leftClipPath : rightClipPath,
      }}
    />
  );
};

const ImageComparisonLayer = ({
  className,
  children,
  position,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  position: 'left' | 'right';
  style?: React.CSSProperties;
}) => {
  const { motionSliderPosition } = useImageComparison();

  // Reveals left side from [0 -> value%]
  const leftClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 ${100 - value}% 0 0)`
  );

  // Reveals right side from [value% -> 100%]
  const rightClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 0 0 ${value}%)`
  );

  return (
    <motion.div
      className={cn('absolute inset-0 h-full w-full', className)}
      style={{
        clipPath: position === 'left' ? leftClipPath : rightClipPath,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};

const ImageComparisonSlider = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const { motionSliderPosition } = useImageComparison();

  const left = useTransform(motionSliderPosition, (value) => `${value}%`);

  return (
    <motion.div
      className={cn(
        'absolute bottom-0 top-0 w-[2px] cursor-ew-resize z-30 pointer-events-none -translate-x-1/2',
        className
      )}
      style={{
        left,
      }}
    >
      {children}
    </motion.div>
  );
};

export {
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonLayer,
  ImageComparisonSlider,
};
export default ImageComparison;
