---
name: design-case-study
description: Write or revise a design portfolio case study for this site. Use when drafting a new case study MDX file in src/content/work/, reworking an existing one, choosing which projects to feature, or deciding what to show for a project that didn't go to plan. Covers the seven-part structure, honest handling of constraints, metrics, copy rules, and this site's frontmatter and components.
---

# Design case study

A case study shows how you worked, not only what shipped. A reader should leave knowing the problem, your role, the decisions you made and why, what changed, and what you learned.

Two rules govern the whole piece:

- **The outcome leads.** The title and the `Story` summary state the result. The body is the proof, so it follows the seven-part order below and starts with the problem.
- **Show the process.** Final screens alone don't show how you think. Include the early drafts, rejected concepts, and constraints that shaped the result.

Before writing, read `AGENTS.md` (copy rules) and the `Gotchas` section of `CLAUDE.md`. Match the voice of the published studies in `src/content/work/`. `amica-design-system.mdx` is the current reference. For the sources behind this skill, see `references/sources.md`.

## Choose the projects

- Feature three to five studies. Quality over quantity. Each should show the work you want to do next.
- Cut projects that no longer reflect your skills, even if they were significant.
- Before writing, decide the three things a reader should remember. Check the finished study delivers them.

## Structure

Every study covers these seven parts, in this order. Headings can be the site's components (`Story`, `Gallery`, `Metrics`) rather than markdown sections.

1. **Problem and hypothesis.** What you saw in users, data, or stakeholder requests. What the stakeholders asked for. Where what people said differed from what you observed. How you framed the problem before designing.
2. **Your role and collaboration.** What you owned and what the team owned. Name the collaborators, the team's shape, and how the work fit with engineering and product. Credit your role explicitly. A bare list of names reads as suspicious.
3. **Solution and the decision.** The screens, flows, and components, then the reasoning. Explain why this option won over the others you considered. Show unselected concepts when they show range, described neutrally. Don't write a contentious case against a rejected idea.
4. **How the solution solves the problem.** What a user can do now that they couldn't before. Tie each claim back to the problem in part 1.
5. **Challenges and the messy middle.** Sketches, early drafts, journey maps, workshop photos, test results, and the constraints that forced trade-offs. This is the proof of process. Unfinished is fine here.
6. **Impact.** Users and business effect, in real numbers. Without numbers, name the effect and show it with quotes or annotated before-and-after screens. Don't invent a figure.
7. **What you learned.** For you, and for the team's next project of this kind. One or two specific lessons, not platitudes. Learnings that show real growth belong here. "Learned a new font" doesn't.

Explain what isn't on screen. Describe why the design is the way it is, not what each visible element says.

## Constraints and imperfect projects

Most real projects were not done correctly. Readers expect trade-offs. A flawless story reads as fiction to anyone who has shipped work.

- **Name the constraint, then your response.** "Engineering had already built the old flow, so I scoped the change to the checkout step" beats "the process was broken."
- **Show what you pushed for and what happened.** If your recommendation lost, say what it would have solved. Keep it factual and free of blame toward named people. Leave out any account of a fight. The outcome and the trade-off carry the point.
- **Show the research you could do.** Comps, analytics, support tickets, and competitor flows count when you lacked access to users. Say what you would have done with the access you wanted.
- **Don't fabricate.** Don't show research that didn't happen, and don't present a rejected design as the one that shipped. A "what I'd do differently" section is fine if it's labeled as hindsight.
- **Keep to the work you own.** Leave out venting, personal conflict, and anything you wouldn't say in an interview.
- **Check confidentiality first.** Confirm what any NDA allows before writing about the project. If it allows no detail, use these options: show process photos (whiteboards, sketches, black-and-white wireframes), blur identifying data, or recreate the design with generic branding. Or leave the project out.
- **Student and personal work** can be a case study. Label it as school or personal work, and say which constraints were artificial.

## Metrics and claims

- Use real numbers from the project, with the source and timeframe available if asked.
- Record a baseline before the change. Reuse the same tasks or measure afterwards, and report per-task results, not only averages.
- Be candid about attribution. If a revenue or usage gain can't be separated from other changes, say so. Present the analytics as supporting evidence.
- Use a metric a non-expert can explain. If it needs a footnote to be honest, add the footnote.
- No number? Omit the metric. Never write "significantly improved" or "much faster."
- Tie each number to the decision it supports. A 59% lift means little without the test behind it.
- Cite any market or research statistic you use, link to the original, and show its date.

