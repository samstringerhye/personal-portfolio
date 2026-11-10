---
title: Indexing a design system
description: How I used Claude Code to index 314,000 Figma nodes into a database and fix a design library without burning a team's time on mechanical rebinding.
publishedDate: 2026-08-11
tags: ["Design Systems", "AI", "Figma", "Tooling"]
---

I inherited a Figma workspace with 314,000 nodes across 37 pages. Somewhere inside it were 3,044 references to components that no longer lived in the library, 61 component masters that were dead, and hundreds of hardcoded colors that should have been bound to styles. I had six designers and a production schedule that didn't stop for cleanup. There was no version of this that got fixed by hand.

This is the tooling story behind that fix: how I indexed the workspace, what the audit actually found once I looked closely, and the remediation method that got references down to single digits without anyone losing a week to mechanical rebinding.

## Why hand-migration wasn't an option

314,000 nodes is not a number a person audits by scrolling. Even if you could review one node every three seconds, that's over 250 hours of looking, and looking isn't fixing. Every fix that touches a shared component cascades to its instances, and every cascade has to be checked, because Figma will happily let a rebind produce a visually identical result in one place and a broken one in another. Manual migration doesn't scale to that surface area, and it doesn't scale to a team that's also supposed to be designing pages.

So I treated it as a data problem before I treated it as a design problem. If I couldn't query the library, I couldn't reason about it, and if I couldn't reason about it, I was going to fix things by feel, which is how you end up with a library that drifts again in six months.

## Getting Figma into a database

I built an indexing pipeline that walked the file over the Chrome DevTools Protocol into Figma's Plugin API and wrote everything into SQLite: every node, every component instance, every variable binding, every color style, every reference to something outside the library. Once that existed as rows in a table, questions that were unanswerable by eye became a query. How many instances point at a master that no longer exists? Which color styles are unbound? Which components have light and dark mode out of sync? All of that came back in seconds instead of days.

The database is also what made the benchmark work possible. I indexed 14 production design systems the same way, straight from their public Figma files, into the same schema: Atlassian, Material 3, Carbon, Primer, iOS, Ant, MUI, shadcn/ui, and others, 1.4 million nodes total. With Amica's structure and 14 mature systems in the same format, I could compare nesting depth, naming patterns, and part-hiding conventions directly instead of guessing at what "good" looked like. Amica's nesting came back deepest of the set, 29 levels at the max and 12.5 on average against Primer's 6.7 average, which told me exactly where the fragility was going to show up during remediation.

## The false-positive lesson

The first pass through the audit reported a number that didn't make sense: nearly every component in the workspace showed up as having off-library references. If that were true, the library would have been unusable, and it wasn't. Instances were rendering correctly. Something was wrong with the audit, not the library.

The cause was nesting. When a published component contains a private sub-component, and that sub-component gets swapped or overridden anywhere downstream, Figma's API reports the swap as a reference on the node, and that reference can look identical to a genuine off-library pull whether it's a flat, top-level swap or a projection nested three components deep inside something that's otherwise perfectly clean. My first index treated every reference the same way, so it caught real problems and phantom ones in the same bucket. Once I separated flat references from nested ones, the real number dropped out: about 99.5% of the flagged references in the workspace were nested projections of private parts inside published parents, completely normal, not a defect. The genuine off-library count, the flat ones, was the 3,044 I actually needed to fix.

Any audit of a large component library needs to know the difference between "this node references something outside the library" and "this node contains something that itself references something outside the library." Conflating them will make a healthy system look broken, and a team that trusts a false-positive audit will spend weeks fixing things that were never wrong.

## The remediation method

Fixing 3,044 references and 61 dead masters in the right order mattered as much as fixing them at all. The method: atoms before composites, and masters before instances. If you fix a composite before the atom it contains, you fix it twice. If you fix an instance before its master, the next master update just breaks it again.

For the 61 dead masters, I didn't rebuild them from scratch. Figma keeps a cache of the last-known state on every instance of a component, even after its master is gone. I restored the masters from those surviving instance caches, which meant the restored component matched what was actually in use, not my best guess at what it should look like.

Every write was gated. Before a fix ran, I captured a PNG of the affected frame. After, I captured another and diffed them. A structural fix that changes what a component points to should not change what it looks like on screen, and if it did, that was a sign the fix was wrong before it ever reached a designer's eyes. And every claimed fix was verified through a separate REST API re-index, not through the same plugin channel that made the write. A tool that checks its own work using the same channel it used to do the work will confirm its own mistakes. A second, independent read is the only way to know a write actually landed.

The results: off-library references dropped from 3,044 to single digits across two verified rounds, the first cutting the count roughly in half. All 61 dead masters came back with zero visual regressions. 941 instance fixes were verified across the two rounds at a 97% cascade success rate, and after extending the token scale, padding compliance hit 100% across 7,362 bindings. None of this pulled a designer off their work; it ran as its own track, parallel to the team's sprints.

## Proving it in code, not just in Figma

A design system audit that stays inside Figma only proves the system is consistent with itself. I wanted proof it held up in a browser, so I built a password-gated React prototype where the design tokens exported from the Figma variables drive the Tailwind config: the teal ramp, the type scale with its real line heights, the radius scale, a custom easing curve.

The centerpiece is a quote flyout: eight step components driven by a state machine, because an insurance quote flow branches hard depending on where you live and what you're buying. Four ZIP codes were chosen specifically to exercise every branch in the availability logic: one where every product is available with bundling, one where bundling isn't offered, one where a product line isn't sold online at all, and one where a category requires a phone call instead of a web flow.

Separately, I built a Python pipeline for ambient hero video: it cuts broadcast footage into hero-length clips using scene detection snapped to the actual machine-detected cut points, rather than fixed intervals that ignore where a shot changes. Face and object detection picks a focus point for each shot, so a mobile crop reframes correctly on every cut instead of centering blindly. Manual overrides for specific shots persist across re-runs, so a one-time correction doesn't get silently discarded when the source footage updates.

## How I'd start the next one

The instinct on a broken system is to start fixing the thing you can see. The thing you can see is rarely the actual problem. Indexing first cost time up front and saved far more of it later, because every fix after that was informed by a query instead of a guess, and every claim about what got fixed was something I could verify instead of something I had to trust. Audit before you touch anything, and don't trust an audit that can't tell a real defect from a rendering quirk.
