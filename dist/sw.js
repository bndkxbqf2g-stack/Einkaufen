const CACHE_NAME = 'angebotskueche-shell-v29';
const APP_SHELL = ['./index.html', './manifest.json', './ingredient-normalization.js', './shopping-costs.js', './meal-planning.js', './supabase-sync.js'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.endsWith('/sw.js')) return;
  if (url.origin !== self.location.origin || url.pathname.endsWith('/api/sync')) return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => {
        if (cached) {
          const headers = new Headers(cached.headers);
          headers.set('X-Angebotskueche-Cache-Fallback', '1');
          return new Response(cached.body, { status: cached.status, statusText: cached.statusText, headers });
        }
        return event.request.mode === 'navigate' || event.request.destination === 'document'
          ? caches.match('./index.html')
          : Response.error();
      }))
  );
});

