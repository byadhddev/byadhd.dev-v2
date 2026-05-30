"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

const TITLES = [
  "software engineer, maybe",
  "building things, figuring out the rest",
  "can't say no, working on it",
  "full-stack by trade, restless by nature",
];

const RESUME_URL = "/resume.pdf";

// Virtual width the PDF iframe is rendered at before being scaled down to fit.
// A4 page aspect ratio (height / width) used to size the scaled wrapper.
const PDF_W = 794; // ~ A4 width in px at 96dpi
const PDF_ASPECT = 1.414;

interface AboutCellProps {
  expanded: boolean;
  onToggle: () => void;
}

export function AboutCell({ expanded, onToggle }: AboutCellProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [titleIdx, setTitleIdx] = useState(0);
  const pdfWrapRef = useRef<HTMLDivElement>(null);
  const [pdfScale, setPdfScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setTitleIdx(Math.floor(Math.random() * TITLES.length));
    setIsMobile(window.innerWidth < 640);
  }, []);

  // The native PDF viewer ignores fit params on mobile and zooms in. To make
  // the full page fit, render the iframe at a fixed virtual width (PDF_W) and
  // scale it down to the container width. On wide screens scale stays 1.
  useEffect(() => {
    if (!expanded || !isMobile) return;
    const el = pdfWrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setPdfScale(w < PDF_W ? w / PDF_W : 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, isMobile]);

  const base = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
  const sheen = isDark ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.95)";
  const subColor = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)";
  const labelColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";

  // ---- Expanded: the résumé PDF shown directly in place of the bio ----
  if (expanded) {
    return (
      <div className={`relative flex w-full flex-col ${isMobile ? "" : "h-full"}`}>
        <div className="flex items-center justify-between px-3 py-2 sm:px-4">
          <span
            className="text-[9px] uppercase tracking-widest font-medium"
            style={{ color: labelColor }}
          >
            résumé
          </span>
          <div className="flex items-center gap-1">
            <a
              href={RESUME_URL}
              download
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download résumé PDF"
              className="rounded-full p-1 transition-colors"
              style={{ color: subColor }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <button
              onClick={onToggle}
              aria-label="Close"
              className="group flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-200"
              style={{
                backgroundColor: isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.05)",
                color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="opacity-85 transition-opacity duration-200 group-hover:opacity-100"
              >
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        </div>
        {isMobile ? (
          <div
            ref={pdfWrapRef}
            className="relative px-2 pb-2 overflow-hidden"
            style={{ height: Math.round(PDF_W * PDF_ASPECT * pdfScale) }}
          >
            <div
              style={{
                width: PDF_W,
                height: PDF_W * PDF_ASPECT,
                transform: `scale(${pdfScale})`,
                transformOrigin: "top left",
              }}
            >
              <iframe
                src={`${RESUME_URL}#toolbar=0&navpanes=0&view=FitH`}
                title="Résumé PDF"
                className="rounded-lg border-0"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="relative flex-1 min-h-0 px-3 pb-3">
            <iframe
              src={`${RESUME_URL}#toolbar=0&navpanes=0&view=FitH`}
              title="Résumé PDF"
              className="h-full w-full rounded-lg border-0"
              style={{ backgroundColor: isDark ? "#1a1a1a" : "#fff" }}
            />
          </div>
        )}
      </div>
    );
  }

  // ---- Collapsed: name, tagline, bio + a small résumé trigger ----
  return (
    <div className="relative flex flex-col justify-between h-full p-5 sm:p-7">
      {/* Résumé trigger — a bare text link with an underline that draws on hover. */}
      <button
        onClick={onToggle}
        aria-expanded={false}
        aria-label="Expand résumé"
        className="group absolute top-5 right-5 sm:top-6 sm:right-6 z-10 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] font-medium outline-none"
        style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)" }}
      >
        <span className="relative">
          résumé
          <span
            className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100"
            style={{ backgroundColor: "currentColor" }}
          />
        </span>
        <svg
          width="9"
          height="9"
          viewBox="0 0 12 12"
          fill="none"
          className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          <path
            d="M3 9L9 3M9 3H4.5M9 3V7.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div>
        {/* Name with a slow monochrome light-sheen drifting across it */}
        <h1
          className="text-[30px] sm:text-[40px] font-light tracking-[-0.03em] leading-none select-none"
          style={{
            backgroundImage: `linear-gradient(105deg, ${base} 0%, ${base} 38%, ${sheen} 50%, ${base} 62%, ${base} 100%)`,
            backgroundSize: "250% 100%",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            animation: "sheen 7s ease-in-out infinite",
          }}
        >
          Jagadesh
        </h1>
        <p
          className="mt-2 text-[13px] sm:text-[14px] font-light tracking-[-0.01em]"
          style={{ color: subColor }}
        >
          {TITLES[titleIdx]}
        </p>
      </div>

      <p
        className="text-[11px] sm:text-[12px] leading-relaxed font-light max-w-70"
        style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.52)" }}
      >
        I experiment on the go, finding my own rhythm. Not just building software — crafting
        experiences that feel distinctly mine.
      </p>
    </div>
  );
}
