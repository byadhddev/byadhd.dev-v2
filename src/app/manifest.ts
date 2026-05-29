import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jagadesh Ronanki — byadhd",
    short_name: "byadhd",
    description:
      "Jagadesh Ronanki (byadhd) — full-stack software engineer. Portfolio, projects, and experiments.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
  };
}
