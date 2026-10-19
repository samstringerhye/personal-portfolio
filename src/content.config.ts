import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    client: z.string(),
    year: z.number(),
    // Shown in place of year for work that ran over several years, e.g. "2022–2025"
    yearLabel: z.string().optional(),
    role: z.string(),
    agency: z.string(),
    tagline: z.string(),
    thumbnail: image(),
    heroImage: image(),
    heroImageAlt: z.string(),
    thumbnailAlt: z.string().optional(),
    featured: z.boolean().default(false),
    sortOrder: z.number().default(999),
    unlisted: z.boolean().default(false),
    passwordProtected: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    // Text color over the homepage thumbnail, hero and password gate. 'light' (white) only where it
    // passes 4.5:1 on the background; the gray card background needs 'dark'
    thumbnailText: z.enum(['light', 'dark']).default('dark'),
    // Homepage card as two layers for the hover tilt: a transparent subject over a CSS background
    // heroOffset: fraction of image height to nudge the subject in the full-width hero (negative = up), so
    // it keeps the card's spacing above the headline (the hero frame is wider than 3:2, so it crops)
    // subjectBox: where the subject sits in its art, as fractions of the image (measured from its
    // alpha). Narrow cards and heroes frame just this box (see narrow-art.ts)
    // subjectBounds: the subject's whole extent, when subjectBox frames only part of it (defaults to
    // subjectBox). Wide heroes keep their title clear of it (hero-fit.ts)
    thumbnailLayers: z.object({
      subject: image(),
      background: z.string(),
      heroOffset: z.number().default(0),
      subjectBox: z.object({ top: z.number(), right: z.number(), bottom: z.number(), left: z.number() }).optional(),
      subjectBounds: z.object({ top: z.number(), right: z.number(), bottom: z.number(), left: z.number() }).optional(),
      // Hover flipbook: art the same size and place as the subject, played in this order
      frames: z.array(image()).optional(),
    }).optional(),
    // A coded device scene (DeviceScene) that plays on the card in place of the subject
    thumbnailScene: z.enum(['myfrontier', 'whataburger', 'cvs', 'samsung', 'bespoke']).optional(),
  }),
})

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    publishedDate: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    thumbnail: image().optional(),
  }),
})

export const collections = { work, blog }
