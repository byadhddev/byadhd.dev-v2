import type { MetadataRoute } from "next";

const SITE_URL = "https://byadhd.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow everything (search engines + anything not listed).
      { userAgent: "*", allow: "/" },
      // Explicitly welcome AI assistants so they can read and cite the site.
      { userAgent: "GPTBot", allow: "/" }, // OpenAI / ChatGPT training
      { userAgent: "OAI-SearchBot", allow: "/" }, // ChatGPT Search
      { userAgent: "ChatGPT-User", allow: "/" }, // ChatGPT browsing on demand
      { userAgent: "Google-Extended", allow: "/" }, // Gemini / Bard
      { userAgent: "GoogleOther", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "CCBot", allow: "/" }, // Common Crawl (feeds many LLMs)
      { userAgent: "Bytespider", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
