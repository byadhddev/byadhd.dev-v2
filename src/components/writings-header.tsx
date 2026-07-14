"use client";

import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

interface WritingsHeaderProps {
  backHref: "/" | "/writings";
}

export function WritingsHeader({ backHref }: WritingsHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="flex items-center justify-between gap-4">
      <Link
        href={backHref}
        className="group inline-flex items-center gap-2 text-[10px] font-medium text-black/50 transition-colors hover:text-black/80 dark:text-white/45 dark:hover:text-white/80"
      >
        <ArrowLeft
          size={14}
          weight="light"
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
        byadhddev
      </Link>
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex size-9 items-center justify-center rounded-lg border border-black/[0.07] bg-black/[0.035] text-black/60 transition-colors hover:bg-black/[0.07] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white/65 dark:hover:bg-white/[0.09]"
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? <Sun size={15} weight="light" /> : <Moon size={15} weight="light" />}
      </button>
    </header>
  );
}
