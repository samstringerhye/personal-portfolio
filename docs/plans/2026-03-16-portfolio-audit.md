# Portfolio Audit: Consolidated Findings

**Date:** 2026-03-16
**Goal:** Job-search readiness + design cohesion
**Scope:** 10 pages, 35 components, 5 case studies, 2 blog posts, resume, design tokens, visual QA
**Checked:** 161 elements across 65+ files

---

## Critical (7)

These are things a hiring manager or technical interviewer would notice negatively within 30 seconds.

### C1. Colophon lists wrong fonts
**Page:** /colophon | **File:** `src/pages/colophon.astro:22-24`
The Typography section says "**Playfair Display**" and "**DM Sans**." The actual fonts are **Perfectly Nineties** (serif) and **Inter** (sans). A technical interviewer inspecting your font stack would catch this immediately. On a portfolio that claims "every pixel, on purpose," this is a credibility hit.
**Fix:** Update the font names and descriptions to match reality.

### C2. $143M claim in meta descriptions with no supporting evidence
**Files:** `src/pages/index.astro:15`, `src/components/SEO.astro:13`, `src/pages/work/index.astro:36`, `src/pages/resume.astro:21`
"$143M+ in conversion lift" appears in Google search results (meta descriptions) but is never explained or substantiated in any case study. A hiring manager who sees this in search results and then can't find it on the site will assume it's fabricated.
**Fix:** Either add methodology context to the Samsung case study ("contributed to a team effort that generated...") or remove/soften the claim in meta descriptions.

### C3. Resume/case study framing contradiction (Bespoke)
**Files:** `src/pages/resume.astro:33`, `src/content/work/bespoke-design-studio.mdx:59`
Resume says "Led UX and production design" with "research-driven iteration reduced exit rates 14%." The case study says "I owned visual design, not strategy or UX research." A hiring manager reading both pages will catch this contradiction.
**Fix:** Align the framing. If you participated in research-driven iteration, soften the case study disclaimer. If you didn't lead UX research, reframe the resume bullet.

### C4. Resume metrics absent from case studies
**File:** `src/pages/resume.astro` (multiple lines)
The resume lists 9 specific metrics (14% exit rate reduction, 24% add-to-cart increase, 10% conversion lift, 22% autopay sign-ups, 12% conversion increase, etc.) that appear nowhere in the corresponding case studies. A hiring manager reading both will notice the disconnect.
**Fix:** Either add metrics to case study outcome sections (with context), or acknowledge in case studies why metrics aren't shared (NDA, attribution complexity).

### C5. Homepage heading hierarchy
**File:** `src/content/home.json:13`
`bodyTag: "h3"` renders a body paragraph as an `<h3>`. Screen readers announce it as a heading. A Lighthouse audit or accessibility review would flag this.
**Fix:** Change `bodyTag` to `"p"`.

### C6. Contact form removes keyboard focus indicator
**File:** `src/pages/contact.astro:87-91`
`outline: none` on bare `:focus` (not `:focus-visible`) strips the keyboard focus ring from form inputs. WCAG 2.4.7 violation. Bad optics on a design director's portfolio.
**Fix:** Change `:focus` to `:focus-visible`, or keep the box-shadow focus ring alongside the border-color change.

### C7. Mobile footer truncation
**Visual finding:** At 375px viewport, "COLOPHON" truncates to "COLOF" in the footer nav. A mobile user sees broken text.
**Fix:** Reduce footer link font size at mobile breakpoint, or abbreviate to fewer links on small screens.

---

## Should Fix (16)

These break the "intentional and cohesive" impression on closer inspection.

### S1. Colophon omits Three.js; CLAUDE.md incorrectly claims R3F+Drei
**Files:** `src/pages/colophon.astro`, `CLAUDE.md`
The hero uses vanilla Three.js (not React Three Fiber or Drei as CLAUDE.md claims). The colophon doesn't mention Three.js at all. A dev who inspects the hero canvas and then reads the colophon will notice the gap.
**Fix:** Add Three.js to the colophon tech stack. Update CLAUDE.md to say "Three.js (vanilla)" instead of "Three.js + R3F + Drei."

### S2. Rendered resume omits AI skills section
**Files:** `src/pages/resume.astro` vs `src/content/resume/sam-stringer-hye-resume.md`
The markdown resume has three skill categories (Design, Tools, AI & Vibe Coding). The rendered page only shows two (Design, Tools). The AI skills section is silently dropped.
**Fix:** Either render the AI skills section or remove it from the markdown source.

### S3. CVS "What I Learned" restates approach, not a reflection
**File:** `src/content/work/cvs-redesign.mdx`
The closing section restates the system design approach rather than offering genuine reflection. It's the weakest closer of the five case studies.
**Fix:** Rewrite to reflect on what the system design taught you, not what the system does.

### S4. Colophon ends with no exit navigation
**File:** `src/pages/colophon.astro`
The page ends abruptly after the Accessibility paragraph. No link to work, home, or anywhere. A reader who scrolls to the bottom has only the site nav.
**Fix:** Add a "View work" or "Back to home" link at the bottom.

### S5. W3 Award claim unverified
**File:** `src/pages/resume.astro:37`
The W3 Award is mentioned but not linked. If real, link to the W3 Awards listing for verification.
**Fix:** Add the verification link, or note the award year/category.

### S6. Green accent fails contrast
The green accent `#00E676` used elsewhere has only 2.2:1 contrast against the background — fails WCAG AA for any text size.
**Fix:** Darken to ~#00B85C or similar for 4.5:1.

