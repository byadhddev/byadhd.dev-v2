import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { writings } from "../../../.velite";
import { WritingsHeader } from "@/components/writings-header";
import {
  CATEGORIES,
  PROFILE_CONTEXT,
  formatWritingDate,
  getCategoryLabel,
  isWritingCategory,
} from "./writing-data";

export const metadata: Metadata = {
  title: "Writings",
  description:
    "Notes by Jagadesh Ronanki on application security, smart-contract audits, building software, and life.",
  alternates: { canonical: "/writings" },
};

interface WritingsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function WritingsPage({ searchParams }: WritingsPageProps) {
  const { category } = await searchParams;
  const selectedCategory = isWritingCategory(category) ? category : "all";
  const profile = PROFILE_CONTEXT[selectedCategory];
  const filteredWritings =
    selectedCategory === "all"
      ? writings
      : writings.filter((writing) => writing.category === selectedCategory);

  return (
    <main className="writings-page min-h-dvh px-4 py-5 sm:px-7 sm:py-7 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <WritingsHeader backHref="/" />

        <section className="grid gap-7 pb-12 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14 lg:pb-16">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/35 dark:text-white/35">
              Field notes / 2022-present
            </p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2.5rem,7vw,5.5rem)] font-light leading-[0.92] tracking-[-0.045em] text-black/88 dark:text-white/92">
              Things I learned by looking closer.
            </h1>
            <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-black/50 dark:text-white/50 sm:text-[15px]">
              Security findings, audit patterns, build logs, and personal notes. Sensitive source material is edited to keep the lesson without publishing private details.
            </p>
          </div>

          <aside className="self-end border-l border-black/8 pl-5 dark:border-white/9 lg:mb-1">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35 dark:text-white/35">
              {profile.eyebrow}
            </p>
            <h2 className="mt-3 text-lg font-medium tracking-tight text-black/80 dark:text-white/85">
              {profile.title}
            </h2>
            <p className="mt-3 text-xs font-light leading-6 text-black/48 dark:text-white/48">
              {profile.description}
            </p>
            <ul className="mt-4 space-y-1.5 text-[10px] uppercase tracking-[0.12em] text-black/35 dark:text-white/35">
              {profile.details.map((detail) => (
                <li key={detail.label}>
                  {detail.href ? (
                    <Link
                      href={detail.href}
                      target={detail.href.startsWith("http") ? "_blank" : undefined}
                      rel={detail.href.startsWith("http") ? "noreferrer" : undefined}
                      className="underline decoration-black/15 underline-offset-4 transition-colors hover:text-black/65 focus-visible:text-black/65 dark:decoration-white/20 dark:hover:text-white/70 dark:focus-visible:text-white/70"
                    >
                      {detail.label}
                    </Link>
                  ) : (
                    detail.label
                  )}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <nav aria-label="Filter writings" className="border-y border-black/7 py-3 dark:border-white/8">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((item) => {
              const isSelected = item.value === selectedCategory;
              const href = item.value === "all" ? "/writings" : `/writings?category=${item.value}`;
              return (
                <Link
                  key={item.value}
                  href={href}
                  aria-current={isSelected ? "page" : undefined}
                  className={`shrink-0 rounded-md px-3 py-2 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors ${
                    isSelected
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-black/42 hover:bg-black/4.5 hover:text-black/70 dark:text-white/42 dark:hover:bg-white/6 dark:hover:text-white/70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <section className="pb-20 pt-4" aria-label={`${profile.title} writings`}>
          <div className="mb-4 flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.18em] text-black/30 dark:text-white/30">
            <span>{filteredWritings.length} notes</span>
            <span>Newest first</span>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {filteredWritings.map((writing, index) => (
              <Link
                key={writing.slug}
                href={`/writings/${writing.slug}`}
                className="writing-card group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-xl border border-black/7 bg-black/2.5 p-5 transition-colors duration-300 hover:bg-black/4.5 dark:border-white/8 dark:bg-white/3.5 dark:hover:bg-white/6 sm:p-6"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35 dark:text-white/35">
                      {getCategoryLabel(writing.category)}
                    </span>
                    <ArrowUpRight
                      size={15}
                      weight="light"
                      className="text-black/30 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-white/30"
                    />
                  </div>
                  <h2 className="mt-8 max-w-md text-2xl font-light leading-tight tracking-[-0.035em] text-black/80 dark:text-white/85 sm:text-[1.7rem]">
                    {writing.title}
                  </h2>
                  <p className="mt-3 max-w-lg text-xs font-light leading-6 text-black/45 dark:text-white/45">
                    {writing.description}
                  </p>
                </div>

                <div className="mt-8 flex items-end justify-between gap-4">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {writing.tags.map((tag) => (
                      <span key={tag} className="text-[9px] uppercase tracking-[0.12em] text-black/30 dark:text-white/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-[9px] uppercase tracking-[0.12em] text-black/30 dark:text-white/30">
                    {writing.redacted && <ShieldCheck size={12} weight="light" aria-label="Redacted" />}
                    <time dateTime={writing.date}>{formatWritingDate(writing.date)}</time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
