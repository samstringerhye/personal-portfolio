import type { SSRManifest } from 'astro'
import { App } from 'astro/app'
import { handle } from '@astrojs/cloudflare/handler'

// The adapter's handler serves any built file before middleware runs, so the gate in
// src/middleware.ts never sees direct requests for public/_protected-embeds/. Refuse them here;
// the gated /work/amica-design-system/{prototype,ambient-hero} routes read them via ASSETS.
type HandleArgs = Parameters<typeof handle>

export function createExports(manifest: SSRManifest) {
  const app = new App(manifest)
  return {
    default: {
      async fetch(request: HandleArgs[2], env: HandleArgs[3], context: HandleArgs[4]) {
        if (new URL(request.url).pathname.startsWith('/_protected-embeds/')) {
          return new Response('Not found', { status: 404 })
        }
        return handle(manifest, app, request, env, context)
      },
    },
  }
}
