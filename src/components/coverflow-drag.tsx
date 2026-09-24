"use client"

import React, { useEffect, useState } from "react"
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
  MotionValue,
} from "motion/react"
import { Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CoverflowItem {
  id: string
  name: string
  role?: string
  src: string
  tag?: string
}

export const DEFAULT_AVATARS: CoverflowItem[] = [
  {
    id: "av-adventurer-1",
    name: "Alex",
    role: "Adventurer",
    src: "https://api.dicebear.com/9.x/adventurer/svg?seed=Alex&backgroundColor=b6e3f4,c0aede,d1d4f9",
  },
  {
    id: "av-bottts-1",
    name: "Pixel Bot",
    role: "Cybernetic",
    src: "https://api.dicebear.com/9.x/bottts/svg?seed=PixelBot&backgroundColor=c0aede,d1d4f9,b6e3f4",
  },
  {
    id: "av-lorelei-1",
    name: "Selin",
    role: "Illustrator",
    src: "https://api.dicebear.com/9.x/lorelei/svg?seed=Selin&backgroundColor=ffd5dc,ffdfbf,b6e3f4",
  },
  {
    id: "av-pixel-1",
    name: "Retro Glitch",
    role: "8-Bit Coder",
    src: "https://api.dicebear.com/9.x/pixel-art/svg?seed=RetroGlitch&backgroundColor=b6e3f4,c0aede",
  },
  {
    id: "av-notionists-1",
    name: "Emre",
    role: "Minimalist",
    src: "https://api.dicebear.com/9.x/notionists/svg?seed=Emre&backgroundColor=ffdfbf,ffd5dc",
  },
  {
    id: "av-micah-1",
    name: "Deniz",
    role: "Designer",
    src: "https://api.dicebear.com/9.x/micah/svg?seed=Deniz&backgroundColor=d1d4f9,b6e3f4",
  },
  {
    id: "av-openpeeps-1",
    name: "Ece",
    role: "Creator",
    src: "https://api.dicebear.com/9.x/open-peeps/svg?seed=Ece&backgroundColor=ffd5dc,c0aede",
  },
  {
    id: "av-bottts-2",
    name: "Samurai Bot",
    role: "Cyber Ronin",
    src: "https://api.dicebear.com/9.x/bottts/svg?seed=SamuraiBot&backgroundColor=b6e3f4,d1d4f9",
  },
]

export interface CoverflowDragProps {
  items?: CoverflowItem[]
  selectedId?: string
  onSelect?: (item: CoverflowItem) => void
  className?: string
}

const DRAG_DIST = 180
const X_OFFSET = 120
const Y_OFFSET = 16
const SCALE_STEP = 0.14
const OVERLAY_MAX = 0.85
const BOUNCE = 0.25
const DURATION = 0.45

export default function CoverflowDrag({
  items = DEFAULT_AVATARS,
  selectedId,
  onSelect,
  className,
}: CoverflowDragProps) {
  const containerX = useMotionValue(0)
  const N = items.length
  const [activeIndex, setActiveIndex] = useState(0)

  // Sync when selectedId prop is passed
  useEffect(() => {
    if (selectedId) {
      const idx = items.findIndex((it) => it.id === selectedId || it.src === selectedId)
      if (idx !== -1 && idx !== activeIndex) {
        setActiveIndex(idx)
        animate(containerX, -idx * DRAG_DIST, {
          type: "spring",
          bounce: BOUNCE,
          duration: DURATION,
        })
      }
    }
  }, [selectedId, items])

  const snapToIndex = (index: number) => {
    const wrapped = ((index % N) + N) % N
    setActiveIndex(wrapped)
    animate(containerX, -wrapped * DRAG_DIST, {
      type: "spring",
      bounce: BOUNCE,
      duration: DURATION,
    })
    onSelect?.(items[wrapped])
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const currentX = containerX.get()
    const velocity = info.velocity.x

    const predictedX = currentX + velocity * 0.18
    const rawIndex = Math.round(-predictedX / DRAG_DIST)
    const nearestIndex = ((rawIndex % N) + N) % N

    snapToIndex(nearestIndex)
  }

  return (
    <div
      className={cn(
        "relative flex h-[380px] w-full items-center justify-center overflow-hidden select-none",
        className
      )}
    >
      <motion.div
        drag="x"
        style={{ x: containerX }}
        onDragEnd={handleDragEnd}
        dragConstraints={{
          left: -(N - 1) * DRAG_DIST - 100,
          right: 100,
        }}
        className="absolute inset-0 flex cursor-grab items-center justify-center active:cursor-grabbing"
      >
        {items.map((item, i) => (
          <Card
            key={item.id || i}
            i={i}
            item={item}
            N={N}
            containerX={containerX}
            isActive={activeIndex === i}
            onCardClick={() => snapToIndex(i)}
          />
        ))}
      </motion.div>
    </div>
  )
}

function Card({
  i,
  item,
  N,
  containerX,
  isActive,
  onCardClick,
}: {
  i: number
  item: CoverflowItem
  N: number
  containerX: MotionValue<number>
  isActive: boolean
  onCardClick: () => void
}) {
  const getDist = (cx: number) => {
    let d = (i * DRAG_DIST + cx) / DRAG_DIST
    d = ((d % N) + N) % N
    if (d > N / 2) d -= N
    return d
  }

  const x = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return d * X_OFFSET - cx
  })

  const y = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return Math.abs(d) * Y_OFFSET
  })

  const scale = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return Math.max(0, 1 - Math.abs(d) * SCALE_STEP)
  })

  const zIndex = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return 100 - Math.round(Math.abs(d) * 10)
  })

  const opacity = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return Math.max(0, Math.min(1, 3.2 - Math.abs(d)))
  })

  const overlayOpacity = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return Math.min(OVERLAY_MAX, Math.abs(d) * 0.35)
  })

  const borderOpacity = useTransform(containerX, (cx) => {
    const d = getDist(cx)
    return Math.max(0, 1 - Math.abs(d) * 1.8)
  })

  return (
    <motion.div
      onClick={onCardClick}
      style={{ x, y, scale, zIndex, opacity }}
      className={cn(
        "absolute top-1/2 left-1/2 -mt-[145px] -ml-[110px] h-[290px] w-[220px] origin-center cursor-pointer overflow-hidden rounded-[24px] bg-surface shadow-2xl transition-shadow border border-hairline",
        isActive && "shadow-mac-lg ring-2 ring-hairline-strong"
      )}
    >
      <div className="relative h-full w-full flex items-center justify-center p-6 bg-gradient-to-b from-well/20 via-surface to-well/60">
        <img
          src={item.src}
          className="pointer-events-none h-full w-full object-contain select-none drop-shadow-lg transition-transform duration-300"
          alt={item.name}
        />
      </div>

      {/* Dark overlay for side cards */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="pointer-events-none absolute inset-0 bg-black/60 select-none backdrop-blur-[1px]"
      />

      {/* Bottom center clean name only */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/85 via-black/40 to-transparent pb-3 pt-8">
        <span className="text-[13px] font-medium tracking-tight text-white/95 drop-shadow-sm">
          {item.name}
        </span>
      </div>

      {/* Active ring indicator */}
      <motion.div
        style={{ opacity: borderOpacity }}
        className="pointer-events-none absolute inset-0 rounded-[24px] border-2 border-white/80 select-none shadow-[inset_0_0_12px_rgba(255,255,255,0.25)]"
      />

      {/* Top right check badge if active */}
      {isActive && (
        <div className="absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-full bg-white text-black shadow-mac-sm z-10 animate-in zoom-in-50 duration-200">
          <Check className="size-3.5 stroke-[3]" />
        </div>
      )}
    </motion.div>
  )
}

