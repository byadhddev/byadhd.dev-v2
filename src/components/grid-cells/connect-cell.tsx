"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  GithubLogo,
  XLogo,
  EnvelopeSimple,
  Sun,
  Moon,
} from "@phosphor-icons/react";
import { FaLinkedinIn } from "react-icons/fa";

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const LINKS = [
  { label: "Twitter", href: "https://x.com/byadhddev", icon: XLogo },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jagadesh-ronanki/", icon: FaLinkedinIn },
  { label: "GitHub", href: "https://github.com/byadhddev", icon: GithubLogo },
  { label: "Email", href: "mailto:jagadesh.ronanki@gmail.com", icon: EnvelopeSimple },
];

const TIME_ZONE = "Asia/Kolkata";
const TZ_LABEL = "IST";

const OTHER_ZONES = [
  { label: "PT", tz: "America/Los_Angeles" },
  { label: "ET", tz: "America/New_York" },
  { label: "GMT", tz: "Europe/London" },
];

function fmtTime(tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function istHour() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  ) % 24;
}

// 23:00–08:00 sleeping · 09:00–18:00 working · otherwise available
function statusFor(h: number) {
  if (h >= 23 || h < 8) return { text: "sleeping", tone: "rest" as const };
  if (h >= 9 && h < 18) return { text: "at work", tone: "busy" as const };
  return { text: "available", tone: "free" as const };
}

export function ConnectCell() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [hovered, setHovered] = useState<string | null>(null);
  const [now, setNow] = useState<string>("");
  const [others, setOthers] = useState<string[]>([]);
  const [status, setStatus] = useState(() => statusFor(0));
  const [showZones, setShowZones] = useState(false);

  useEffect(() => {
    const update = () => {
      setNow(fmtTime(TIME_ZONE));
      setOthers(OTHER_ZONES.map((z) => fmtTime(z.tz)));
      setStatus(statusFor(istHour()));
    };
    update();
    const id = setInterval(update, 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const dotColor =
    status.tone === "free"
      ? isDark
        ? "rgba(120,200,120,0.85)"
        : "rgba(60,150,60,0.85)"
      : status.tone === "busy"
        ? isDark
          ? "rgba(220,180,90,0.85)"
          : "rgba(190,140,40,0.85)"
        : isDark
          ? "rgba(255,255,255,0.3)"
          : "rgba(0,0,0,0.3)";

  return (
    <div className="relative flex flex-col justify-end h-full p-3 sm:p-4">
      {/* Label */}
      <span
        className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 text-[9px] uppercase tracking-widest font-medium"
        style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
      >
        connect
      </span>

      {/* Local time + status (click to reveal other zones) */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex flex-col items-end gap-1">
        <button
          onClick={() => setShowZones((v) => !v)}
          className="flex items-center gap-1.5 text-[10px] tabular-nums cursor-pointer"
          style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)" }}
          aria-label="Toggle other timezones"
        >
          <span
            className="block w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: dotColor,
              animation: status.tone === "free" ? "breathe 3s ease-in-out infinite" : undefined,
            }}
          />
          <span className="font-medium tracking-wide">{now}</span>
          <span className="uppercase tracking-widest opacity-70">{TZ_LABEL}</span>
        </button>

        <span
          className="text-[9px] lowercase tracking-wide"
          style={{ color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.33)" }}
        >
          {status.text}
        </span>

        {showZones && (
          <div
            className="mt-1 flex flex-col items-end gap-0.5 text-[9px] tabular-nums animate-[fadeIn_0.25s_ease]"
            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }}
          >
            {OTHER_ZONES.map((z, i) => (
              <div key={z.label} className="flex items-center gap-1.5">
                <span className="font-medium tracking-wide">{others[i]}</span>
                <span className="uppercase tracking-widest opacity-70">{z.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Icons row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const isThis = hovered === link.label;
          return (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              onMouseEnter={() => setHovered(link.label)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden transition-[filter] duration-300 ease-out"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                filter: isThis ? (isDark ? "brightness(1.5)" : "brightness(0.88)") : "brightness(1)",
              }}
              aria-label={link.label}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
                style={{ backgroundImage: GRAIN }}
              />
              <Icon size={14} className="relative z-10" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }} />
            </a>
          );
        })}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          onMouseEnter={() => setHovered("theme")}
          onMouseLeave={() => setHovered(null)}
          className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden transition-[filter] duration-300 ease-out ml-auto"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            filter: hovered === "theme" ? (isDark ? "brightness(1.5)" : "brightness(0.88)") : "brightness(1)",
          }}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
            style={{ backgroundImage: GRAIN }}
          />
          {isDark ? (
            <Sun size={14} className="relative z-10" style={{ color: "rgba(255,255,255,0.7)" }} weight="light" />
          ) : (
            <Moon size={14} className="relative z-10" style={{ color: "rgba(0,0,0,0.6)" }} weight="light" />
          )}
        </button>
      </div>
    </div>
  );
}
