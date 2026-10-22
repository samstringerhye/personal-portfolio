# Case study structure

Use this structure for the portfolio’s case studies. Keep the reading order and component rhythm consistent; choose gallery headings and visuals for the specific project. Aim for a short, scannable story whose headings and captions carry the argument.

## Page rhythm

1. **Hero**: outcome-led title when verified evidence supports one. Otherwise, name the project and contribution without implying impact. Add a one-sentence scope and role tagline, year range, and representative image.
2. **Story block**: client, role, agency, dates, scope, then the documented project result or status, problem, key decision, and your contribution.
3. **Evidence galleries**: usually three to five sections. Give each a decision-led heading and pair the claim with the screen, iteration, or artifact that supports it. Captions should explain what the visual demonstrates.
4. **Closing prose block**: report user or business impact only when evidence supports it, with source and attribution. Separate this from project scale and delivery milestones. Add a specific lesson only when it reflects the designer’s actual learning.

Use `Story`, `Gallery`, `Panel`, and `ProseGroup`. Keep the coverage model consistent while adapting section names, order, and visual rhythm to the project. Do not force every project into the same sequence or number of galleries.

## Text and visual pairing

Every substantive narrative block needs relevant supporting imagery. Pair paragraphs with a screen, iteration, component view, or diagram that supports their claims. Do not end a study with multiple prose-only sections. Draft the point first, then choose the visual; use fresh Figma exports for Samsung. Keep captions with their images. The compact opening summary, outcomes bar, and single final statement are exceptions to this pairing rule.

Make the supporting image visually legible at a glance. Prefer actual screens, enlarged components, state comparisons, and composed visual details over specification tables or screenshots of documentation. An image full of text still makes the reader read. Keep technical reference material out of the main visual narrative unless its content is the point.

End with the last visual evidence section and one final statement. Include an outcomes bar only when verified user or business KPIs exist, with a source, timeframe, baseline or comparator, and attribution limits. Omit the outcomes section when that evidence is unavailable. Do not substitute a **Design outcomes** bar. Deliverable counts, page/template counts, launch dates, handoffs, rollout scale, component changes, and design features belong in scope, process, or solution sections; they are not outcomes.

## Shared spacing system

Spacing values live in `sys.layout.caseStudy` in `src/data/tokens.json`. `BaseLayout.astro` emits the CSS properties through the existing fluid token generator. Values interpolate between 400px and 1200px viewport widths and stay within their minimum and maximum outside that range.

| Token | Range | Owner and purpose |
| --- | --- | --- |
| `sectionGap` | 80–128px | The content grid separates sections. The page grid uses the same gap between the article, contact callout, and project navigation. |
| `heroGap` | 48–80px | The article separates the hero from the content. |
| `summaryGap` | Alias of `sectionGap` | The Story grid uses the same section gap between project facts and the opening statement when they stack. |
| `blockGap` | 32–48px | Components separate their major internal blocks, including gallery copy and images. |
| `headingGap` | 24–32px | Components separate a heading from its copy when stacked. |
| `paragraphGap` | 24px | Prose groups and multi-paragraph gallery notes separate paragraphs. |
| `captionGap` | 16px | Panels separate their artwork and captions. |
| `labelGap` | 8px | Summary labels sit above their text. |
| `calloutInset` | 40–64px | The contact callout owns its internal padding. |

The template has three grid levels: `case-study-layout` owns the article/callout/navigation gap, `case-study-body` owns the hero/content gap, and `case-study-content` owns the section gaps. Sections do not add outer top or bottom margins. The article has no bottom spacer. This keeps the last prose section the same distance from the callout as other sections are from one another.

Section headings always precede their copy, including on desktop. Keep prose within the shared reading measure. Breakpoints can change metadata and image-grid columns without changing the spacing scale. Preserve distinct roles when adjusting tokens: a paragraph gap should not become a section gap. Artwork padding, device framing, and navigation clearance belong to their visual or functional components; they do not set distances between sections.

### Spacing ownership

