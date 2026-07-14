---
title: "Building tools that discover tools"
description: "Notes from designing an agent pipeline that turns source material into reusable skills without hardcoding every integration."
date: 2026-06-18
category: building
tags:
  - agents
  - go
  - developer tools
featured: true
redacted: false
---

I built [toskill](https://github.com/byadhddev/toskill) around a small question: can an agent discover the capabilities it needs, use them, and leave behind something another agent can reuse?

Give the CLI an article, tutorial, research paper, or documentation URL. It runs three agents in sequence and produces a distributable AI skill instead of another one-off conversation.

```bash
go install github.com/byadhddev/toskill/cmd/toskill@latest
toskill run https://example.com/an-article
toskill status
```

The project is written in Go using the [GitHub Copilot SDK](https://github.com/github/copilot-sdk), [huh](https://github.com/charmbracelet/huh) for terminal forms, and the open skill ecosystem at [skills.sh](https://skills.sh/).

## The three-agent pipeline

```text
toskill run <urls>
    |
    +-- Content Extractor
    |     find skill -> load browser instructions -> extract -> save article
    |
    +-- Knowledge Curator
    |     inspect articles -> detect domain -> merge or create knowledge base
    |
    +-- Skill Builder
          load skill-authoring guidance -> package SKILL.md + references
```

The **extractor** discovers the browser automation skill at runtime, loads its instructions, and captures the page as structured Markdown. The **curator** reads that artifact, detects the domain, and builds or updates a knowledge base without throwing away code examples and technical detail. The **builder** turns the knowledge base into a skill with progressive disclosure: the operational quick reference stays in `SKILL.md`, while deeper material moves into `references/`.

All three run in-process inside one binary. There are no separate agent services to deploy or subprocess orchestration layers to debug.

## Why I kept the phases separate

The tempting first implementation was one large prompt: read this URL and write a skill. It produces something quickly, but when the result is wrong there is no clean answer to *where* it became wrong.

Three phases leave inspectable artifacts:

```text
skill-store/
|-- articles/
|   `-- example-com-an-article.md
|-- knowledge-bases/
|   `-- web-security/
|       `-- KB.md
`-- skills/
    `-- web-security/
        |-- SKILL.md
        `-- references/
            |-- techniques.md
            `-- hardening-guide.md
```

If extraction omitted a code block, I can fix extraction. If facts are present but organized poorly, the curator owns that failure. If the knowledge is good but the skill triggers badly or loads too much context, the builder is the boundary to change.

The artifacts can live locally or be committed to a GitHub repository after every phase. That makes the pipeline behave more like a build system: source, intermediate representation, package.

## Discovery instead of an integration switchboard

I did not want the core orchestrator to know how to browse every kind of source or hand-author every skill format. The agents receive a small set of tools such as `find_skill`, `install_skill`, and `load_skill`. They search the open ecosystem for domain instructions when the task requires them.

```text
Extractor tools: find_skill, install_skill, load_skill, run_command, save_result
Curator tools:   read_article, list_knowledge_bases, write_knowledge_base
Builder tools:   find_skill, load_skill, read_knowledge_base, write_skill
```

That decision keeps the binary's stable core small. A better browser skill or a new domain guide can improve behavior without adding another hardcoded branch to the pipeline.

It also introduces a trust question. Discovered instructions are executable influence, so discovery cannot mean blindly running arbitrary text. The practical boundary is to keep tools narrow, show what was loaded, limit filesystem scope, and preserve each phase's output for review.

## Models are a phase decision

Extraction rewards speed and fidelity. Curation needs enough judgment to separate durable knowledge from article structure. Building needs strong instruction design. Treating "the model" as one global choice leaves cost and quality on the table.

```bash
toskill run \
  --extract-model claude-haiku-4.5 \
  --curate-model claude-sonnet-4.5 \
  --build-model claude-opus-4.6 \
  https://example.com/an-article
```

Those names are examples, not a fixed recommendation. The design point is that model selection follows the work performed by each phase. The CLI loads available models from the connected backend and lets the same selection happen in the interactive wizard.

## Authentication without making setup the product

The default mode asks the SDK to manage the Copilot CLI process and reuse existing credentials:

```bash
toskill run https://example.com/an-article
```

For headless environments it can connect to an external CLI server, read a GitHub token from the environment, or use BYOK providers. I added these paths because developer tools often fail before their real feature begins: users spend their time translating authentication state between CLIs.

The useful rule became: detect existing authenticated tools first, make the chosen method explicit, and never require a token to be pasted into an interactive screen when the local environment already knows it.

## Evolution was the harder problem

Creating a skill once is easy compared with adding a second source without erasing what the skill already knows. Evolution mode reads the existing `SKILL.md` and references, merges a new knowledge base, preserves prior content, and records what changed.

```bash
toskill run --evolve \
  --skill-name web-security \
  https://example.com/new-research
```

I do not think "never removes" is the final version of knowledge maintenance; stale guidance eventually needs deliberate replacement. It is, however, a safer first contract than silently rewriting an existing skill from the latest article.

## What building it changed for me

The difficult part of agent tooling is not getting a model to call a command. It is making transformation legible:

- Which source produced this claim?
- Which phase compressed or reorganized it?
- Which skill instructions influenced the agent?
- What changed during evolution?
- Can a person resume from the last good artifact instead of rerunning everything?

The more autonomous the runtime becomes, the more ordinary its engineering needs to feel: typed configuration, constrained tools, explicit intermediate files, resumable stages, and logs that explain decisions. The magic belongs in what the user can accomplish, not in hiding how the system arrived there.

The repository, install instructions, releases, and development setup are public at [github.com/byadhddev/toskill](https://github.com/byadhddev/toskill).
