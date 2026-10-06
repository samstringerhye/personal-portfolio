import { getCollection, render, type CollectionEntry } from 'astro:content'

export async function getSortedWork() {
  const allWork = await getCollection('work')
  return allWork.sort((a, b) => a.data.sortOrder - b.data.sortOrder)
}

export async function buildCaseStudyProps(entry: CollectionEntry<'work'>, sorted: CollectionEntry<'work'>[]) {
  const listed = sorted.filter(e => !e.data.unlisted)
  const noindex = entry.data.unlisted || undefined

  let prevSlug: string | undefined
  let prevTitle: string | undefined
  let nextSlug: string | undefined
  let nextTitle: string | undefined

  if (!entry.data.unlisted) {
    const idx = listed.indexOf(entry)
    const prev = listed[idx - 1]
    const next = listed[idx + 1]
    prevSlug = prev?.id
    prevTitle = prev?.data.title
    nextSlug = next?.id
    nextTitle = next?.data.title
  }

  const { Content } = await render(entry)

  // Build OG image URL from thumbnail
  const thumbnailSrc = typeof entry.data.thumbnail === 'string'
    ? entry.data.thumbnail
    : entry.data.thumbnail?.src ?? '/assets/og-image.jpg'
  const siteUrl = 'https://samstringerhye.com'
  const ogImage = thumbnailSrc.startsWith('http') ? thumbnailSrc : `${siteUrl}${thumbnailSrc}`

  // CreativeWork + Breadcrumb JSON-LD
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": entry.data.title,
      "description": entry.data.tagline,
      "url": `${siteUrl}/work/${entry.id}`,
      "image": ogImage,
      "author": {
        "@type": "Person",
        "name": "Sam Stringer-Hye",
      },
      "dateCreated": String(entry.data.year),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
        { "@type": "ListItem", "position": 2, "name": entry.data.title, "item": `${siteUrl}/work/${entry.id}` },
      ],
    },
  ]

  return { Content, prevSlug, prevTitle, nextSlug, nextTitle, noindex, ogImage, jsonLd }
}
