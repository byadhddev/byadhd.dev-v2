"use client";

import { useTheme } from "next-themes";

export function ExperienceCell() {
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
            experience
          </span>
        </div>
      </div>
      <span
        className="text-[10px] uppercase tracking-widest"
        style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
      >
        since aug 2024
      </span>
      <p
        className="mt-1.5 text-[12px] sm:text-[13px] font-medium leading-snug tracking-[-0.01em]"
        style={{ color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)" }}
      >
        Digital Specialist Engineer
      </p>
      <p
        className="mt-0.5 text-[11px] font-light"
        style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)" }}
      >
        Infosys
      </p>
    </div>
  );
}
