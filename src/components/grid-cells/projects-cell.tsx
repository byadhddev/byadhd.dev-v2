"use client";

import { useTheme } from "next-themes";

const PROJECTS = [
  { name: "AI Red Team Swarm", tag: "llm security", href: "https://airedteam.byadhd.dev/" },
  { name: "Canvas", tag: "particle physics", href: "https://minis.byadhd.dev/canvas" },
  { name: "Vibeloper", tag: "link-in-bio", href: "https://minis.byadhd.dev/vibeloper" },
];

export function ProjectsCell() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative flex flex-col justify-end h-full p-4 sm:p-5">
      {/* Heading pill with cutout halo */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
        <div
          className="absolute -inset-[5px] rounded-[10px]"
          style={{ backgroundColor: "var(--cell-bg)" }}
        />
        <div
          className="relative inline-flex items-center px-2.5 py-[4px] rounded-md border"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          }}
        >
          <span
            className="relative z-10 text-[9px] uppercase tracking-widest font-medium leading-none"
            style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}
          >
            projects
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {PROJECTS.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-3 transition-opacity duration-200 hover:opacity-100"
            style={{ opacity: 0.85 }}
          >
            <span
              className="text-[12px] sm:text-[13px] font-medium tracking-[-0.01em]"
              style={{ color: isDark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.8)" }}
            >
              {p.name}
            </span>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] uppercase tracking-wider"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.38)" }}
              >
                {p.tag}
              </span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
              >
                <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
