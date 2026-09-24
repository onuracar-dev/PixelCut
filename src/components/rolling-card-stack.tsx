"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

// ==========================================
// 1. INLINE HELPER UTILITY (cn)
// ==========================================
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
export interface CardItem {
  id: string | number;
  caption: string;
  title: string;
  description: string;
  image: string;
  accentColor?: string;
  icon?: React.ReactNode;
}

export interface RollingCardStackProps extends React.HTMLAttributes<HTMLDivElement> {
  cards?: CardItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDeviceToggle?: boolean;
  defaultDevice?: "desktop" | "mobile";
  showPagination?: boolean;
  onCardChange?: (index: number, card: CardItem) => void;
}

// ==========================================
// 3. INLINE ICONS
// ==========================================
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CpuIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="9" y="9" width="6" height="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" strokeLinecap="round" />
  </svg>
);

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WavesIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" strokeLinecap="round" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="7" y1="17" x2="17" y2="7" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="7 7 17 7 17 17" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ==========================================
// 4. DEFAULT DATASET
// ==========================================
export const DEFAULT_CARDS: CardItem[] = [
  {
    id: "spatial-design",
    caption: "Spatial Architecture",
    title: "Sculpting digital calm",
    description:
      "Craft intentional spaces through minimalist geometry, tactile typography, and harmonious micro-interactions.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-orange-500",
    icon: <BuildingIcon />,
  },
  {
    id: "neural-intelligence",
    caption: "Neural Synthesis",
    title: "Autonomous creative engine",
    description:
      "Synthesize complex datasets into high-fidelity generative interfaces with ultra-low latency inference models.",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-indigo-500",
    icon: <CpuIcon />,
  },
  {
    id: "quantum-computing",
    caption: "Quantum Pipeline",
    title: "Pure algorithmic speed",
    description:
      "Accelerate mission-critical workflows with quantum-inspired parallel execution and effortless state caching.",
    image:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-sky-500",
    icon: <ZapIcon />,
  },
  {
    id: "organic-materials",
    caption: "Fluid Dynamics",
    title: "Tactile motion & balance",
    description:
      "Experience natural kinetic inertia designed to mimic liquid viscosity and frictionless physics across every viewport.",
    image:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=85",
    accentColor: "text-purple-500",
    icon: <WavesIcon />,
  },
];

