"use client";

import { useTheme } from "next-themes";

const TRIED = [
  "DeFi",
  "ethical hacking",
  "smart contracts",
  "poster design",
  "e-governance",
  "Angular",
  "freelancing",
  "blockchain",
  "motion design",
  "AI red teaming",
  ".NET",
  "C#",
];

export function TriedCell() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const base = isDark ? 255 : 0;

  return (
    <div className="relative flex flex-col h-full p-3 pt-8 pb-3 sm:p-4 sm:pt-9 sm:pb-4 overflow-hidden">
      {/* Label */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-30 flex items-center justify-between">
        <span
          className="text-[9px] uppercase tracking-widest font-medium"
          style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
        >
          tried
        </span>
        <span
          className="font-mono text-[9px] tabular-nums"
          style={{ color: `rgba(${base},${base},${base},0.28)` }}
        >
          {TRIED.length} logged
        </span>
      </div>

      {/* A ledger of abandoned attempts — numbered rows divided by hairlines,
          continuously scrolling upward like an endless log of energy spent.
          The list is duplicated so the loop is seamless; it pauses on hover. */}
      <div
        className="group relative flex-1 min-h-0 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0, #000 12px, #000 calc(100% - 14px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0, #000 12px, #000 calc(100% - 14px), transparent 100%)",
        }}
      >
        <ul
          className="flex flex-col will-change-transform group-hover:[animation-play-state:paused]"
          style={{ animation: "scrollUp 16s linear infinite" }}
        >
          {[...TRIED, ...TRIED].map((item, i) => {
            const idx = i % TRIED.length;
            const drain = idx / (TRIED.length - 1); // 0 (fresh) → 1 (spent)
            const opacity = 0.7 - drain * 0.4; // energy draining down the list
            return (
              <li
                key={`${item}-${i}`}
                className="flex h-7 sm:h-8 items-center gap-2 border-b leading-none select-none"
                style={{
                  borderColor: `rgba(${base},${base},${base},0.07)`,
                }}
              >
                <span
                  className="font-mono text-[8px] sm:text-[9px] tabular-nums shrink-0 w-4"
                  style={{ color: `rgba(${base},${base},${base},${opacity * 0.5})` }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span
                  className="flex-1 truncate text-[10px] sm:text-[12px] font-light line-through decoration-[0.5px]"
                  style={{
                    color: `rgba(${base},${base},${base},${opacity})`,
                    textDecorationColor: `rgba(${base},${base},${base},${opacity * 0.5})`,
                  }}
                >
                  {item}
                </span>
                <span
                  className="shrink-0 text-[10px]"
                  style={{ color: `rgba(${base},${base},${base},${opacity * 0.45})` }}
                >
                  ✕
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Worn footer — the exhaustion made explicit */}
      <span
        className="mt-1.5 shrink-0 text-right text-[8px] sm:text-[9px] italic lowercase tracking-wide"
        style={{ color: `rgba(${base},${base},${base},0.28)` }}
      >
        …and moved on
      </span>
    </div>
  );
}
