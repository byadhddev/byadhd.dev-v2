import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { writings } from "../../../../.velite";
import { WritingsHeader } from "@/components/writings-header";
import { formatWritingDate, getCategoryLabel } from "../writing-data";

interface WritingPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return writings.map((writing) => ({ slug: writing.slug }));
}

export async function generateMetadata({ params }: WritingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const writing = writings.find((item) => item.slug === slug);

  if (!writing) return {};

  return {
    title: writing.title,
    description: writing.description,
    alternates: { canonical: `/writings/${writing.slug}` },
    openGraph: {
      type: "article",
      title: writing.title,
      description: writing.description,
      publishedTime: writing.date,
    },
  };
}

export default async function WritingPage({ params }: WritingPageProps) {
  const { slug } = await params;
  const writing = writings.find((item) => item.slug === slug);

  if (!writing) notFound();

  return (
    <main className="writings-page min-h-dvh px-4 py-5 sm:px-7 sm:py-7 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <WritingsHeader backHref="/writings" />

        <article className="pb-24 pt-14 sm:pt-20">
          <header className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] font-medium uppercase tracking-[0.18em] text-black/35 dark:text-white/35">
              <span>{getCategoryLabel(writing.category)}</span>
              <time dateTime={writing.date}>{formatWritingDate(writing.date)}</time>
              <span>{writing.metadata.readingTime} min read</span>
            </div>

            <h1 className="mt-5 text-[clamp(2.5rem,7vw,5.4rem)] font-light leading-[0.96] tracking-[-0.045em] text-black/88 dark:text-white/92">
              {writing.title}
            </h1>
            <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-black/50 dark:text-white/50 sm:text-[15px]">
              {writing.description}
            </p>

            {writing.redacted && (
              <div className="mt-7 flex max-w-2xl items-start gap-3 rounded-lg border border-black/7 bg-black/2.5 p-4 dark:border-white/8 dark:bg-white/3.5">
                <ShieldCheck size={17} weight="light" className="mt-0.5 shrink-0 text-black/45 dark:text-white/45" />
                <p className="text-[11px] font-light leading-5 text-black/45 dark:text-white/45">
                  This article is intentionally redacted. Private identifiers, live endpoints, credentials, exact payloads, and disclosure correspondence are not published.
                </p>
              </div>
            )}
          </header>

          <div className="mx-auto mt-12 grid max-w-5xl gap-10 border-t border-black/7 pt-10 dark:border-white/8 lg:grid-cols-[9rem_minmax(0,42rem)] lg:justify-center">
            <aside className="hidden lg:block">
              <div className="sticky top-8 text-[9px] uppercase tracking-[0.15em] text-black/30 dark:text-white/30">
                <p>{writing.metadata.wordCount} words</p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {writing.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </aside>
            <div className="writing-prose" dangerouslySetInnerHTML={{ __html: writing.content }} />
          </div>

          <footer className="mx-auto mt-16 max-w-3xl border-t border-black/7 pt-6 dark:border-white/8">
            <Link
              href={`/writings?category=${writing.category}`}
              className="group inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-black/40 transition-colors hover:text-black/75 dark:text-white/40 dark:hover:text-white/75"
            >
              <ArrowLeft size={13} weight="light" className="transition-transform group-hover:-translate-x-0.5" />
              More {getCategoryLabel(writing.category).toLowerCase()}
            </Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