// ==========================================
// 5. MAIN COMPONENT (Solid, Opaque, High-Contrast)
// ==========================================
export const RollingCardStack: React.FC<RollingCardStackProps> = ({
  cards = DEFAULT_CARDS,
  autoPlay = false,
  autoPlayInterval = 4000,
  showDeviceToggle = true,
  showPagination = true,
  defaultDevice = "desktop",
  onCardChange,
  className,
  ...props
}) => {
  const [device, setDevice] = useState<"desktop" | "mobile">(defaultDevice);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const totalCards = cards.length;

  // One wrapping step, so an empty `cards` array cannot produce `% 0` -> NaN.
  const goTo = useCallback(
    (index: number) => {
      if (totalCards === 0) return;
      const next = ((index % totalCards) + totalCards) % totalCards;
      setActiveIndex(next);
      onCardChange?.(next, cards[next]);
    },
    [cards, onCardChange, totalCards],
  );

  const handleNext = useCallback(
    () => goTo(activeIndex + 1),
    [activeIndex, goTo],
  );
  const handlePrev = useCallback(
    () => goTo(activeIndex - 1),
    [activeIndex, goTo],
  );
  const handleCardClick = useCallback((index: number) => goTo(index), [goTo]);

  // Arrow keys are handled on the root element, not on `window`. A window
  // listener that calls preventDefault swallows arrow keys for the whole page —
  // scrolling, text inputs, selects — and two stacks on one page would both
  // advance from a single press.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        handleNext();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        handlePrev();
      }
    },
    [handleNext, handlePrev],
  );

  // Autoplay
  useEffect(() => {
    if (!autoPlay || isHovered || totalCards <= 1) return;
    const timer = setInterval(handleNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, handleNext, isHovered, totalCards]);

  const isMobile = device === "mobile";

  // Dynamic cascading layout calculation to support any number of cards with infinite circular queue
  const maxVisible = 4;

  const getWidthPercent = (pos: number) => {
    const clamped = Math.min(pos, maxVisible - 1);
    return isMobile ? `${100 - clamped * 8}%` : `${100 - clamped * 10}%`;
  };

  const getYOffset = (pos: number) => {
    const clamped = Math.min(pos, maxVisible - 1);
    return isMobile ? clamped * 38 : clamped * 46;
  };

  const getCardOpacity = (pos: number) => {
    if (pos >= maxVisible) return 0;
    return 1;
  };

  const springConfig = {
    type: "spring" as const,
    stiffness: 380,
    damping: 30,
    mass: 0.75,
  };

  return (
    <div
      className={cn(
        "w-full text-label flex flex-col items-center justify-center p-2 font-sans select-none overflow-hidden relative",
        "outline-none focus-visible:ring-2 focus-visible:ring-label/40",
        className
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label="Card stack"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-4xl relative z-10">
        {/* Device Switcher (Solid Opaque Pill) */}
        {showDeviceToggle && (
          <div className="mb-4 shrink-0 flex items-center">
            <div className="relative flex items-center bg-well border border-hairline rounded-full p-1 h-9 w-40 shadow-mac-xs overflow-hidden">
              {/* Sliding Pill Indicator */}
              <motion.div
                layout
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 28,
                  mass: 0.7,
                }}
                className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm z-10"
                style={{
                  left: device === "desktop" ? "4px" : "calc(50% + 2px)",
                  width: "calc(50% - 6px)",
                }}
              />

              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={cn(
                  "relative z-20 w-1/2 h-full flex items-center justify-center text-xs font-semibold tracking-tight transition-colors duration-200",
                  device === "desktop" ? "text-neutral-950" : "text-neutral-300 hover:text-white"
                )}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={cn(
                  "relative z-20 w-1/2 h-full flex items-center justify-center text-xs font-semibold tracking-tight transition-colors duration-200",
                  device === "mobile" ? "text-neutral-950" : "text-neutral-300 hover:text-white"
                )}
              >
                Mobile
              </button>
            </div>
          </div>
        )}

        {/* Card Stage Wrapper (Fixed Height - Stationary Toggle Anchor) */}
        <div className="w-full h-[490px] flex items-center justify-center relative">
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex items-center justify-center w-full transition-all duration-300"
            style={{
              width: isMobile ? "320px" : "780px",
              maxWidth: isMobile ? "92vw" : "780px",
              height: "490px",
            }}
          >
            {cards.map((card, index) => {
              const relativePosition = (index - activeIndex + totalCards) % totalCards;
              const zIndex = totalCards - relativePosition;

              const widthPercent = getWidthPercent(relativePosition);
              const yOffset = getYOffset(relativePosition);
              const opacity = getCardOpacity(relativePosition);

              const isTop = relativePosition === 0;

              return (
                <motion.div
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  drag={isTop ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDrag={(_, info) => {
                    if (isTop) setDragOffset(info.offset.x);
                  }}
                  onDragEnd={(_, info) => {
                    setDragOffset(0);
                    if (info.offset.x < -70 || info.velocity.x < -350) {
                      handleNext();
                    } else if (info.offset.x > 70 || info.velocity.x > 350) {
                      handlePrev();
                    }
                  }}
                  layout="position"
                  initial={false}
                  animate={{
                    y: -yOffset,
                    width: widthPercent,
                    rotate: isTop ? dragOffset * 0.04 : 0,
                    zIndex: zIndex,
                    opacity: opacity,
                  }}
                  whileHover={
                    !isTop && relativePosition < maxVisible
                      ? {
                          y: -yOffset - 8,
                          transition: { type: "spring", stiffness: 450, damping: 25 },
                        }
                      : {}
                  }
                  whileTap={isTop ? { scale: 0.99 } : { scale: 0.98 }}
                  transition={springConfig}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    margin: "0 auto",
                    transformOrigin: "bottom center",
                    willChange: "transform, width",
                    pointerEvents: isTop ? "auto" : relativePosition < maxVisible ? "auto" : "none",
                  }}
                  className={cn(
                    "rounded-2xl bg-surface shadow-mac-lg border border-hairline overflow-hidden group",
                    isTop ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                    isMobile ? "h-[390px]" : "h-auto"
                  )}
                >
                  {/* Card Header Container (Solid Opaque Header) */}
                  <div
                    className={cn(
                      "flex items-center justify-between bg-well/75 border-b border-hairline select-none transition-colors duration-200",
                      !isTop && "group-hover:bg-well",
                      isMobile ? "h-11 px-4 py-2" : "h-14 px-6 py-3.5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
                          card.accentColor || "text-label"
                        )}
                      >
                        {card.icon}
                      </div>
                      <span className="font-semibold text-sm text-label tracking-tight truncate">
                        {card.caption}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-medium text-label-3">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div
                    className={cn(
                      "flex bg-surface",
                      isMobile
                        ? "flex-col p-0 pb-3"
                        : "flex-row items-center gap-2.5 p-0 pb-4"
                    )}
                  >
                    {/* Text Section (Vertically Centered) */}
                    <div
                      className={cn(
                        "flex flex-col justify-center",
                        isMobile ? "w-full p-4 text-center" : "flex-1 min-w-[250px] p-8 h-56"
                      )}
                    >
                      <h3
                        className={cn(
                          "font-semibold text-label leading-tight tracking-tight",
                          isMobile ? "text-lg" : "text-2xl"
                        )}
                      >
                        {card.title}
                      </h3>
                    </div>

                    {/* Image Section */}
                    <div
                      className={cn(
                        "flex items-center justify-center",
                        isMobile ? "w-full px-4 pb-2.5" : "flex-1 min-w-[250px] p-6 pt-0"
                      )}
                    >
                      <div
                        className={cn(
                          "relative w-full overflow-hidden rounded-xl bg-neutral-100 border border-black/5",
                          isMobile ? "h-36" : "h-56"
                        )}
                        style={{
                          mask: "radial-gradient(83% 69% at 19.8% 32.7%, rgb(0, 0, 0) 77.65%, rgba(0, 0, 0, 0) 100%)",
                          WebkitMask:
                            "radial-gradient(83% 69% at 19.8% 32.7%, rgb(0, 0, 0) 77.65%, rgba(0, 0, 0, 0) 100%)",
                        }}
                      >
                        <motion.img
                          animate={{ scale: isTop ? 1 : 1.04 }}
                          transition={springConfig}
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-cover object-center block transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer Pagination Controls */}
        {showPagination && (
          <div
            className={cn(
              "mt-6 flex items-center justify-between w-full px-2 text-neutral-500 transition-[max-width] duration-300",
              isMobile ? "max-w-[320px]" : "max-w-3xl"
            )}
          >
            {/* Step Indicators */}
            <div className={cn("flex items-center", isMobile ? "gap-1" : "gap-1.5")}>
              {cards.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCardClick(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    "group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-full",
                    isMobile ? "p-0.5" : "p-1"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-full transition-all duration-300",
                      isMobile ? "h-1" : "h-1.5",
                      i === activeIndex
                        ? isMobile
                          ? "w-5 bg-label"
                          : "w-7 bg-label"
                        : isMobile
                          ? "w-1.5 bg-label-3/40 hover:bg-label-2"
                          : "w-2 bg-label-3/40 hover:bg-label-2"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className={cn("flex items-center", isMobile ? "gap-1.5" : "gap-2")}>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Card"
                className={cn(
                  "inline-flex items-center justify-center rounded-full bg-surface hover:bg-well text-label border border-hairline shadow-mac-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-label/40",
                  isMobile ? "w-6 h-6 [&_svg]:w-3.5 [&_svg]:h-3.5" : "w-8 h-8"
                )}
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Card"
                className={cn(
                  "inline-flex items-center justify-center rounded-full bg-surface hover:bg-well text-label border border-hairline shadow-mac-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-label/40",
                  isMobile ? "w-6 h-6 [&_svg]:w-3.5 [&_svg]:h-3.5" : "w-8 h-8"
                )}
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RollingCardStack;