### S7. Hardcoded colors in CaseStudyLayout
**File:** `src/layouts/CaseStudyLayout.astro:269,274`
`background: #fdf8f4` on device phone image pairs and various rgba overlays. These sit outside the token system.
**Fix:** Define `--color-bg-warm` and `--color-overlay` tokens.

### S8. Hardcoded error color
**File:** `src/pages/contact.astro:131`
`color: #F22434` for `.is-error`. Should use a token.
**Fix:** Define `--color-error` token or reference accent-1.

### S9. Duplicated dot indicator styles
**Files:** `src/components/WorkCarousel.astro:321,338-347`, `src/components/Carousel.astro:83-98`
Same dot sizing pattern (`6px`, `8px`, `16px`) duplicated across two components with hardcoded pixel values.
**Fix:** Extract shared dot styles or define dot size tokens.

### S10. Raw 768px breakpoint in JS (4 files)
**Files:** `Nav.astro:399`, `CaseStudyLayout.astro:733`, `hero-canvas.ts:21`, `WorkCarousel.astro:407`
All use `matchMedia('(max-width: 768px)')` instead of sourcing from tokens.
**Fix:** Read breakpoint from a shared constant or CSS custom property.

### S11. Work index thumbnail alt text
**File:** `src/pages/work/index.astro:44-48`
`alt={entry.data.title}` just echoes the project title ("Samsung Bespoke Design Studio") rather than describing what the thumbnail image actually shows.
**Fix:** Add a `thumbnailAlt` field to case study frontmatter, or auto-generate descriptive alt text.

### S12. Lightbox buttons need explicit focus styles
**File:** `src/layouts/CaseStudyLayout.astro`
`.lightbox-close` and `.lightbox-nav` buttons rely on the global focus ring but have backgrounds that may obscure it. No explicit `:focus-visible` style.
**Fix:** Add explicit focus-visible styles to lightbox controls.

### S13. Hardcoded padding on device phone cells
**File:** `src/layouts/CaseStudyLayout.astro:278`
`padding: 2rem 1rem` instead of using spacing tokens.
**Fix:** Use `--space-*` tokens.

### S14. ProseGroup fragile grid-column
**File:** `src/components/ProseGroup.astro`
Defines `grid-column: 2 / 8` with no mobile override of its own. CaseStudyLayout overrides it, but usage outside case studies would break.
**Fix:** Add a mobile-aware fallback within the component.

### S15. British/American spelling inconsistency
**Files:** `samsung-redesign.mdx:55` ("behaviours"), `myfrontier-app.mdx:47` ("prioritised")
All other copy uses American English.
**Fix:** Standardize to American English.

### S16. "13 years" vs "13+ years" inconsistency
**Files:** `home.json`, `resume markdown`, `about.astro`
Minor, but pick one and use it everywhere.

---

## Nice to Have (10)

Polish items that would elevate but aren't embarrassing if missed.

| # | Finding | File(s) |
|---|---------|---------|
| N1 | Nav entrance `translateY(-12px)` could be tokenized | Nav.astro:104,167 |
| N2 | Footer palette colors could come from tokens | Footer.astro:10-14 |
| N3 | Lightbox overlay rgba values could be tokens | CaseStudyLayout.astro:595,710 |
| N4 | Nav SVG hover fill `#ffffff` could use token | Nav.astro:338 |
| N5 | LottiePlayer default maxWidth hardcoded at 200px | LottiePlayer.astro |
| N6 | Device phone `width: 280px` could be a sizing token | CaseStudyLayout.astro:284 |
| N7 | Em dash in blog sign-off | new-blog-who-this.md:10 |
| N8 | Em dashes in WAB alt text attributes | wab-2026.mdx (multiple) |
| N9 | Bespoke wireframe alt texts generic ("Wireframe slide 1") | bespoke-design-studio.mdx |
| N10 | Lottie not mentioned in colophon | colophon.astro |

---

## What's Working Well

These passed clean and demonstrate real attention to detail:

- **Typography:** Zero hardcoded font-sizes; all use typescale tokens or utility classes
- **SEO:** Every page has unique title, description, JSON-LD, canonical URL, sitemap, RSS
- **Links:** All external links have `target="_blank" rel="noopener noreferrer"`, zero dead links
- **Accessibility baseline:** Global `:focus-visible` ring, skip-to-content link, `prefers-reduced-motion` handling throughout, proper ARIA on carousels/nav
- **Content quality:** Zero forbidden words, zero AI-tell phrases, consistent case study structure
- **Token architecture:** Well-structured ref/sys token system, 200+ CSS vars generated from JSON
- **404 page:** Clear exit buttons, on-brand copy ("Just empty pixels")
- **Case study alt text:** All MDX images have descriptive alt text

---

## Priority Action Order

1. **Fix colophon font names** (C1) — 2 minutes, highest embarrassment-to-effort ratio
2. **Fix homepage bodyTag h3 → p** (C5) — 1 minute
3. **Fix contact form focus** (C6) — 5 minutes
4. **Fix mobile footer truncation** (C7) — 10 minutes
5. **Resolve $143M claim** (C2) — decision needed: substantiate, contextualize, or remove
6. **Align resume/case study framing** (C3, C4) — decision needed: which source is the truth?
7. **Fix green accent contrast** (S6) — 5 minutes
8. **Address remaining should-fix items** (S1-S16) — batch these in a cleanup pass

**Audit complete — checked 161 elements across 65+ files.**
