// IronFreight Driver PWA – cache shell for offline, network-first for API/data
const CACHE_NAME = 'ironfreight-driver-v1'
const SHELL_URLS = ['/driver', '/driver/', '/login', '/']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_URLS.map((u) => new Request(u, { cache: 'reload' }))).catch(() => {})
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  // Only handle same-origin GET
  if (url.origin !== self.location.origin || request.method !== 'GET') return

  // Navigation (driver app pages): network first, fallback to cache for offline
  if (request.mode === 'navigate' && (url.pathname === '/' || url.pathname.startsWith('/driver') || url.pathname === '/login')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return res
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/driver')))
    )
    return
  }

  // Static assets (JS, CSS, images): cache-first after first load
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image' || url.pathname.startsWith('/_next/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone()
        if (res.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        return res
      }))
    )
    return
  }
})
