import { defineCollection, defineConfig, s } from "velite";

const writings = defineCollection({
  name: "Writing",
  pattern: "writings/**/*.md",
  schema: s.object({
    title: s.string().max(100),
    slug: s.path().transform((path) => path.split("/").at(-1) ?? path),
    description: s.string().max(220),
    date: s.isodate(),
    category: s.enum(["security", "smart-contracts", "building", "life"]),
    tags: s.array(s.string()).max(5),
    featured: s.boolean().default(false),
    redacted: s.boolean().default(false),
    content: s.markdown(),
    metadata: s.metadata(),
  }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    clean: true,
  },
  collections: { writings },
  prepare({ writings }) {
    writings.sort((left, right) => right.date.localeCompare(left.date));
  },
});
