"use client";

interface ExpandToggleProps {
  expanded: boolean;
  onToggle: () => void;
  isDark: boolean;
}

// A clear, easily accessible corner control with a consistent rounded-rectangle
// shape (no circles). Collapsed: a small "open" affordance that reveals a label
// on hover. Expanded: an obvious close (×) button. Monochrome, soft backdrop.
export function ExpandToggle({ expanded, onToggle, isDark }: ExpandToggleProps) {
  const base = {
    backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.65)",
    color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)",
    backdropFilter: "blur(6px)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
  };

  if (expanded) {
    return (
      <button
        onClick={onToggle}
        aria-label="Close"
        className="group absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 flex h-7 w-7 items-center justify-center rounded-md outline-none transition-colors duration-200"
        style={base}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="transition-opacity duration-200 group-hover:opacity-100"
          style={{ opacity: 0.85 }}
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      aria-label="Expand"
      aria-expanded={false}
      className="group absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 flex h-7 items-center gap-1 rounded-md px-1.5 outline-none transition-colors duration-300"
      style={base}
    >
      <span className="max-w-0 overflow-hidden text-[9px] uppercase tracking-[0.16em] font-medium opacity-0 transition-all duration-300 group-hover:max-w-10 group-hover:opacity-100">
        open
      </span>
      <svg
        width="13"
        height="13"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 transition-transform duration-300 group-hover:scale-110"
      >
        <path d="M10 3h3v3" />
        <path d="M13 3l-4.5 4.5" />
        <path d="M6 13H3v-3" />
        <path d="M3 13l4.5-4.5" />
      </svg>
    </button>
  );
}
