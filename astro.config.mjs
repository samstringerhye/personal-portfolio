import { defineConfig, sharpImageService } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import remarkUnwrapImages from 'remark-unwrap-images'
import rehypeLazyImages from './plugins/rehype-lazy-images.mjs'
import remarkCaseStudySections from './plugins/remark-case-study-sections.mjs'
import icon from 'astro-icon'
import cloudflare from '@astrojs/cloudflare';

// astro dev keeps Astro's sharp endpoint; the built Worker resizes SSR images with the Images binding
const isDev = process.argv.includes('dev')

// Content Sam still has to supply shows as drafts in dev and on Workers Builds preview branches, never
// on main or a local production build
const branch = process.env.WORKERS_CI_BRANCH
const showDrafts = isDev || (!!branch && branch !== 'main')

export default defineConfig({
  devToolbar: { enabled: false },
  site: 'https://samstringerhye.com',
  // Internal links have no trailing slash; wrangler's drop-trailing-slash serves pages there directly
  trailingSlash: 'never',
  redirects: {
    // The contact form was retired for a mailto link in the footer
    '/contact': '/about',
    // The work index duplicated the homepage list
    '/work': '/#work',
    // The résumé page became the homepage Experience section and its PDF download
    '/resume': '/#experience',
  },
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/work/wab-2026') && !page.includes('/colophon') && !page.includes('/blog') }), icon()],

  image: {
    service: sharpImageService(),
    endpoint: isDev ? undefined : { entrypoint: './src/image-endpoint.ts' },
    quality: 90,
    layout: 'constrained',
    responsiveStyles: true,
  },

  build: {
    inlineStylesheets: 'always',
  },

  markdown: {
    remarkPlugins: [remarkUnwrapImages, remarkCaseStudySections],
    rehypePlugins: [rehypeLazyImages],
  },

  vite: {
    define: {
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __SHOW_DRAFTS__: JSON.stringify(showDrafts),
    },
    worker: { format: 'es' },
    ssr: {
      noExternal: ['gsap'],
    },
    optimizeDeps: {
      include: ['lottie-web/build/player/lottie_light'],
    },
  },

  adapter: cloudflare({ imageService: 'custom', workerEntryPoint: { path: 'src/worker.ts' } }),
})
