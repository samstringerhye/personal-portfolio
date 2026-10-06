# AGENTS.md

## Copy & Writing Rules

Voice: Direct, specific, earned. No adjectives that don't carry weight.
Never: "seamlessly," "robust," "innovative," "streamlined," "leveraged," "elevated"
Never: em dashes, passive voice, throat-clearing intros
Never: AI tell phrases — "delve," "nuanced," "holistic," "at its core," "it's worth noting"

Case study structure: Problem → constraint → decision → outcome. Lead with the outcome.
Metrics: Include real ones or omit. Never fudge with "significantly improved."

When writing copy, read it back as if you're a skeptical creative director who's seen 500 portfolios.

---

## How to Work

**Favor rebuilding over patching.** If something isn't working after a couple of attempts, say so and propose a different approach rather than accumulating workarounds.

**Nothing is locked in.** This project is in active prototyping. If a different library, framework, or approach would be a better fit, recommend it.

**Use your tools.** You have MCP servers, skills, and agents available — lean on them rather than coding from memory. Look things up before implementing. Check what's already in the project before adding new dependencies.

**This is a designer's portfolio.** The quality bar is high. Give honest feedback when something doesn't look right — I'd rather hear it early. Respect `prefers-reduced-motion`.

**Ask before making large structural changes.** Refactors, new dependencies, file reorganization — check first. Don't delete or overwrite files without confirming.

***Completion Check*** When asked to audit or check consistency across the codebase, always: (1) list every file you will check before starting, (2) process each file completely, (3) output a summary table of all elements checked with pass/fail status, (4) explicitly confirm "audit complete — checked X elements across Y files" when done. 

---

## Project Overview

Portfolio site for Sam Stringer-Hye, an Associate Design Director at Razorfish (13+ years experience). The project is in an **active prototyping/pre-build phase** — content has been extracted from an existing Squarespace site, and a new custom-built site is being developed with interactive prototypes.

## Case Studies

| Project | Client | Role | Year |
| --- | --- | --- | --- |
| Amica.com Design System | Amica | Assoc. Design Director | 2026 |
| Samsung Bespoke Design Studio | Samsung | Assoc. Design Director | 2024 |
| MyFrontier App Redesign | Frontier | Assoc. Design Director | 2022 |
| Samsung.com Redesign | Samsung | Senior Designer | 2020 |
| CVS Shop Website Redesign | CVS | Assoc. Design Director | 2022 |

## Content Conventions

- Markdown files reference images via relative paths: `../images/[filename]`
- Case studies follow a consistent structure: hero image, title, intro paragraph, metadata line (Client / Role / Agency / Year), challenge section, approach/wireframes, outcome with metrics
- Image filenames are derived from Squarespace CDN URL paths with `__` as path separators
- Thumbnail images use `[project]_thumbnail.jpeg` naming with companion `.psd` source files
