import type { SSRManifest } from 'astro'
import { App } from 'astro/app'
import { handle } from '@astrojs/cloudflare/handler'

type HandleArgs = Parameters<typeof handle>

export function createExports(manifest: SSRManifest) {
  const app = new App(manifest)
  return {
    default: {
      async fetch(request: HandleArgs[2], env: HandleArgs[3], context: HandleArgs[4]) {
        return handle(manifest, app, request, env, context)
      },
    },
  }
}
