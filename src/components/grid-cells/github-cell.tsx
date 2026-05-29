"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { usePosterColor } from "@/components/poster-color-context";

const GITHUB_USERNAME = "byadhddev";

const FUNNY_MESSAGES = [
  "No code, just vibes.",
  "Rest day best day.",
  "Thinking... buffering...",
  "Aaj mood nahi hai.",
  "Ee roju rest.",
  "¡Hoy no!",
  "Touch grass day.",
  "Error 404: Motivation not found.",
  "Recharging my neurons.",
  "A wizard never commits late, nor early.",
  "Kal karenge.",
  "Repu chuddam.",
  "Dolce far niente.",
  "Plotting world domination.",
  "Committing to doing nothing.",
  "Gone fishing.",
  "C'est la vie.",
  "Brain.exe has stopped working.",
  "Debugging life.",
  "Bas hawa aane de.",
  "I was compiling... mentally.",
  "Heute leider nicht.",
  "Ganbare... tomorrow.",
  "Systems sleeping.",
  "Planned maintenance.",
  "Kaali peeli timepass.",
  "Silence is golden.",
  "Null pointer exception: Energy.",
  "Developers need naps too.",
  "Void.",
];

// Deterministically pick a funny message based on the date string
function funnyMessage(date: string): string {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) | 0;
  }
  return FUNNY_MESSAGES[Math.abs(hash) % FUNNY_MESSAGES.length];
}

interface Day {
  date: string;
  count: number;
  level: number;
}

async function fetchContributions(): Promise<Day[]> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.contributions ?? [];
  } catch {
    return [];
  }
}

// Group days into weeks (columns), aligned so each column has 7 rows (Sun-Sat)
function toWeeks(days: Day[]): (Day | null)[][] {
  if (days.length === 0) return [];
  const weeks: (Day | null)[][] = [];
  let current: (Day | null)[] = [];

  // Pad the first week so the first day lands on its correct weekday row
  const firstDay = new Date(days[0].date).getDay();
  for (let i = 0; i < firstDay; i++) current.push(null);

  for (const day of days) {
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }
  return weeks;
}

export function GithubCell() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { rgb: posterRgb } = usePosterColor();
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<{
    label: string;
    sub: string;
    x: number;
    y: number;
    alignX: "left" | "center" | "right";
    below: boolean;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContributions()
      .then(setDays)
      .finally(() => setLoading(false));
  }, []);

  const weeks = toWeeks(days);
  const total = days.reduce((sum, d) => sum + d.count, 0);

  const emptyColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  // Tint the graph with the active poster's dominant color when available,
  // otherwise fall back to GitHub's classic green.
  const accent = posterRgb ?? (isDark ? "120,200,120" : "64,160,64");
  const levelAlphas = isDark
    ? [0, 0.35, 0.55, 0.75, 0.95]
    : [0, 0.3, 0.5, 0.7, 0.9];
  const levelColors = levelAlphas.map((a, i) =>
    i === 0 ? emptyColor : `rgba(${accent},${a})`
  );

  const textColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function handleCellHover(day: Day, e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const label =
      day.count > 0
        ? `${day.count} contribution${day.count === 1 ? "" : "s"}`
        : funnyMessage(day.date);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Keep the tooltip inside the card: pick horizontal alignment by edge proximity
    const edge = 70;
    const alignX: "left" | "center" | "right" =
      x < edge ? "left" : x > rect.width - edge ? "right" : "center";
    // Flip below the cell when too close to the top
    const below = y < 30;
    setHovered({ label, sub: formatDate(day.date), x, y, alignX, below });
  }

  return (
    <a
      ref={containerRef}
      href={`https://github.com/${GITHUB_USERNAME}`}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex flex-col h-full w-full overflow-hidden p-3 sm:p-4 group"
    >
      {/* Label */}
      <div className="flex items-center justify-between">
        <span
          className="text-[9px] uppercase tracking-widest font-medium"
          style={{ color: textColor }}
        >
          github
        </span>
        {total > 0 && (
          <span
            className="text-[9px] font-medium tabular-nums"
            style={{ color: textColor }}
          >
            {total.toLocaleString()} this year
          </span>
        )}
      </div>

      {/* Contribution grid */}
      <div className="flex-1 flex items-center justify-center min-h-0 mt-2">
        {weeks.length > 0 ? (
          <div
            className="grid w-full h-full"
            onMouseLeave={() => setHovered(null)}
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
              gridTemplateRows: "repeat(7, 1fr)",
              gridAutoFlow: "column",
              gap: "2px",
            }}
          >
            {weeks.map((week, wi) =>
              week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className="rounded-xs w-full h-full transition-[transform,background-color] duration-150 hover:scale-150"
                  style={{
                    backgroundColor: day ? levelColors[day.level] : "transparent",
                    minHeight: "4px",
                    cursor: day ? "crosshair" : "default",
                  }}
                  onMouseEnter={day ? (e) => handleCellHover(day, e) : undefined}
                  onMouseMove={day ? (e) => handleCellHover(day, e) : undefined}
                />
              ))
            )}
          </div>
        ) : loading ? (
          <div
            className="grid w-full h-full"
            style={{
              gridTemplateColumns: "repeat(20, 1fr)",
              gridTemplateRows: "repeat(7, 1fr)",
              gridAutoFlow: "column",
              gap: "2px",
            }}
            aria-hidden="true"
          >
            {Array.from({ length: 140 }).map((_, i) => (
              <div
                key={i}
                className="skeleton rounded-xs w-full h-full"
                style={{
                  minHeight: "4px",
                  animationDelay: `${(i % 20) * 60}ms`,
                }}
              />
            ))}
          </div>
        ) : (
          <span className="text-[10px]" style={{ color: textColor }}>
            no activity yet
          </span>
        )}
      </div>

      {/* Custom themed tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-20 whitespace-nowrap rounded-md px-2 py-1 text-center shadow-lg backdrop-blur-sm"
          style={{
            left: hovered.x,
            top: hovered.below ? hovered.y + 12 : hovered.y - 8,
            transform: `translate(${
              hovered.alignX === "left"
                ? "-8px"
                : hovered.alignX === "right"
                  ? "calc(-100% + 8px)"
                  : "-50%"
            }, ${hovered.below ? "0" : "-100%"})`,
            backgroundColor: isDark ? "rgba(20,20,20,0.92)" : "rgba(255,255,255,0.95)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
          }}
        >
          <span
            className="block text-[10px] font-medium leading-tight"
            style={{ color: isDark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.85)" }}
          >
            {hovered.label}
          </span>
          <span
            className="block text-[8px] uppercase tracking-wider leading-tight"
            style={{ color: textColor }}
          >
            {hovered.sub}
          </span>
        </div>
      )}
    </a>
  );
}
