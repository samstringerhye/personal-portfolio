import { defineMiddleware } from 'astro:middleware'
import { getCollection } from 'astro:content'

const COOKIE_NAME = 'case_study_auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW = 5 * 60 * 1000 // 5 minutes
const PROTOTYPE_PATH = '/work/amica-design-system/prototype'
const AMBIENT_HERO_PATH = '/work/amica-design-system/ambient-hero'
const attempts = new Map<string, { count: number; resetAt: number }>()

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context

  const isPrototypePath = url.pathname === PROTOTYPE_PATH || url.pathname.startsWith(`${PROTOTYPE_PATH}/`)
  const isAmbientHeroPath = url.pathname === AMBIENT_HERO_PATH || url.pathname.startsWith(`${AMBIENT_HERO_PATH}/`)
  const match = url.pathname.match(/^\/work\/([^/]+)\/?$/)
  const slug = match?.[1] ?? (isPrototypePath || isAmbientHeroPath ? 'amica-design-system' : undefined)
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

  const protectedPath = `/work/${slug}`

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
      return new Response(passwordPage(caseStudy.data.title, false, true), {
        status: 429,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '300' },
      })
    }
  }

  // Get password from Cloudflare env (runtime) or Astro env (dev)
  const runtime = (context.locals as any)?.runtime
  const envPassword = runtime?.env?.WAB_PASSWORD ?? import.meta.env.WAB_PASSWORD

  if (!envPassword) {
    console.error('WAB_PASSWORD not set')
    return new Response(serviceUnavailablePage(), {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // Already authenticated. Embedded sub-apps additionally accept the auth token as a query
  // param (?embed_auth=) alongside the cookie: an <iframe src> that's part of the initial
  // page HTML issues its subrequest before the browser reliably commits a cookie set by the
  // same navigation's redirect, so cookie-only auth intermittently fails for that one request
  // pattern. The case study page itself only ever renders after middleware has already
  // confirmed a valid cookie, so it can safely hand that same validated value to the iframe
  // explicitly rather than depending on the browser to re-attach it.
  const cookieValid = await isValidAuthCookie(context.cookies.get(COOKIE_NAME)?.value, envPassword)
  const embedTokenValid = (isPrototypePath || isAmbientHeroPath)
    && await isValidAuthCookie(url.searchParams.get('embed_auth') ?? undefined, envPassword)
  if (cookieValid || embedTokenValid) {
    if (isPrototypePath || isAmbientHeroPath) return serveEmbeddedAsset(context, isPrototypePath)
    return next()
  }

  // Handle form submission
  if (request.method === 'POST') {
    if (submittedPassword !== undefined && timingSafeEqual(submittedPassword, envPassword)) {
      const timestamp = String(Date.now())
      context.cookies.set(COOKIE_NAME, await createAuthCookieValue(timestamp, envPassword), {
        path: protectedPath,
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
      })
      return context.redirect(url.pathname, 302)
    }

    const clientIp = getClientIp(request)
    const entry = attempts.get(clientIp) ?? { count: 0, resetAt: now + RATE_LIMIT_WINDOW }
    entry.count++
    attempts.set(clientIp, entry)

    return new Response(passwordPage(caseStudy.data.title, true), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // Show password form
  return new Response(passwordPage(caseStudy.data.title, false), {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
})

// Serves an embedded app whose real files live under public/_protected-embeds/, NOT under
// public/work/ — Cloudflare's static asset layer serves any exact file match directly,
// bypassing the worker (and this password gate) regardless of run_worker_first. Keeping the
// real files off the public URL entirely means no request under /work/amica-design-system/
// prototype or /ambient-hero ever has a literal asset match, so every one of them is
// guaranteed to reach this middleware first. We translate the gated public path to the
// internal storage path and fetch it via the ASSETS binding. The prototype app is a
// client-routed SPA, so any sub-path that isn't a real file (e.g. /prototype/products/auto)
// falls back to its index.html.
async function serveEmbeddedAsset(
  context: Parameters<Parameters<typeof defineMiddleware>[0]>[0],
  isPrototypePath: boolean,
): Promise<Response> {
  const runtime = (context.locals as any)?.runtime
  const assets = runtime?.env?.ASSETS
  if (!assets) {
    return new Response(serviceUnavailablePage(), {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const publicPrefix = isPrototypePath ? PROTOTYPE_PATH : AMBIENT_HERO_PATH
  const internalPrefix = isPrototypePath ? '/_protected-embeds/amica-prototype' : '/_protected-embeds/amica-ambient-hero'
  const pathname = context.url.pathname
  const suffix = pathname === publicPrefix ? '' : pathname.slice(publicPrefix.length)
  const internalPath = `${internalPrefix}${suffix === '' || suffix === '/' ? '/index.html' : suffix}`

  // `astro dev` provides a partial Cloudflare runtime stub (unlike `wrangler dev` or a real
  // deploy, where ASSETS is the genuine bindings), so `assets.fetch()` can throw here even
  // though the truthiness check above passed. Fail to a clear message instead of a crash —
  // this embed only actually works under `wrangler dev`/`npm run preview` or the real deploy.
  try {
    const internalUrl = new URL(internalPath, context.request.url)
    let response = await assets.fetch(new Request(internalUrl, {
      method: context.request.method,
      headers: context.request.headers,
    }))

    if (response.status === 404 && isPrototypePath) {
      const indexUrl = new URL(`${internalPrefix}/index.html`, context.request.url)
      response = await assets.fetch(new Request(indexUrl, {
        method: context.request.method,
        headers: context.request.headers,
      }))
    }

    // Overwrite rather than rely on public/_headers: Cloudflare merges same-named headers
    // from every matching rule instead of letting the more specific one win, so a _headers
    // rule here would just append SAMEORIGIN alongside the sitewide DENY and the browser
    // falls back to the stricter value. Setting it directly on the Response is unambiguous.
    const headers = new Headers(response.headers)
    headers.set('X-Frame-Options', 'SAMEORIGIN')
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
  } catch {
    return new Response(
      '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Preview unavailable in astro dev</title></head>'
      + '<body><h1>Embedded prototypes need wrangler</h1><p>This route only works under <code>npm run preview</code> '
      + '(wrangler dev) or the real deployment — <code>astro dev</code> doesn\'t provide a working Cloudflare ASSETS binding.</p></body></html>',
      { status: 501, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }
}

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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char] as string))
}

function passwordPage(caseStudyTitle: string, error: boolean, rateLimited = false): string {
  const title = escapeHtml(caseStudyTitle)
  const formContent = rateLimited
    ? '<p class="error">Too many attempts. Try again in a few minutes.</p>'
    : `<form method="POST">
          <input id="password" type="password" name="password" aria-label="Password" placeholder="Password" required autofocus autocomplete="current-password" />
          ${error ? '<p class="error">Incorrect password. Try again.</p>' : ''}
          <button type="submit">View Case Study</button>
        </form>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${title} — Password Required</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
      background: #EFF4F5;
      color: #0B0D1B;
      min-height: 100dvh;
      padding: 2rem;
      -webkit-font-smoothing: antialiased;
    }
    .page {
      min-height: calc(100dvh - 4rem);
      display: flex;
      flex-direction: column;
    }
    header {
      display: flex;
      align-items: center;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      color: #0B0D1B;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      text-decoration: none;
    }
    .brand-mark {
      width: 0.65rem;
      height: 0.65rem;
      background: #0B0D1B;
      border-radius: 50%;
    }
    main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .gate {
      width: 100%;
      max-width: 360px;
      text-align: center;
    }
    .lock {
      width: 48px;
      height: 48px;
      margin: 0 auto 1.5rem;
      color: #4D5263;
    }
    .project-name {
      font-size: 0.78rem;
      font-weight: 600;
      color: #4D5263;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
    }
    .subtitle {
      font-size: 0.82rem;
      color: #4D5263;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    input[type="password"] {
      width: 100%;
      padding: 0.7rem 1rem;
      font-size: 0.9rem;
      font-family: inherit;
      border: 1px solid #DAE5E7;
      border-radius: 4px;
      background: white;
      color: #0B0D1B;
      outline: none;
      transition: border-color 0.15s ease;
    }
    input[type="password"]:focus {
      border-color: #0B0D1B;
      box-shadow: 0 0 0 2px #0B0D1B;
    }
    input[type="password"]::placeholder {
      color: #4D5263;
    }
    button {
      padding: 0.7rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: inherit;
      letter-spacing: 0.02em;
      color: #EFF4F5;
      background: #0B0D1B;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    button:hover { background: #1A1D2E; }
    button:active { background: #000; }
    button:focus-visible, .back:focus-visible {
      box-shadow: 0 0 0 2px #EFF4F5, 0 0 0 4px #0B0D1B;
      outline: none;
    }
    button:disabled {
      cursor: wait;
      opacity: 0.8;
    }
    .error {
      font-size: 0.78rem;
      color: #C5202F;
      margin-top: -0.25rem;
    }
    .back {
      display: inline-block;
      margin-top: 1.25rem;
      font-size: 0.75rem;
      color: #4D5263;
      text-decoration: none;
    }
    .back:hover { color: #0B0D1B; }
    .access {
      margin: 1.25rem 0 0;
    }
    .access a {
      color: inherit;
      text-decoration-color: #4D5263;
      text-underline-offset: 0.15em;
    }
    .access a:hover { color: #0B0D1B; }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <a class="brand" href="/" aria-label="Sam Stringer-Hye home"><span class="brand-mark" aria-hidden="true"></span>Sam Stringer-Hye</a>
    </header>
    <main>
      <div class="gate">
        <p class="project-name">${title}</p>
        <svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <h1>This case study is password-protected</h1>
        <p class="subtitle">This case study is under NDA. Enter the password to view.</p>
        ${formContent}
        <p class="subtitle access">Need access? Email <a data-contact-email>me</a></p>
        <a href="/#work" class="back">&larr; Back to work</a>
      </div>
    </main>
  </div>
  <script>
    const contact = document.querySelector('a[data-contact-email]')
    if (contact) {
      const address = 'hello@' + ['samstringerhye', 'com'].join('.')
      contact.href = 'mailto:' + address
      contact.textContent = address
    }

    const form = document.querySelector('form')
    const submitButton = form?.querySelector('button[type="submit"]')

    window.addEventListener('pageshow', () => {
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = 'View Case Study'
      }
    })

    form?.addEventListener('submit', (event) => {
      if (!submitButton || submitButton.disabled) {
        event.preventDefault()
        return
      }
      submitButton.disabled = true
      submitButton.textContent = 'Checking...'
    })
  </script>
</body>
</html>`
}

function serviceUnavailablePage(): string {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Service temporarily unavailable</title></head><body><h1>Service temporarily unavailable</h1></body></html>'
}
