import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog'))
    .sort((a, b) => new Date(b.data.publishedDate).getTime() - new Date(a.data.publishedDate).getTime())

  return rss({
    title: 'Writing | Sam Stringer-Hye',
    description: 'Thoughts on design, development, and the space between.',
    site: context.site!.toString(),
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.publishedDate),
      link: `/blog/${post.id}/`,
    })),
  })
}
