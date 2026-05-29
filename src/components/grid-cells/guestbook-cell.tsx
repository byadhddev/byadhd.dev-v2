"use client";

import { useState, useEffect, useTransition } from "react";
import { useTheme } from "next-themes";
import { getNotes, saveNote, type GuestbookEntry } from "@/actions/guestbook";

export function GuestbookCell() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Newest first — feature most recent notes first
    getNotes()
      .then((notes) => setEntries(notes))
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = message.trim();
    if (!msg) return;
    const entry: GuestbookEntry = { name: name.trim() || "anon", message: msg.slice(0, 80) };

    // Optimistic: prepend the new note
    setEntries((prev) => [entry, ...prev]);
    setMessage("");

    startTransition(async () => {
      await saveNote(entry.name, entry.message);
    });
  }

  const labelColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";
  const msgColor = isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.74)";
  const nameColor = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.4)";
  const lineColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const accentColor = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.16)";
  const fieldBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const fieldBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
  const quoteColor = isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.88)";

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 relative z-10">
        <span
          className="text-[9px] uppercase tracking-widest font-medium"
          style={{ color: labelColor }}
        >
          guestbook
        </span>
        {entries.length > 0 && (
          <span className="text-[9px] tabular-nums" style={{ color: labelColor }}>
            {entries.length}
          </span>
        )}
      </div>

      {/* Scrolling feed of notes */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar -mr-1.5 pr-1.5 mt-2.5 relative z-10">
        {entries.length > 0 ? (
          <ul className="flex flex-col">
            {entries.map((entry, i) => (
              <li
                key={i}
                className="py-1.5 animate-[fadeIn_0.35s_ease]"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${lineColor}` }}
              >
                <p
                  className="text-[12px] leading-snug tracking-[-0.01em] break-words"
                  style={{ color: msgColor }}
                >
                  <span style={{ color: accentColor }}>“</span>
                  {entry.message}
                  <span style={{ color: accentColor }}>”</span>
                </p>
                <span
                  className="text-[9px] lowercase tracking-wide"
                  style={{ color: nameColor }}
                >
                  — {entry.name}
                </span>
              </li>
            ))}
          </ul>
        ) : loading ? (
          <ul className="flex flex-col gap-2.5" aria-hidden="true">
            {[80, 64, 72].map((w, i) => (
              <li key={i} className="flex flex-col gap-1">
                <span
                  className="skeleton h-2.5 rounded-full"
                  style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                />
                <span
                  className="skeleton h-1.5 w-1/4 rounded-full"
                  style={{ animationDelay: `${i * 120 + 60}ms` }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px] font-medium" style={{ color: nameColor }}>
            no notes yet — say hi 👇
          </p>
        )}
      </div>

      {/* Always-visible composer */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 relative z-10 mt-2 flex items-center gap-2 rounded-lg pl-2.5 pr-1.5 py-1.5"
        style={{ backgroundColor: fieldBg, border: `1px solid ${fieldBorder}` }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="say something nice…"
          maxLength={80}
          className="flex-1 min-w-0 bg-transparent text-[11px] outline-none placeholder:opacity-45"
          style={{ color: quoteColor }}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="name"
          maxLength={20}
          className="w-[46px] shrink-0 bg-transparent text-[10px] text-right outline-none placeholder:opacity-45"
          style={{ color: nameColor }}
        />
        <button
          type="submit"
          disabled={isPending || !message.trim()}
          className="shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-[12px] leading-none transition-opacity hover:opacity-80 disabled:opacity-30"
          style={{ backgroundColor: accentColor, color: quoteColor }}
          aria-label="Sign guestbook"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
