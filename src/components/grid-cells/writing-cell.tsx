"use client";

import Link from "next/link";
import { ArrowUpRight, NotePencil } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

export function WritingCell() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Link
      href="/writings"
      className="group relative flex h-full flex-col justify-between p-4 sm:p-5"
      aria-label="Read writings"
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[9px] font-medium uppercase tracking-widest"
          style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
        >
          writings
        </span>
        <ArrowUpRight
          size={13}
          weight="light"
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.32)" }}
        />
      </div>

      <div>
        <NotePencil
          size={22}
          weight="light"
          style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)" }}
        />
        <p
          className="mt-4 text-[15px] font-light leading-snug tracking-[-0.025em] sm:text-[17px]"
          style={{ color: isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.72)" }}
        >
          Things I learned by looking closer.
        </p>
        <p
          className="mt-3 text-[10px] font-light leading-relaxed"
          style={{ color: isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)" }}
        >
          Security, smart contracts, building, and life.
        </p>
      </div>

      <span
        className="text-[9px] uppercase tracking-[0.14em]"
        style={{ color: isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.28)" }}
      >
        6 notes
      </span>
    </Link>
  );
}
