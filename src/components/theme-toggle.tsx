"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function ThemePill() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [hovered, setHovered] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9 sm:w-10 sm:h-10" />;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative">
      <div className="absolute -inset-[5px] rounded-[14px] bg-[var(--background)] z-[-1]" />
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] transition-[filter] duration-300 ease-out"
        style={{
          backgroundColor: isDark ? "#1a1a1a" : "#e2e2e2",
          filter: hovered ? (isDark ? "brightness(1.4)" : "brightness(0.92)") : "brightness(1)",
        }}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.2] mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />
        {isDark ? (
          <Sun size={17} className="relative z-10 text-white/90" weight="light" />
        ) : (
          <Moon size={17} className="relative z-10 text-black/75" weight="light" />
        )}
      </button>
    </div>
  );
}
