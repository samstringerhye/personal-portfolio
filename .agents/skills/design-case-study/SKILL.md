---
name: design-case-study
description: Write or revise a design portfolio case study for this site. Use when drafting a new case study MDX file in src/content/work/, reworking an existing one, or deciding what to show for a project that didn't go to plan. Covers the seven-part structure, how to handle constraints and imperfect process honestly, and the site's frontmatter and components.
---

# Design case study

A case study shows how you worked, not only what shipped. Readers want the problem, your role, the decisions you made and why, what changed, and what you learned.

Lead with the outcome in the title and the `Story` summary. The body then follows the seven-part order below, starting with the problem. The outcome in `Story` is the promise; the body is the proof.

Read `AGENTS.md` (copy rules) and the `Gotchas` section of `CLAUDE.md` before writing. Match the voice of the published studies in `src/content/work/`. `amica-design-system.mdx` is the current reference.

## Structure

Every study covers these seven parts. Keep the order. Headings can be the site's own components (`Story`, `Gallery`, `Metrics`) rather than markdown sections.

1. **Problem and hypothesis.** What you saw in users, data, or stakeholder requests. What the stakeholders asked for. Where what people said differed from what you observed. How you framed the problem before designing.
2. **Your role and collaboration.** What you owned versus what the team owned. Who you worked with and how. Facilitation, reviews, and how your work fit into engineering and product. Name the team size and your part in it.
3. **Solution and the decision.** The pretty pictures: screens, flows, components. Then the reasoning. Explain why this option won over the others you considered. Show rejected directions if they taught something.
4. **How the solution solves the problem.** What a user can do now that they couldn't before. Tie each claim to the problem from part 1.
5. **Challenges and the messy middle.** Sketches, journey maps, workshop photos, test results, and the constraints that forced trade-offs. This is the proof of process. Unfinished is fine here.
6. **Impact.** Users and business effect, in real numbers. If no numbers exist, say what you could observe and do not invent a figure.
7. **What you learned.** For you, and for the team's next project of this kind. Be specific: one or two lessons, not a list of platitudes.

## Constraints and imperfect projects

Most real projects were not done correctly. Readers expect trade-offs; a perfect story reads as fiction, and experienced reviewers spot it quickly. Write the project as it happened:

- **Name the constraint, then your response.** "Engineering had already built the old flow, so I scoped the change to the checkout step" beats "the process was broken."
- **Show what you pushed for and what happened.** If your recommendation lost, say what it was and what it would have solved. Keep it factual and without blame toward named people.
- **Show research you could do.** Even without access to users, comps, analytics, support tickets, and competitor flows count. Say what you would have done with the access you wanted.
- **Do not fabricate process or results.** Do not show research that did not happen, and do not present a rejected design as the one that shipped. If a "what I'd do differently" section helps, label it as hindsight.
- **Keep it to the work you own.** Leave out venting, personal conflict, and anything you wouldn't say in an interview.
- **Check confidentiality.** Before writing about NDA work, confirm what the agreement allows. If it doesn't allow detail, use process and decisions without client specifics, or leave the project out.

## Metrics

- Use real numbers from the project, with their source and timeframe available if asked.
- Record a baseline before the change and reuse the same measure afterwards. Report per-task results, not only averages.
- Be candid about attribution. If a revenue or usage gain can't be isolated from other changes, say so and present analytics as supporting evidence.
- Use a metric a non-expert can explain. If it needs a footnote to be honest, add the footnote.
- If there is no number, omit the metric. Name the qualitative effect instead (clearer hierarchy, fewer steps), backed by quotes or annotated before/after screens. Never write "significantly improved" or "much faster".
- Tie the number to the decision it supports. A 59% lift means little without the test it came from.

## Guidance from the reference sources

Twenty-four sources were reviewed (verdicts and notes in `references/sources.md`). Where they agree, the skill follows them:

