import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const SITE_URL = "https://byadhd.dev";
const NAME = "Jagadesh Ronanki";
const DESCRIPTION =
  "Jagadesh Ronanki (byadhd) — full-stack software engineer crafting web experiences, projects, and experiments. Explore my work, writing, and what I'm building now.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${NAME} — byadhd`,
    template: "%s · byadhd",
  },
  description: DESCRIPTION,
  applicationName: "byadhd",
  keywords: [
    "Jagadesh Ronanki",
    "byadhd",
    "software engineer",
    "full-stack developer",
    "web developer",
    "portfolio",
    "Next.js",
    "TypeScript",
    "React",
  ],
  authors: [{ name: NAME, url: SITE_URL }],
  creator: NAME,
  publisher: NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "byadhd",
    title: `${NAME} — byadhd`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAME} — byadhd`,
    description: DESCRIPTION,
    creator: "@byadhddev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: NAME,
  alternateName: "byadhd",
  url: SITE_URL,
  jobTitle: "Software Engineer",
  email: "mailto:jagadesh.ronanki@gmail.com",
  sameAs: [
    "https://x.com/byadhddev",
    "https://www.linkedin.com/in/jagadesh-ronanki/",
    "https://github.com/byadhddev",
    "https://youtube.com/@byadhddev",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.theme==='dark'||(!('theme' in localStorage)&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
