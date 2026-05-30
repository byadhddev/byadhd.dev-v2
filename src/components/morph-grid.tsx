"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { NowCell } from "@/components/grid-cells/now-cell";
import { AboutCell } from "@/components/grid-cells/about-cell";
import { ProjectsCell } from "@/components/grid-cells/projects-cell";
import { ExperienceCell } from "@/components/grid-cells/experience-cell";
import { StackCell } from "@/components/grid-cells/stack-cell";
import { PostersCell } from "@/components/grid-cells/posters-cell";
import { TriedCell } from "@/components/grid-cells/tried-cell";
import { ConnectCell } from "@/components/grid-cells/connect-cell";
import { YoutubeCell } from "@/components/grid-cells/youtube-cell";
import { GithubCell } from "@/components/grid-cells/github-cell";
import { ReadingCell } from "@/components/grid-cells/reading-cell";
import { GuestbookCell } from "@/components/grid-cells/guestbook-cell";
import { PosterColorProvider } from "@/components/poster-color-context";

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const GAP = 7;

interface Slot {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

interface Section {
  id: string;
  label: string;
  bgDark: string;
  bgLight: string;
}

const SECTIONS: Section[] = [
  { id: "about", label: "About", bgDark: "#151515", bgLight: "#efefef" },
  { id: "projects", label: "Projects", bgDark: "#181818", bgLight: "#ebebeb" },
  { id: "experience", label: "Experience", bgDark: "#141414", bgLight: "#ededed" },
  { id: "stack", label: "Tech Stack", bgDark: "#1a1a1a", bgLight: "#e8e8e8" },
  { id: "now", label: "Now", bgDark: "#171717", bgLight: "#f0f0f0" },
  { id: "posters", label: "Posters", bgDark: "#131313", bgLight: "#ececec" },
  { id: "tried", label: "Tried", bgDark: "#161616", bgLight: "#eaeaea" },
  { id: "connect", label: "Connect", bgDark: "#191919", bgLight: "#ededed" },
  { id: "youtube", label: "YouTube", bgDark: "#151515", bgLight: "#f0f0f0" },
  { id: "github", label: "GitHub", bgDark: "#171717", bgLight: "#eaeaea" },
  { id: "reading", label: "Bookshelf", bgDark: "#161616", bgLight: "#eaeaea" },
  { id: "guestbook", label: "Guestbook", bgDark: "#141414", bgLight: "#ededed" },
];

// Every card has a fixed, content-appropriate footprint [colSpan, rowSpan] so
// its shape stays identical across refreshes. Only its position changes.
//   2×2  square feature blocks   → youtube (16:9 video), about (name + bio)
//   1×2  tall columns            → posters (portrait), guestbook (feed), reading (book list)
//   2×1  wide strips             → projects (name + tag rows), connect (icon row), github (graph)
//   1×1  square minis            → stack (3×3 puzzle), tried, experience, now
const CARD_SHAPE: Record<string, [number, number]> = {
  youtube: [2, 2],
  about: [2, 2],
  posters: [1, 2],
  guestbook: [1, 2],
  reading: [1, 2],
  projects: [2, 1],
  connect: [2, 1],
  github: [2, 1],
  stack: [1, 1],
  tried: [1, 1],
  experience: [1, 1],
  now: [1, 1],
};

// Desktop layouts (6 cols × 4 rows = 24 cells). Every layout contains the exact
// same multiset of slot shapes as CARD_SHAPE (two 2×2, three 1×2, three 2×1,
// four 1×1), so cards keep their shape and only swap positions between loads.
const DESKTOP_LAYOUTS: Slot[][] = [
  [
    { col: 1, row: 1, colSpan: 2, rowSpan: 2 }, // 2×2
    { col: 1, row: 3, colSpan: 2, rowSpan: 2 }, // 2×2
    { col: 3, row: 1, colSpan: 1, rowSpan: 2 }, // 1×2
    { col: 4, row: 1, colSpan: 1, rowSpan: 2 }, // 1×2
    { col: 3, row: 3, colSpan: 1, rowSpan: 2 }, // 1×2
    { col: 5, row: 1, colSpan: 2, rowSpan: 1 }, // 2×1
    { col: 5, row: 2, colSpan: 2, rowSpan: 1 }, // 2×1
    { col: 5, row: 3, colSpan: 2, rowSpan: 1 }, // 2×1
    { col: 4, row: 3, colSpan: 1, rowSpan: 1 }, // 1×1
    { col: 4, row: 4, colSpan: 1, rowSpan: 1 }, // 1×1
    { col: 5, row: 4, colSpan: 1, rowSpan: 1 }, // 1×1
    { col: 6, row: 4, colSpan: 1, rowSpan: 1 }, // 1×1
  ],
  [
    { col: 5, row: 1, colSpan: 2, rowSpan: 2 }, // 2×2
    { col: 5, row: 3, colSpan: 2, rowSpan: 2 }, // 2×2
    { col: 1, row: 1, colSpan: 1, rowSpan: 2 }, // 1×2
    { col: 2, row: 1, colSpan: 1, rowSpan: 2 }, // 1×2
    { col: 4, row: 3, colSpan: 1, rowSpan: 2 }, // 1×2
    { col: 1, row: 3, colSpan: 2, rowSpan: 1 }, // 2×1
    { col: 1, row: 4, colSpan: 2, rowSpan: 1 }, // 2×1
    { col: 3, row: 1, colSpan: 2, rowSpan: 1 }, // 2×1
    { col: 3, row: 2, colSpan: 1, rowSpan: 1 }, // 1×1
    { col: 4, row: 2, colSpan: 1, rowSpan: 1 }, // 1×1
    { col: 3, row: 3, colSpan: 1, rowSpan: 1 }, // 1×1
    { col: 3, row: 4, colSpan: 1, rowSpan: 1 }, // 1×1
  ],
  [
    { col: 1, row: 1, colSpan: 2, rowSpan: 2 }, // 2×2
    { col: 5, row: 3, colSpan: 2, rowSpan: 2 }, // 2×2
    { col: 3, row: 1, colSpan: 1, rowSpan: 2 }, // 1×2
    { col: 4, row: 1, colSpan: 1, rowSpan: 2 }, // 1×2
    { col: 1, row: 3, colSpan: 1, rowSpan: 2 }, // 1×2
    { col: 5, row: 1, colSpan: 2, rowSpan: 1 }, // 2×1
    { col: 5, row: 2, colSpan: 2, rowSpan: 1 }, // 2×1
    { col: 2, row: 3, colSpan: 2, rowSpan: 1 }, // 2×1
    { col: 2, row: 4, colSpan: 1, rowSpan: 1 }, // 1×1
    { col: 3, row: 4, colSpan: 1, rowSpan: 1 }, // 1×1
    { col: 4, row: 3, colSpan: 1, rowSpan: 1 }, // 1×1
    { col: 4, row: 4, colSpan: 1, rowSpan: 1 }, // 1×1
  ],
];

// Mobile is a single vertical stack (2 columns) built at runtime: small 1×1
// cards pair up side-by-side, every other (larger) card spans the full width.
// See buildMobileLayout below.

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Repack the grid around the expanded card (sized expW × expH). The expanded
// card is anchored first, then the rest are placed biggest-first (row-major
// first-fit); anything that no longer fits returns null and is pushed out.
function packAround(
  slots: Slot[],
  expandIdx: number,
  cols: number,
  rows: number,
  expW: number,
  expH: number
): (Slot | null)[] {
  const occ: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );
  const fits = (col: number, row: number, cs: number, rs: number) => {
    if (col < 1 || row < 1 || col + cs - 1 > cols || row + rs - 1 > rows)
      return false;
    for (let r = row - 1; r < row - 1 + rs; r++)
      for (let c = col - 1; c < col - 1 + cs; c++) if (occ[r][c]) return false;
    return true;
  };
  const mark = (col: number, row: number, cs: number, rs: number) => {
    for (let r = row - 1; r < row - 1 + rs; r++)
      for (let c = col - 1; c < col - 1 + cs; c++) occ[r][c] = true;
  };

