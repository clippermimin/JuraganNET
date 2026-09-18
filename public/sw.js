// JuraganNet Service Worker for Offline PWA
const CACHE_NAME = 'juragannet-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Let browser handle navigation and static files with network-first or cache-fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
