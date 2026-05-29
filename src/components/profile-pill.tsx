"use client";

import { useState, useEffect } from "react";
import {
  GithubLogo,
  XLogo,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { FaLinkedinIn } from "react-icons/fa";
import { useTheme } from "next-themes";

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const LINKS = [
  { label: "Twitter", href: "https://x.com/byadhddev", icon: XLogo, bg: "#1a1a1a", bgLight: "#e2e2e2" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jagadesh-ronanki/", icon: FaLinkedinIn, bg: "#1c2127", bgLight: "#dde4ea" },
  { label: "GitHub", href: "https://github.com/byadhddev", icon: GithubLogo, bg: "#1e1e1e", bgLight: "#e8e8e8" },
  { label: "Email", href: "mailto:jagadesh.ronanki@gmail.com", icon: EnvelopeSimple, bg: "#262020", bgLight: "#ebe6e6" },
];

export function ProfilePill() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div />;

  return (
    <>
      {LINKS.map((link) => {
        const Icon = link.icon;
        const isThis = hovered === link.label;
        return (
          <div key={link.label} className="relative">
            <div className="absolute -inset-[5px] rounded-[14px] bg-[var(--background)] z-[-1]" />
            <a
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              onMouseEnter={() => setHovered(link.label)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] transition-[filter] duration-300 ease-out"
              style={{
                backgroundColor: isDark ? link.bg : link.bgLight,
                filter: isThis ? (isDark ? "brightness(1.4)" : "brightness(0.92)") : "brightness(1)",
              }}
              aria-label={link.label}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.2] mix-blend-overlay"
                style={{ backgroundImage: GRAIN }}
              />
              <Icon size={15} className="relative z-10 dark:text-white/90 text-black/75" />
            </a>
          </div>
        );
      })}
    </>
  );
}
