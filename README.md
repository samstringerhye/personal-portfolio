# Portfolio

Design portfolio for Sam Stringer-Hye. An Astro site (SSR via the Cloudflare adapter) deployed
as a Cloudflare Worker named `portfolio`. Live at https://samstringerhye.com.

## Requirements

- Node.js and npm (a recent LTS; no version is pinned in this repo).
- A Cloudflare login (`npx wrangler login`) only if you deploy.

## Run it

```bash
npm install
npm run dev       # dev server at http://localhost:4321
npm run build     # production build into dist/
npm run preview   # build, then serve it with wrangler dev
npx astro check   # type-check (also runs against .astro files)
```

`npm run cf-typegen` regenerates Cloudflare binding types after editing `wrangler.jsonc`.

## Deploy

```bash
npm run deploy    # build, then wrangler deploy (needs Cloudflare auth)
```

`wrangler.jsonc` serves `dist/` as static assets and runs the Worker first for `/work/*`
(`src/middleware.ts`), which gates password-protected case studies.

Environment: copy `.env.example` to `.env` for local dev. `WAB_PASSWORD` is the password for
the protected case study. In production set it as a Worker secret, never in the repo.

## Where things live

| Path | What |
| --- | --- |
| `src/pages/` | Routes (home, about, resume, colophon, blog, `work/` case studies, RSS) |
| `src/content/` | Collections: `work/` case studies (MDX), `blog/`, `home.json`; schema in `src/content.config.ts` |
| `src/components/`, `src/layouts/` | UI components and page layouts |
| `src/styles/` | Global CSS, custom media, Amica tokens |
| `src/data/` | Design tokens (`tokens.json`), animation config, and their schemas |
| `src/assets/` | Images processed by Astro (case study art, about) |
| `src/lottie/` | Lottie animations |
| `src/middleware.ts` | Password gate and protected-embed serving |
| `plugins/` | Custom rehype plugin (lazy images) |
| `public/` | Static files served as-is: fonts, icons, `_headers`, robots, protected embeds |
| `scripts/` | `pagespeed.sh` and the work-card art generators (`scripts/thumbnails/README.md`) |
| `docs/` | Design notes, UX review, plans, session logs, QA write-ups |
| `.agents/`, `.claude/` | Local agent skills and editor launch config |

## More docs

- `CLAUDE.md` and `AGENTS.md`: conventions and copy rules for agents and for anyone writing copy.
- `src/data/animation.config.docs.md`: what each animation setting does.
- `scripts/thumbnails/README.md`: regenerating card art and favicons.
- `docs/session-log.md` and `docs/notes/`: running history and research notes.
