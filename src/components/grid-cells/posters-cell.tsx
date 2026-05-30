"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { usePosterColor } from "@/components/poster-color-context";
import { ExpandToggle } from "@/components/grid-cells/expand-toggle";

const POSTERS = [
  "/images/posters/orig/Poster_1.jpg",
  "/images/posters/orig/Poster_2.jpg",
  "/images/posters/orig/Poster_3.jpg",
  "/images/posters/orig/Poster_4.jpg",
  "/images/posters/orig/Poster-5.jpeg",
  "/images/posters/orig/Poster-6.jpeg",
];

// Extract a vivid dominant color from an image via a downscaled canvas.
// Returns "r,g,b" or null. Prefers saturated, mid-bright pixels so the result
// reads as the poster's "major" color rather than a muddy average.
function extractDominantColor(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = 32;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, size, size);
      let data: Uint8ClampedArray;
      try {
        data = ctx.getImageData(0, 0, size, size).data;
      } catch {
        return resolve(null);
      }
      let r = 0,
        g = 0,
        b = 0,
        weightSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const pr = data[i],
          pg = data[i + 1],
          pb = data[i + 2],
          pa = data[i + 3];
        if (pa < 128) continue;
        const max = Math.max(pr, pg, pb);
        const min = Math.min(pr, pg, pb);
        const sat = max === 0 ? 0 : (max - min) / max;
        const bright = max / 255;
        // Skip near-white / near-black; weight by saturation & mid brightness
        if (bright < 0.12 || bright > 0.96) continue;
        const w = sat * sat * (1 - Math.abs(bright - 0.55));
        if (w <= 0) continue;
        r += pr * w;
        g += pg * w;
        b += pb * w;
        weightSum += w;
      }
      if (weightSum === 0) return resolve(null);
      resolve(
        `${Math.round(r / weightSum)},${Math.round(g / weightSum)},${Math.round(b / weightSum)}`
      );
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

interface PostersCellProps {
  expanded: boolean;
  onToggle: () => void;
}

export function PostersCell({ expanded, onToggle }: PostersCellProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { setRgb } = usePosterColor();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const colorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isColorized, setIsColorized] = useState(false);
  const colorCacheRef = useRef<Record<number, string | null>>({});
  const isHoveringRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  // Push the active poster's dominant color into shared context (cached).
  useEffect(() => {
    let cancelled = false;
    const cached = colorCacheRef.current[activeIndex];
    if (cached !== undefined) {
      setRgb(cached);
      return;
    }
    extractDominantColor(POSTERS[activeIndex]).then((rgb) => {
      if (cancelled) return;
      colorCacheRef.current[activeIndex] = rgb;
      setRgb(rgb);
    });
    return () => {
      cancelled = true;
    };
  }, [activeIndex, setRgb]);

  // Auto-advance every 15s; pauses while hovering.
  useEffect(() => {
    const id = setInterval(() => {
      if (isHoveringRef.current) return;
      const container = scrollRef.current;
      if (!container) return;
      const next = (activeIndex + 1) % POSTERS.length;
      if (isMobile) {
        container.scrollTo({ left: next * container.clientWidth, behavior: "smooth" });
      } else {
        container.scrollTo({ top: next * container.clientHeight, behavior: "smooth" });
      }
    }, 15000);
    return () => clearInterval(id);
  }, [activeIndex, isMobile]);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    if (colorTimerRef.current) {
      clearTimeout(colorTimerRef.current);
      colorTimerRef.current = null;
    }
    setIsColorized(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    colorTimerRef.current = setTimeout(() => {
      setIsColorized(false);
      colorTimerRef.current = null;
    }, 20000);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    e.preventDefault();
    if (isMobile) {
      const scrollAmount = container.clientWidth;
      if (e.deltaY > 0 || e.deltaX > 0) {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    } else {
      const scrollAmount = container.clientHeight;
      if (e.deltaY > 0) {
        container.scrollBy({ top: scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ top: -scrollAmount, behavior: "smooth" });
      }
    }
  }, [isMobile]);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (isMobile) {
      const index = Math.round(container.scrollLeft / container.clientWidth);
      setActiveIndex(index);
    } else {
      const index = Math.round(container.scrollTop / container.clientHeight);
      setActiveIndex(index);
    }
  }, [isMobile]);

  return (
    <div
      className="relative h-full overflow-hidden outline-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Label - bottom left */}
      <span
        className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-30 text-[9px] uppercase tracking-widest font-medium"
        style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
      >
        posters
      </span>

      {/* Expand / collapse toggle - top right */}
      <ExpandToggle expanded={expanded} onToggle={onToggle} isDark={isDark} />

      {/* Snap scroll container */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        onScroll={handleScroll}
        className={`h-full transition-[filter,opacity] duration-500 ${
          isMobile
            ? "overflow-x-auto snap-x snap-mandatory flex flex-row"
            : "overflow-y-auto snap-y snap-mandatory"
        }`}
        style={{
          scrollbarWidth: "none",
          backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
          opacity: isColorized ? 1 : 0.85,
          filter: isColorized ? "none" : (isDark ? "grayscale(1) brightness(0.8)" : "grayscale(1) brightness(0.95)"),
        }}
      >
        {POSTERS.map((src, i) => (
          <div key={i} className={`relative snap-center shrink-0 ${isMobile ? "h-full w-full" : "h-full w-full"}`}>
            <Image
              src={src}
              alt={`Poster ${i + 1}`}
              fill
              className="object-contain p-3 pb-8"
              sizes="(max-width: 640px) 50vw, 33vw"
              loading="lazy"
              quality={60}
            />
          </div>
        ))}
      </div>

      {/* Dots - bottom right */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex gap-1 z-30">
        {POSTERS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const container = scrollRef.current;
              if (container) {
                if (isMobile) {
                  container.scrollTo({ left: i * container.clientWidth, behavior: "smooth" });
                } else {
                  container.scrollTo({ top: i * container.clientHeight, behavior: "smooth" });
                }
              }
            }}
            className="w-1 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === activeIndex
                ? (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)")
                : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"),
              transform: i === activeIndex ? "scale(1.3)" : "scale(1)",
            }}
            aria-label={`Go to poster ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
