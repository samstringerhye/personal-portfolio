import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    client: z.string(),
    year: z.number(),
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
    // Text color over the homepage thumbnail: 'light' for saturated images, 'dark' for light ones
    thumbnailText: z.enum(['light', 'dark']).default('dark'),
    // Homepage card as two layers for the hover tilt: a transparent subject over a CSS background
    // heroOffset: fraction of image height to nudge the subject in the full-width hero (negative = up), so
    // it keeps the card's spacing above the headline (the hero frame is wider than 3:2, so it crops)
    thumbnailLayers: z.object({ subject: image(), background: z.string(), heroOffset: z.number().default(0) }).optional(),
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
