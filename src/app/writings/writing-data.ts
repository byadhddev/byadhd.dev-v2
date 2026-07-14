import type { Writing } from "../../../.velite";

export const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "security", label: "Security" },
  { value: "smart-contracts", label: "Smart contracts" },
  { value: "building", label: "Building" },
  { value: "life", label: "Life" },
] as const;

export type WritingCategory = (typeof CATEGORIES)[number]["value"];

interface ProfileContext {
  eyebrow: string;
  title: string;
  description: string;
  details: Array<{
    label: string;
    href?: string;
  }>;
}

export const PROFILE_CONTEXT: Record<WritingCategory, ProfileContext> = {
  all: {
    eyebrow: "Jagadesh / byadhddev",
    title: "Software engineer with a security habit.",
    description:
      "I write from the overlap of building systems, breaking assumptions, and noticing what the work changes in me.",
    details: [
      { label: "Full-stack engineering" },
      { label: "Security research" },
      { label: "GitHub: byadhddev", href: "https://github.com/byadhddev" },
    ],
  },
  security: {
    eyebrow: "Security profile",
    title: "Application security researcher",
    description:
      "I focus on authorization, business logic, information exposure, and the state transitions ordinary scanners tend to miss.",
    details: [
      { label: "HackerOne: 0xrj_", href: "https://hackerone.com/0xrj_?type=user" },
      { label: "Intigriti: 0_x_r_j", href: "https://app.intigriti.com/researcher/profile/0_x_r_j" },
      { label: "Manual testing + Burp Suite" },
    ],
  },
  "smart-contracts": {
    eyebrow: "Audit profile",
    title: "Smart-contract security",
    description:
      "My audit notes follow accounting invariants, external-call boundaries, gas asymmetries, and adversarial state transitions.",
    details: [
      { label: "Solidity" },
      { label: "Foundry + Hardhat" },
      { label: "Public audit case studies", href: "/writings/state-before-interactions" },
    ],
  },
  building: {
    eyebrow: "Builder profile",
    title: "Full-stack software engineer",
    description:
      "I build web products and developer tools, currently working across C#, ASP.NET Core, Angular, Azure, React, and TypeScript.",
    details: [
      { label: "Enterprise product engineering" },
      { label: "toskill", href: "https://github.com/byadhddev/toskill" },
      { label: "Open-source experiments", href: "https://github.com/byadhddev" },
    ],
  },
  life: {
    eyebrow: "Personal notes",
    title: "Curious, on purpose",
    description:
      "These are quieter notes about side projects, attention, learning in public, and making work that still feels like mine.",
    details: [
      { label: "Poster design" },
      { label: "Canvas experiment", href: "https://minis.byadhd.dev/canvas" },
      { label: "Always a side project" },
    ],
  },
};

export function isWritingCategory(value: string | undefined): value is WritingCategory {
  return CATEGORIES.some((category) => category.value === value);
}

export function formatWritingDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function getCategoryLabel(category: Writing["category"]) {
  return CATEGORIES.find((item) => item.value === category)?.label ?? category;
}
