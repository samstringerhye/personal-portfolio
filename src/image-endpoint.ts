import type { APIRoute } from 'astro'

// Prerendered pages get their images resized by sharp at build time. Workers can't run sharp, so the
// SSR pages (the password-gated case studies) request /_image at runtime and are resized here with
// the Cloudflare Images binding. Without the binding (e.g. a missing wrangler config) the original
// file is served, which is what the adapter's default endpoint always did.
export const prerender = false

export const GET: APIRoute = async ({ url, request, locals }) => {
  // Check the resolved path, not the raw param, so "/_astro/../…" can't reach files outside /_astro/
  const sourceUrl = new URL(url.searchParams.get('href') ?? '', url)
  if (sourceUrl.origin !== url.origin || !sourceUrl.pathname.startsWith('/_astro/')) {
    return new Response('Not found', { status: 404 })
  }

  const runtime = (locals as { runtime?: { env?: Record<string, any>; ctx?: { waitUntil: (p: Promise<unknown>) => void } } }).runtime
  const env = runtime?.env
  // The URL names the source's content hash and every transform, so a resized image is stored at the
  // edge once instead of being transformed again for each visitor
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default
  const cached = await cache?.match(request)
  if (cached) return cached

  const source: Response | undefined = await env?.ASSETS?.fetch(sourceUrl)
  if (!source?.ok || !source.body) return new Response('Not found', { status: 404 })
  if (!env?.IMAGES || sourceUrl.pathname.endsWith('.svg')) return source

  const width = Number(url.searchParams.get('w')) || undefined
  const height = Number(url.searchParams.get('h')) || undefined
  const result = await env.IMAGES.input(source.body)
    .transform({ width, height, fit: url.searchParams.get('fit') === 'cover' ? 'cover' : 'scale-down' })
    .output({ format: url.searchParams.get('f') === 'avif' ? 'image/avif' : 'image/webp', quality: Number(url.searchParams.get('q')) || 80 })
  // The href carries the source's content hash, so a given URL never changes
  const response: Response = result.response({ headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } })
  if (cache && response.ok) runtime?.ctx?.waitUntil(cache.put(request, response.clone()))
  return response
}