  const result: (Slot | null)[] = slots.map(() => null);

  // Anchor the expanded block, clamped so it stays in bounds.
  const base = slots[expandIdx];
  const eCol = Math.min(Math.max(base.col, 1), cols - expW + 1);
  const eRow = Math.min(Math.max(base.row, 1), rows - expH + 1);
  mark(eCol, eRow, expW, expH);
  result[expandIdx] = { col: eCol, row: eRow, colSpan: expW, rowSpan: expH };

  // Place remaining cards, biggest first, into the first free spot that fits.
  const order = slots
    .map((_, i) => i)
    .filter((i) => i !== expandIdx)
    .sort(
      (a, b) =>
        slots[b].colSpan * slots[b].rowSpan - slots[a].colSpan * slots[a].rowSpan
    );

  for (const i of order) {
    const { colSpan, rowSpan } = slots[i];
    let placed = false;
    for (let row = 1; row <= rows && !placed; row++) {
      for (let col = 1; col <= cols && !placed; col++) {
        if (fits(col, row, colSpan, rowSpan)) {
          mark(col, row, colSpan, rowSpan);
          result[i] = { col, row, colSpan, rowSpan };
          placed = true;
        }
      }
    }
  }

  return result;
}

const MOBILE_COLS = 2;
const MOBILE_EXPAND_ROWSPAN = 5;

