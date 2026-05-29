"use client";

import { useTheme } from "next-themes";

type Status = "reading" | "next" | "done";

interface Book {
  title: string;
  author: string;
  status: Status;
}

const BOOKS: Book[] = [
  { title: "The Pragmatic Programmer", author: "Hunt & Thomas", status: "done" },
  { title: "Designing Data-Intensive Apps", author: "Kleppmann", status: "reading" },
  { title: "Atomic Habits", author: "James Clear", status: "done" },
  { title: "Deep Work", author: "Cal Newport", status: "next" },
  { title: "The Almanack of Naval", author: "Eric Jorgenson", status: "next" },
  { title: "Clean Code", author: "Robert C. Martin", status: "done" },
];

const STATUS_LABEL: Record<Status, string> = {
  reading: "Reading now",
  next: "Up next",
  done: "Finished",
};

// Display order top → bottom: planned (next) first, then reading, finished last
const STATUS_ORDER: Record<Status, number> = { next: 0, reading: 1, done: 2 };
const ORDERED_BOOKS = [...BOOKS].sort(
  (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
);

export function ReadingCell() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const titleColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.82)";
  const subColor = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.4)";
  const bookFace = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const bookBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)";
  const pageEdge = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.16)";

  // Status accent intensity (monochrome, no color)
  const accent = (s: Status) => {
    if (s === "reading") return isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)";
    if (s === "next") return isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";
    return isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"; // done = faint
  };

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden p-3 sm:p-4">
      {/* Stacked books (lying flat, full width) */}
      <div className="flex-1 flex flex-col justify-end gap-[5px] min-h-0">
        {ORDERED_BOOKS.map((book) => (
          <div
            key={book.title}
            className="group relative w-full rounded-[3px] flex items-stretch overflow-hidden"
            style={{
              flex: "1 1 0",
              minHeight: 0,
              backgroundColor: bookFace,
              border: `1px solid ${bookBorder}`,
            }}
            title={`${book.title} — ${STATUS_LABEL[book.status]}`}
          >
            {/* Status accent bar (the book's "spine edge") */}
            <div
              className="shrink-0 w-[3px]"
              style={{ backgroundColor: accent(book.status) }}
            />
            {/* Page-edge ribbing, like the side of a real book */}
            <div
              className="shrink-0 w-[6px]"
              style={{
                background: `repeating-linear-gradient(to bottom, ${pageEdge} 0 1px, transparent 1px 3px)`,
                borderRight: `1px solid ${bookBorder}`,
              }}
            />

            {/* Title + reveal */}
            <div className="relative flex-1 min-w-0 flex items-center px-2.5">
              <span
                className="truncate text-[10px] sm:text-[11px] font-semibold tracking-tight leading-none"
                style={{ color: titleColor }}
              >
                {book.title}
              </span>
            </div>

            {/* Right meta: author by default, status on hover */}
            <div className="relative shrink-0 flex items-center pr-2.5 pl-3 overflow-hidden">
              <span
                className="text-[8px] uppercase tracking-wider leading-none whitespace-nowrap transition-all duration-200 group-hover:-translate-y-3 group-hover:opacity-0"
                style={{ color: subColor }}
              >
                {book.author}
              </span>
              <span
                className="absolute right-2.5 text-[8px] uppercase tracking-wider leading-none whitespace-nowrap translate-y-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
                style={{ color: titleColor }}
              >
                {STATUS_LABEL[book.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
