import { defineMiddleware } from 'astro:middleware'
import { getCollection } from 'astro:content'

const COOKIE_NAME = 'case_study_auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW = 5 * 60 * 1000 // 5 minutes
const attempts = new Map<string, { count: number; resetAt: number }>()

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context

  const slug = url.pathname.match(/^\/work\/([^/]+)\/?$/)?.[1]
  if (!slug) return next()

  // Read the POST body before any other await — the request's body stream
  // doesn't reliably survive being read after unrelated async work (e.g. the
  // getCollection() call below) in this dev environment.
  let submittedPassword: string | undefined
  if (request.method === 'POST') {
    try {
      const formData = await request.formData()
      const value = formData.get('password')
      if (typeof value === 'string') submittedPassword = value
    } catch {
      // Bad form data — treated as an incorrect/missing password below
    }
  }

  const allWork = await getCollection('work')
  const caseStudy = allWork.find(e => e.id === slug && e.data.passwordProtected)
  if (!caseStudy) return next()

  // The case study page shows the password form inside its own hero (the page reads locals.gate).
  // The hero form submits with fetch and only needs a status back.
  const fromHero = request.headers.has('x-gate-fetch')
  const showGate = async (status: number, state: { error?: boolean; rateLimited?: boolean }, headers: Record<string, string> = {}) => {
    if (fromHero) return new Response(null, { status, headers })
    ;(context.locals as any).gate = state
    const page = await next()
    const merged = new Headers(page.headers)
    merged.set('Cache-Control', 'no-store')
    for (const [name, value] of Object.entries(headers)) merged.set(name, value)
    return new Response(page.body, { status, headers: merged })
  }

  // Clean expired entries
  const now = Date.now()
  for (const [ip, data] of attempts) {
    if (now > data.resetAt) attempts.delete(ip)
  }

  // Rate limit on POST. This in-memory limit resets on cold starts in serverless.
  if (request.method === 'POST') {
    const clientIp = getClientIp(request)
    const entry = attempts.get(clientIp)
    if (entry && entry.count >= RATE_LIMIT_MAX && now < entry.resetAt) {
      return showGate(429, { rateLimited: true }, { 'Retry-After': '300' })
    }
  }

  // Get password from Cloudflare env (runtime) or Astro env (dev)
  const runtime = (context.locals as any)?.runtime
  const envPassword = runtime?.env?.CASESTUDY_PASSWORD ?? import.meta.env.CASESTUDY_PASSWORD

  if (!envPassword) {
    console.error('CASESTUDY_PASSWORD not set')
    return new Response(serviceUnavailablePage(), {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // Already authenticated
  if (await isValidAuthCookie(context.cookies.get(COOKIE_NAME)?.value, envPassword)) return next()

  // Handle form submission
  if (request.method === 'POST') {
    if (submittedPassword !== undefined && timingSafeEqual(submittedPassword, envPassword)) {
      const timestamp = String(Date.now())
      context.cookies.set(COOKIE_NAME, await createAuthCookieValue(timestamp, envPassword), {
        // One password covers every protected case study, so one unlock does too
        path: '/work',
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
      })
      return fromHero ? new Response(null, { status: 204 }) : context.redirect(url.pathname, 302)
    }

    const clientIp = getClientIp(request)
    const entry = attempts.get(clientIp) ?? { count: 0, resetAt: now + RATE_LIMIT_WINDOW }
    entry.count++
    attempts.set(clientIp, entry)

    return showGate(401, { error: true })
  }

  // Show password form
  return showGate(401, {})
})

const textEncoder = new TextEncoder()

function timingSafeEqual(left: string, right: string): boolean {
  const leftBytes = textEncoder.encode(left)
  const rightBytes = textEncoder.encode(right)
  let difference = leftBytes.length ^ rightBytes.length
  const maxLength = Math.max(leftBytes.length, rightBytes.length)

  for (let index = 0; index < maxLength; index++) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0)
  }

  return difference === 0
}

async function createAuthCookieValue(timestamp: string, password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(timestamp))
  const signatureHex = [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  return `${timestamp}.${signatureHex}`
}

async function isValidAuthCookie(value: string | undefined, password: string): Promise<boolean> {
  if (!value) return false

  const [timestamp, signature, ...extraParts] = value.split('.')
  const timestampNumber = Number(timestamp)
  if (
    extraParts.length > 0
    || !/^\d+$/.test(timestamp)
    || !/^[a-f0-9]{64}$/.test(signature)
    || !Number.isSafeInteger(timestampNumber)
    || timestampNumber > Date.now()
    || Date.now() - timestampNumber > COOKIE_MAX_AGE * 1000
  ) {
    return false
  }

  const expectedValue = await createAuthCookieValue(timestamp, password)
  return timingSafeEqual(value, expectedValue)
}

function getClientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown'
}

function serviceUnavailablePage(): string {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Service temporarily unavailable</title></head><body><h1>Service temporarily unavailable</h1></body></html>'
}
