"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { ExpandToggle } from "@/components/grid-cells/expand-toggle";

interface Video {
  id: string;
  title: string;
  published: string;
}

const FALLBACK_VIDEOS: Video[] = [];

async function fetchVideos(): Promise<Video[]> {
  try {
    const res = await fetch("/api/youtube");
    if (!res.ok) return FALLBACK_VIDEOS;
    return res.json();
  } catch {
    return FALLBACK_VIDEOS;
  }
}

interface YoutubeCellProps {
  expanded: boolean;
  onToggle?: () => void;
}

export function YoutubeCell({ expanded, onToggle }: YoutubeCellProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [videos, setVideos] = useState<Video[]>(FALLBACK_VIDEOS);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [isColorized, setIsColorized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const colorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchVideos()
      .then(setVideos)
      .finally(() => setLoading(false));
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (colorTimerRef.current) {
      clearTimeout(colorTimerRef.current);
      colorTimerRef.current = null;
    }
    setIsColorized(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    colorTimerRef.current = setTimeout(() => {
      setIsColorized(false);
      colorTimerRef.current = null;
    }, 20000);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    e.preventDefault();
    const scrollAmount = container.clientWidth;
    if (e.deltaY > 0 || e.deltaX > 0) {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Expand / collapse toggle - top right */}
      {onToggle && (
        <ExpandToggle expanded={expanded} onToggle={onToggle} isDark={isDark} />
      )}

      {/* Snap scroll container - horizontal */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="h-full w-full overflow-x-auto snap-x snap-mandatory flex transition-[filter,opacity] duration-500"
        style={{
          scrollbarWidth: "none",
          opacity: isColorized || playing ? 1 : 0.85,
          filter:
            isColorized || playing
              ? "none"
              : isDark
                ? "grayscale(1) brightness(0.8)"
                : "grayscale(1) brightness(0.95)",
        }}
      >
        {videos.map((video) => (
          <div key={video.id} className="relative h-full w-full shrink-0 snap-center flex items-center justify-center p-2">
            <div className="relative rounded-md overflow-hidden h-full max-w-full" style={{ aspectRatio: "16/9" }}>
              {/* YouTube logo */}
              <a
                href="https://youtube.com/@byadhddev"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 left-2 z-30"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  <path
                    d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              {playing === video.id ? (
                <>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={video.title}
                  />
                  {/* Stop / reset back to the thumbnail */}
                  <button
                    onClick={() => setPlaying(null)}
                    aria-label="Stop video"
                    className="group absolute bottom-2 left-2 z-30 flex h-7 items-center gap-1.5 rounded-md px-2 outline-none transition-colors duration-200"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(6px)",
                      border: "1px solid rgba(255,255,255,0.14)",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200 group-hover:-translate-x-0.5"
                    >
                      <path d="M10 3L5 8l5 5" />
                    </svg>
                    <span className="text-[9px] uppercase tracking-[0.16em] font-medium">
                      back
                    </span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setPlaying(video.id)}
                  className="absolute inset-0 w-full h-full group cursor-pointer"
                >
                  <Image
                    src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-200">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 2.5L13 8L4 13.5V2.5Z" fill="white" />
                      </svg>
                    </div>
                  </div>
                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-linear-to-t from-black/70 to-transparent">
                    <p className="text-[10px] sm:text-xs text-white/90 font-light leading-tight line-clamp-2">
                      {video.title}
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <div className="h-full w-full shrink-0 flex items-center justify-center p-2">
            {loading ? (
              <div
                className="skeleton h-full max-w-full rounded-md"
                style={{ aspectRatio: "16/9" }}
                aria-hidden="true"
              />
            ) : (
              <span
                className="text-[10px]"
                style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)" }}
              >
                no videos yet
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
