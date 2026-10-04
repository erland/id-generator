const CACHE_NAME = 'id-generator-offline-v2'

function scopeUrl(path = '') {
  return new URL(path, self.registration.scope).href
}

const STATIC_SHELL = [
  scopeUrl('manifest.webmanifest'),
  scopeUrl('icons/favicon.svg'),
  scopeUrl('icons/icon-192.png'),
  scopeUrl('icons/icon-512.png'),
  scopeUrl('icons/icon-maskable-512.png'),
  scopeUrl('icons/apple-touch-icon.png'),
]

const CACHEABLE_DESTINATIONS = new Set(['script', 'style', 'image', 'font', 'manifest'])

function extractLocalAssetUrls(html) {
  const urls = new Set()
  const attributePattern = /(?:src|href)=["']([^"']+)["']/g

  for (const match of html.matchAll(attributePattern)) {
    const candidate = new URL(match[1], self.registration.scope)

    if (
      candidate.origin === self.location.origin &&
      candidate.href.startsWith(self.registration.scope) &&
      candidate.href !== scopeUrl('sw.js') &&
      candidate.search === ''
    ) {
      urls.add(candidate.href)
    }
  }

  return [...urls]
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(STATIC_SHELL)

  const appUrl = scopeUrl()
  const appResponse = await fetch(appUrl, { cache: 'no-store' })

  if (!appResponse.ok) {
    throw new Error(`Unable to precache app shell: ${appResponse.status}`)
  }

  await cache.put(appUrl, appResponse.clone())

  const html = await appResponse.text()
  const assetUrls = extractLocalAssetUrls(html)

  await Promise.all(
    assetUrls.map(async (assetUrl) => {
      const response = await fetch(assetUrl, { cache: 'no-store' })
      if (response.ok) {
        await cache.put(assetUrl, response)
      }
    }),
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('id-generator-offline-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

function isCacheableRequest(request, url) {
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return false
  }

  if (!url.href.startsWith(self.registration.scope) || url.search !== '') {
    return false
  }

  return request.mode === 'navigate' || CACHEABLE_DESTINATIONS.has(request.destination)
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const response = await fetch(request)

    if (response.ok) {
      await cache.put(request, response.clone())
    }

    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }

    if (request.mode === 'navigate') {
      const appShell = await cache.match(scopeUrl())
      if (appShell) {
        return appShell
      }
    }

    throw new Error('Offline resource is not cached.')
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (!isCacheableRequest(request, url)) {
    return
  }

  event.respondWith(networkFirst(request))
})
