import Link from "next/link";
import { MorphGrid } from "@/components/morph-grid";

export default function Home() {
  return (
    <main className="min-h-dvh p-3 sm:h-dvh sm:overflow-hidden sm:p-5 lg:p-6">
      {/* Server-rendered content for crawlers and AI assistants that don't run
          JavaScript. Visually hidden, but present in the initial HTML so the
          page's substance (who I am, what I build) is always discoverable. */}
      <section className="sr-only">
        <h1>Jagadesh Ronanki — Full-Stack Software Engineer (byadhd)</h1>
        <p>
          Jagadesh Ronanki, known online as byadhd, is a full-stack software
          engineer based in Andhra Pradesh, India. He builds web experiences,
          projects, and experiments — crafting software that feels distinctly
          his own. Currently a Digital Specialist Engineer at Infosys since
          August 2024, working on Microsoft&apos;s procurement platform.
        </p>

        <h2>Experience</h2>
        <ul>
          <li>
            Digital Specialist Engineer at Infosys (since August 2024) — building
            enterprise web applications with C#, ASP.NET Core, and Angular on
            Azure for Microsoft&apos;s US Modern Procurement platform.
          </li>
        </ul>

        <h2>Projects</h2>
        <ul>
          <li>
            <a href="https://airedteam.byadhd.dev/">AI Red Team Swarm</a> — LLM
            security and AI red teaming.
          </li>
          <li>
            <a href="https://minis.byadhd.dev/canvas">Canvas</a> — particle
            physics playground.
          </li>
          <li>
            <a href="https://minis.byadhd.dev/vibeloper">Vibeloper</a> — a
            link-in-bio tool.
          </li>
        </ul>

        <h2>Tech Stack</h2>
        <p>
          React, TypeScript, Next.js, Python, Node.js, .NET, C#, Docker,
          PostgreSQL, Angular, Azure, Entity Framework Core, and SQL Server.
        </p>

        <h2>Explored</h2>
        <p>
          DeFi, ethical hacking, smart contracts, blockchain, poster design,
          motion design, e-governance, AI red teaming, and freelancing.
        </p>

        <h2>Writings</h2>
        <p>
          <Link href="/writings">Read my field notes</Link> on application security,
          smart-contract audits, building software, and life.
        </p>

        <h2>Links</h2>
        <ul>
          <li><a href="https://x.com/byadhddev">Twitter / X</a></li>
          <li><a href="https://www.linkedin.com/in/jagadesh-ronanki/">LinkedIn</a></li>
          <li><a href="https://github.com/byadhddev">GitHub</a></li>
          <li><a href="https://youtube.com/@byadhddev">YouTube</a></li>
          <li><a href="mailto:jagadesh.ronanki@gmail.com">Email</a></li>
        </ul>
      </section>

      <MorphGrid />
    </main>
  );
}
