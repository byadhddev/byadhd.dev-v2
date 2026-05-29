"use client";

import { useTheme } from "next-themes";

const THOUGHTS = [
  "the best code I wrote was the code I deleted",
  "every side project is a letter to my future self",
  "clarity comes from shipping, not thinking",
];

export function WritingCell() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Pick a random thought on each render (client-side)
  const thought = THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)];

  return (
    <div className="relative flex flex-col justify-center h-full p-4 sm:p-5">
      <p
        className="text-[12px] sm:text-[13px] font-light italic leading-relaxed"
        style={{ color: isDark ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.58)" }}
      >
        &ldquo;{thought}&rdquo;
      </p>
    </div>
  );
}