// Build the mobile stack. Small 1×1 cards are paired up so two share a row
// (one per column); every larger card takes a full-width row. Pairs and
// full-width cards are then shuffled together into a single vertical stack.
function buildMobileLayout(): { slots: Slot[]; sections: Section[]; rows: number } {
  const isSmall = (s: Section) => {
    const [w, h] = CARD_SHAPE[s.id];
    return w === 1 && h === 1;
  };

  const small = shuffle(SECTIONS.filter(isSmall));
  const large = shuffle(SECTIONS.filter((s) => !isSmall(s)));

  // Each block is one stacked row: a pair of small cards, or a single card.
  type Block = Section[];
  const blocks: Block[] = [];
  for (let i = 0; i < small.length; i += 2) blocks.push(small.slice(i, i + 2));
  for (const s of large) blocks.push([s]);
  shuffle(blocks);

  // Keep the about card pinned to the top of the mobile stack.
  blocks.sort((a, b) => {
    const aAbout = a.some((s) => s.id === "about") ? -1 : 0;
    const bAbout = b.some((s) => s.id === "about") ? -1 : 0;
    return aAbout - bAbout;
  });

  const slots: Slot[] = [];
  const sections: Section[] = [];
  let row = 1;

  for (const block of blocks) {
    if (block.length === 2) {
      slots.push({ col: 1, row, colSpan: 1, rowSpan: 1 });
      sections.push(block[0]);
      slots.push({ col: 2, row, colSpan: 1, rowSpan: 1 });
      sections.push(block[1]);
      row += 1;
    } else {
      const s = block[0];
      const [, h] = CARD_SHAPE[s.id];
      const rowSpan = h === 2 ? 2 : 1;
      slots.push({ col: 1, row, colSpan: MOBILE_COLS, rowSpan });
      sections.push(s);
      row += rowSpan;
    }
  }

  return { slots, sections, rows: row - 1 };
}

// Grow the expanded card in place and push everything below it further down.
function expandMobile(slots: Slot[], expandIdx: number): Slot[] {
  const base = slots[expandIdx];
  const target = Math.max(MOBILE_EXPAND_ROWSPAN, base.rowSpan);
  const delta = target - base.rowSpan;
  return slots.map((s, i) => {
    if (i === expandIdx) return { ...s, col: 1, colSpan: MOBILE_COLS, rowSpan: target };
    if (s.row > base.row) return { ...s, row: s.row + delta };
    return s;
  });
}

