# Work card art

Generators for the homepage work cards and case study heroes. Each takes the repo root as its
only argument and writes into `src/assets/work/` (favicons into `public/`). They use `sharp` from
the project's `node_modules`.

Run order for the layered cards (what the site uses):

```bash
node scripts/thumbnails/layers32.mjs "$PWD"   # transparent subject cutouts (*-subject-32.png) from the original photos
node scripts/thumbnails/wab-layer.mjs "$PWD"  # Whataburger phone, traced along its edge (needs wab-thumbnail-32.jpeg)
node scripts/thumbnails/balance.mjs "$PWD"    # size and place each subject: anchored above the headline, Amica centered
```

- `recompose32.mjs` builds the flat 3:2 composites (`*-thumbnail-32.*`), used for link previews and as the
  `thumbnail` fallback.
- `favicons.mjs` builds `favicon.ico`, `apple-touch-icon.png`, and the Android icons from `public/favicon.svg`.

Placement numbers in `balance.mjs` (band, gap) are measured from the card at 1440px wide. If the card's
text size or padding changes, re-measure and rerun, then update each case study's `heroOffset`.
