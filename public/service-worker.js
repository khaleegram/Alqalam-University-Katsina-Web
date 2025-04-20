// public/service-worker.js

const CACHE_NAME = 'admin-dashboard-cache-v1';

// List of assets to cache during the install phase.
// Add the URLs of other static assets as needed.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // If your build outputs these files, add them.
  '/static/js/bundle.js',
  '/static/js/vendors~main.chunk.js',
  '/static/js/main.chunk.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found; otherwise, fetch from network.
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        // Optionally, cache the new response dynamically.
        return caches.open(CACHE_NAME).then((cache) => {
          // Cloning the response before caching it.
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
