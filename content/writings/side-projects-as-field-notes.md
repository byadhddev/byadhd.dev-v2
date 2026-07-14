---
title: "Side projects as field notes"
description: "I use small projects to make curiosity concrete, leave evidence of what I learned, and find the next question."
date: 2026-04-04
category: life
tags:
  - reflection
  - learning
  - craft
featured: false
redacted: false
---

My projects rarely begin with a market category. They begin with a question I cannot leave alone.

Can a browser canvas feel physical? Can several agents make red-team work easier to inspect? Can a link page have a point of view? Can a useful developer tool discover its own instructions and still remain understandable?

The question is vague until I build it. Then it acquires edges: an interaction has latency, a model has a context limit, a layout fails on a narrow screen, a clever architecture becomes annoying to operate. Shipping is how curiosity meets resistance.

## Canvas: learning through motion

[Canvas](https://minis.byadhd.dev/canvas) started with particle physics and direct manipulation. It is the kind of project where the difference between "works" and "feels right" lives in small feedback loops: pointer velocity, damping, collision response, frame timing, and whether motion communicates cause.

It changed how I look at interface polish. A visual effect is not valuable because it moves. It is valuable when the motion helps the user predict the system. That lesson carries into ordinary product work: state changes need continuity, controls need immediate feedback, and animation should explain rather than decorate.

## AI Red Team Swarm: making parallel work inspectable

[AI Red Team Swarm](https://airedteam.byadhd.dev/) asks a different question: what happens when LLM security testing is split across specialized agents?

The exciting part is parallel exploration. The engineering problem is coordination. If several agents propose attacks without shared evidence, the output becomes a pile of plausible text. A useful system needs visible roles, scoped tasks, deduplication, traceable findings, and a way to distinguish an observed response from a model's hypothesis.

That project made me more skeptical of agent counts as a measure of sophistication. More workers can increase coverage, but only if the system makes their claims inspectable and combines them into a coherent result.

## Vibeloper: constraints reveal taste

[Vibeloper](https://minis.byadhd.dev/vibeloper) is a small link-in-bio experiment. Small surfaces are surprisingly unforgiving. There is nowhere for weak hierarchy or generic styling to hide; a few type sizes, spacing decisions, and interactions carry the whole identity.

Building it reminded me that constraints do not reduce design. They concentrate it. A tiny project can be the best place to test a visual idea because changing direction is cheap and every decision remains visible.

## toskill: tools as accumulated memory

[toskill](https://github.com/byadhddev/toskill) turns articles into reusable AI skills through extraction, curation, and building agents. It began as automation, but the lasting question became one of memory: how can knowledge survive the conversation that produced it?

The answer was not to ask for a better final response. It was to preserve intermediate artifacts: source articles, curated knowledge bases, and skill references. That architecture changed how I think about AI software. Durable files and explicit phases often matter more than increasingly elaborate prompts.

## What counts as finished

Not every side project needs users, revenue, or a roadmap. I call one successful when it leaves at least one of these behind:

- a working object I can return to;
- a technical pattern I now understand from the inside;
- a sharper opinion about an interface or architecture;
- a public artifact that lets someone else inspect the idea;
- a clearer next question.

This is why abandoned projects do not feel entirely abandoned to me. Their code may stop, but they record where my attention went and what reality taught me there.

## The practice

I try to keep the loop simple:

1. Start with a question specific enough to build around.
2. Make the smallest version that can resist the idea.
3. Use it long enough to notice what the original question missed.
4. Publish the useful part: the tool, source, writeup, or lesson.
5. Let that result choose the next experiment.

The public collection lives across [my GitHub profile](https://github.com/byadhddev) and the projects linked above. Together they are less a product portfolio than a dated set of field notes in software, security, and design.
