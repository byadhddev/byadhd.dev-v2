import type { MetadataRoute } from "next";
import { writings } from "../../.velite";

const SITE_URL = "https://byadhd.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/writings`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...writings.map((writing) => ({
      url: `${SITE_URL}/writings/${writing.slug}`,
      lastModified: new Date(writing.date),
      changeFrequency: "yearly" as const,
      priority: writing.featured ? 0.7 : 0.6,
    })),
  ];
}