export function MorphGrid() {
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<{ slots: Slot[]; sections: Section[]; cols: number; rows: number } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const mobile = window.innerWidth < 640;

    if (mobile) {
      const { slots, sections, rows } = buildMobileLayout();
      setLayout({ slots, sections, cols: MOBILE_COLS, rows });
      setMounted(true);
      return;
    }

    const cols = 6;
    const rows = 4;
    const slots = pickRandom(DESKTOP_LAYOUTS);

    // Bucket cards by their fixed shape, shuffle within each bucket, then drop
    // each card into a slot of the matching shape. Cards therefore always keep
    // their shape; only which same-shaped slot they occupy varies per load.
    const shapeKey = (w: number, h: number) => `${w}x${h}`;
    const byShape: Record<string, string[]> = {};
    for (const s of SECTIONS) {
      const [w, h] = CARD_SHAPE[s.id];
      (byShape[shapeKey(w, h)] ??= []).push(s.id);
    }
    for (const k in byShape) byShape[k] = shuffle(byShape[k]);

    const sections: Section[] = slots.map((slot) => {
      const id = byShape[shapeKey(slot.colSpan, slot.rowSpan)].shift()!;
      return SECTIONS.find((s) => s.id === id)!;
    });

    setLayout({ slots, sections, cols, rows });
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full" />;
  if (!layout) return null;

  const mobile = layout.cols === MOBILE_COLS;
  // Any of these cards can expand into a large block that renders its full
  // content in place, repacking the rest of the grid around it.
  const expandIdx = expandedId
    ? layout.sections.findIndex((s) => s.id === expandedId)
    : -1;
  const renderSlots: (Slot | null)[] =
    expandIdx >= 0
      ? mobile
        ? (layout.sections[expandIdx].id === "about"
          ? layout.slots // about auto-sizes its row to the resume; no growth
          : expandMobile(layout.slots, expandIdx))
        : packAround(layout.slots, expandIdx, layout.cols, layout.rows, 3, 3)
      : layout.slots;

  const toggle = (id: string) =>
    setExpandedId((cur) => (cur === id ? null : id));

  return (
    <PosterColorProvider>
    <div className={`relative w-full ${mobile ? "" : "h-full"}`}>
      <div
        className={`w-full grid ${mobile ? "" : "h-full"}`}
        style={
          mobile
            ? {
                gridTemplateColumns: `repeat(${MOBILE_COLS}, 1fr)`,
                gridAutoRows: "minmax(9.5rem, auto)",
                gap: GAP + "px",
              }
            : {
                gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
                gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
                gap: GAP + "px",
              }
        }
      >
        <AnimatePresence>
        {layout.slots.map((_, i) => {
          const section = layout.sections[i];
          const slot = renderSlots[i];
          if (!slot) return null; // pushed out while a card is expanded
          const isExpanded = expandedId === section.id;

          return (
            <motion.div
              key={section.id}
              layout
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.7 }}
              className="relative overflow-hidden rounded-xl sm:rounded-2xl"
              style={{
                gridColumn: `${slot.col} / span ${slot.colSpan}`,
                gridRow: `${slot.row} / span ${slot.rowSpan}`,
                backgroundColor: isDark ? section.bgDark : section.bgLight,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                boxShadow: isDark
                  ? "0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
                  : "0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
                zIndex: isExpanded ? 10 : 1,
                // @ts-expect-error CSS custom property
                "--cell-bg": isDark ? section.bgDark : section.bgLight,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
                style={{ backgroundImage: GRAIN }}
              />
              {section.id === "now" && <NowCell />}
              {section.id === "about" && (
                <AboutCell
                  expanded={isExpanded}
                  onToggle={() => toggle("about")}
                />
              )}
              {section.id === "projects" && <ProjectsCell />}
              {section.id === "experience" && <ExperienceCell />}
              {section.id === "stack" && <StackCell />}
              {section.id === "posters" && (
                <PostersCell
                  expanded={isExpanded}
                  onToggle={() => toggle("posters")}
                />
              )}
              {section.id === "tried" && <TriedCell />}
              {section.id === "connect" && <ConnectCell />}
              {section.id === "youtube" && (
                <YoutubeCell
                  expanded={isExpanded}
                  onToggle={mobile ? undefined : () => toggle("youtube")}
                />
              )}
              {section.id === "github" && <GithubCell />}
              {section.id === "reading" && <ReadingCell />}
              {section.id === "guestbook" && <GuestbookCell />}
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
    </div>
    </PosterColorProvider>
  );
}