- Use the parent grid or flex container’s `gap` to separate repeated children. Do not add child margins to the same boundary.
- Use padding for space inside a surface or control. Keep section spacing outside those components under the template’s control.
- Keep ordinary prose in paragraph groups so the final paragraph adds no trailing margin.
- Use bounded fluid tokens across breakpoints; change columns without introducing a separate spacing scale.
- Keep the Samsung device-stage overlap as an artwork composition adjustment. It does not control section spacing.

This follows [Ahmad Shadeed’s spacing guidance](https://ishadeed.com/article/spacing-in-css/#css-grid-gap). Its 2020 flex-gap support warning is historical; [MDN documents gap for current grid and flex containers](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/gap).

## Seven-part story checklist

Use these questions to check the narrative. Several can share a section when that keeps the page concise.

1. **Problem and hypothesis**: What did the team need to change? What evidence shaped the problem? State what you know and where the evidence came from.
2. **Role and collaboration**: What did you make or decide? What did the team, client, product, research, or engineering partners do?
3. **Solution and decision**: Which design choice mattered most? Why did it fit the evidence and constraints?
4. **How the solution addresses the problem**: Show the relevant flow, page, state, or component. Explain what becomes clearer or possible.
5. **Challenges and iteration**: Show the constraint, draft, test, or trade-off that changed the work. If no artifact exists, explain the constraint briefly and factually.
6. **Impact and attribution**: Report a sourced user or business effect when one exists. Separate project-level results and rollout scale from your contribution. If no attributable impact evidence exists, state the evidence gap and report your deliverables separately. A handoff is a milestone, not an outcome.
7. **Learning**: End with one specific lesson the designer can stand behind. Leave this part out when no confirmed lesson is available.

## Suggested MDX pattern

```mdx
<Story
  client="[Client]"
  role="[Your title]"
  agency="[Agency]"
  year="[Year or range]"
  made={['[Specific deliverable]', '[Decision or area you shaped]']}
  outcome="[Sourced project or user result first when available. Otherwise state the documented project status and any impact evidence gap without implying the milestone is user or business impact.]"
  problem="[User or business problem, source of evidence, and relevant constraint.]"
  decision="[Choice you made and why it fit the evidence.]"
  did="[Your contribution and how it fit the team’s work.]"
/>

<Gallery title="[Decision or work area]" note="[Finding or constraint, your response, and why it mattered.]">
  <Panel kind="page" src={screen} alt="[What the image shows]" caption="[What this visual proves about the decision.]" />
</Gallery>

<ProseGroup>
## Impact and attribution

[State the measured user or business result, with its source and timeframe. Separate program results and rollout scale from your contribution. If no impact can be tied to the work, say so briefly. Keep handoff under delivery or contribution, not impact.]

## What I learned

[One specific, reusable lesson grounded in this project.]
</ProseGroup>
```

## Writing and evidence rules

- Write for scanning: use decision-led headings, short paragraphs, and put the main point first. NN/g recommends concise, objective web copy with information front-loaded in headings and paragraphs.
- Write in plain language. Prefer an ownership verb that matches your actual role: designed, built, adapted, organized, or handed off.
- Separate your work from team findings and outcomes. Credit collaborators by function when names are unavailable or unnecessary.
- Caption every visual so the captions alone still explain the sequence. Alt text describes the image; captions explain why it matters.
- Use only numbers with a source and timeframe. A program-wide metric is not an individual impact metric.
- Describe constraints through the design response. Do not list work you did not do unless that boundary prevents a likely misunderstanding.
- Keep early concepts distinct from approved or implemented designs. Label pitch work and explorations accurately.
- Keep confidentiality and client-disclosure limits in mind before adding internal artifacts.

## NN/g references

- [5 Steps to Creating a UX-Design Portfolio](https://www.nngroup.com/articles/ux-design-portfolios/): select projects deliberately, explain the role and process, show artifacts, and make the portfolio scannable.
- [Be Succinct! (Writing for the Web)](https://www.nngroup.com/articles/be-succinct-writing-for-the-web/): use concise text, descriptive headings, and an inverted-pyramid structure.
- [How People Read Online: New and Old Findings](https://www.nngroup.com/articles/how-people-read-online/): readers scan; front-load information and use clear section headings.
