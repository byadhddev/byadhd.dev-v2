"use client";

import { useTheme } from "next-themes";

// This will eventually come from a CMS, X post, or local file
// For now, hardcoded as a starting point
const NOW = {
  thought: "trying to figure out what to say no to",
  date: "may 27",
};

export function NowCell() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative flex flex-col justify-end h-full p-4 sm:p-5">
      <p
        className="text-[13px] sm:text-[14px] leading-snug font-light tracking-[-0.01em]"
        style={{ color: isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.7)" }}
      >
        {NOW.thought}
      </p>
      <span
        className="mt-2 text-[10px] uppercase tracking-widest"
        style={{ color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.33)" }}
      >
        {NOW.date}
      </span>
    </div>
  );
}