- **Choose three to five projects.** Pick the ones that show the work you want next. Cut any that no longer reflect your skills.
- **Keep the read short.** A starting point is roughly 600 to 900 words, with the images carrying part of the story. Cut words before cutting substance.
- **Make captions stand alone.** A reader who only reads captions should still follow the project.
- **Credit your role explicitly.** Name what you did, your collaborators, and the team's shape.
- **Show the messy middle.** Include early drafts, abandoned ideas, and unselected concepts. Final screens alone don't show thinking.
- **Organize around decisions.** Each decision gets the options considered and the trade-off accepted, not a list of phases.
- **Include a "what works" note** when you critique a product or a design. Balance keeps the critique credible.
- **Name the constraints** (budget, staffing, deadlines, phased rollout) and say what is still unfinished.
- **Write for the skimmer.** Descriptive headings work as a track. Open each section with its claim.
- **Validate method when relevant.** One line on a pilot session or practice run shows the study was tested, if the case study is about research.
- **Anonymize NDA work.** Focus on process over proprietary detail, and say what was withheld.

Two of the sources recommend outcome-led titles (Opendoors, UXfolio). Most use topic titles. Use an outcome-led title here, which matches the site's rule to lead with the outcome.

## Copy rules (from AGENTS.md)

- Direct, specific, earned. Cut adjectives that don't carry weight.
- Never use: "seamlessly," "robust," "innovative," "streamlined," "leveraged," "elevated," "delve," "nuanced," "holistic," "at its core," "it's worth noting."
- No em dashes. Use a period, a colon, or parentheses.
- Avoid passive voice. Say who did what: "I cut the card to two questions," not "the card was reduced."
- No throat-clearing intros. Start with the outcome or the problem.
- Read the copy back as a skeptical creative director who has seen 500 portfolios. Cut anything that could appear in any other portfolio.

## Writing for this site

Files are MDX in `src/content/work/<slug>.mdx`, validated by `src/content.config.ts`. Images live in `src/assets/work/<slug>/` and are imported, not linked by path.

Frontmatter fields:

- Required: `title`, `client`, `year`, `role`, `agency`, `tagline`, `thumbnail`, `heroImage`, `heroImageAlt`.
- Optional: `thumbnailAlt`, `thumbnailLayers`, `thumbnailScene`, `thumbnailText`, `tags`, `featured`, `sortOrder`, `unlisted`, `passwordProtected`, `yearLabel`.
- `tagline` is one sentence with the scope and a concrete fact.
- `heroImageAlt` and `thumbnailAlt` describe the image for a screen reader. They are not captions.

Components (import from `../../components/`):

- `Story`: the opening summary. Props: `client`, `role`, `agency`, `year`, `made` (array of what you owned), `outcome` (lead with it), `problem`, `did`.
- `Gallery`: a titled section with an optional `note`. Holds `Panel` children.
- `Panel`: one visual. `kind` is `screens`, `page`, `piece`, `bleed`, `video`, or `slot` (see `src/components/Panel.astro`). Props include `src`, `alt`, `screens` (for `kind="screens"`), `span` (`full` or `half`), `ratio`, `caption`, `multiply`, `tint`, `poster`, and `cover`. Give every image an `alt`. Use `caption` for a short label that stands alone.
- `Metrics`: a row of `{ value, label }` items. Use it only for real numbers.
- `DecisionStepper`: a sequence of decisions, one screen each. Props: `label` (accessible name) and `steps`, each with `label`, `caption`, `image` (imported `ImageMetadata`), and `alt`. Use it when the decision path matters more than a single final screen.

Practical steps:

1. Read the two most recent studies and match their section order and tone.
2. Write the `Story` block first. If you can't fill `outcome` with a real result or a clear role, stop and ask for the missing facts.
3. Draft the seven parts in plain text, then place images.
4. Check every image has an alt and a `ratio` where the component needs one.
5. Run `npx astro check` (expect 0 errors) and `npm run build` before finishing.
6. Do not run `npm run deploy` or `wrangler deploy` unless asked.

## Before you finish

- [ ] Outcome leads the study.
- [ ] Each of the seven parts is present or deliberately left out.
- [ ] Constraints and trade-offs are named, with no invented process.
- [ ] Every number is real and sourced, or removed.
- [ ] No banned words, em dashes, or passive voice.
- [ ] NDA and client-disclosure limits were checked.
- [ ] Images have alt text; `astro check` and `build` pass.