## Copy rules

Copy rules come from `AGENTS.md`. The sources add the following.

- Direct, specific, earned. Cut adjectives that don't carry weight.
- Never use: "seamlessly," "robust," "innovative," "streamlined," "leveraged," "elevated," "delve," "nuanced," "holistic," "at its core," "it's worth noting."
- No em dashes. Use a period, a colon, or parentheses.
- Avoid passive voice. Say who did what: "I cut the card to two questions," not "the card was reduced."
- No throat-clearing intro. Open with the outcome or the problem.
- **Define versus explain.** "I ran a competitive analysis" defines a method. Say what you looked for, what you found, and how it changed the next decision.
- **Write for the skimmer.** Descriptive headings work as a track. Open each section with its claim. Put the information-carrying words first in headings and captions.
- **Make captions stand alone.** A reader who only reads captions should still follow the project. Every image gets a caption or a sentence of context.
- **Keep the read short.** The sources range from about 600 words to 1,500 words, or a one-to-three-minute read. Start at roughly 600 to 900 words and let the images carry part of the story. Cut words before cutting substance.
- **Sound like you.** Use your own voice, not the client's marketing copy. Avoid acronyms and buzzwords that distance the reader.
- **Think like a magazine feature.** Vary the layout across the study so images, pull quotes, and text break up the reading. Don't image-dump a grid of screens.

## Writing for this site

Files are MDX in `src/content/work/<slug>.mdx`, validated by `src/content.config.ts`. Images live in `src/assets/work/<slug>/` and are imported, not linked by path.

Frontmatter:

- Required: `title`, `client`, `year`, `role`, `agency`, `tagline`, `thumbnail`, `heroImage`, `heroImageAlt`.
- Optional: `thumbnailAlt`, `thumbnailLayers`, `thumbnailScene`, `thumbnailText`, `tags`, `featured`, `sortOrder`, `unlisted`, `passwordProtected`, `yearLabel`.
- `tagline` is one sentence with the scope and a concrete fact.
- `heroImageAlt` and `thumbnailAlt` describe the image for a screen reader. They are not captions.

Components (import from `../../components/`):

- `Story`: the opening summary. Props: `client`, `role`, `agency`, `year`, `made` (array of what you owned), `outcome` (lead with it), `problem`, `did`.
- `Gallery`: a titled section with an optional `note`. Holds `Panel` children.
- `Panel`: one visual. `kind` is `screens`, `page`, `piece`, `bleed`, `video`, or `slot` (see `src/components/Panel.astro`). Props include `src`, `alt`, `screens` (for `kind="screens"`), `span` (`full` or `half`), `ratio`, `caption`, `multiply`, `tint`, `poster`, and `cover`. Give every image an `alt`.
- `Metrics`: a row of `{ value, label }` items. Use it only for real numbers.
- `DecisionStepper`: a sequence of decisions, one screen each. Props: `label` (accessible name) and `steps`, each with `label`, `caption`, `image` (imported `ImageMetadata`), and `alt`. Use it when the decision path matters more than a single final screen.

## Process

1. Read the two most recent studies and match their section order and tone.
2. Draft the text before the layout, in phases, in a plain document. Don't wait until launch. Copy written at launch is rushed.
3. Write the `Story` block. If you can't fill `outcome` with a real result or a clear role, stop and ask for the missing facts.
4. Draft the seven parts. Ask "why" for each decision and answer it in the text.
5. Place images, each with a caption and an alt. Check the `ratio` where the component needs one.
6. Edit for structure, not only spelling. Read it aloud.
7. Get one reader who doesn't know the project to skim it for 30 seconds, then tell you what they remember. They should name the problem, the approach, and the outcome. If they can't, fix the headings and the lead.
8. Run `npx astro check` (expect 0 errors) and `npm run build` before finishing.
9. Don't run `npm run deploy` or `wrangler deploy` unless asked.

## Before you finish

- [ ] The outcome leads the title and `Story`.
- [ ] All seven parts are present, or left out on purpose.
- [ ] Constraints and trade-offs are named. No invented process.
- [ ] Every number is real and sourced, or removed. Statistics have a link and a date.
- [ ] No banned words, em dashes, or passive voice.
- [ ] NDA and client-disclosure limits were checked.
- [ ] A 30-second skim names the problem, the approach, and the outcome.
- [ ] Every image has an alt and a caption that stands alone.
- [ ] `astro check` and `build` pass.
