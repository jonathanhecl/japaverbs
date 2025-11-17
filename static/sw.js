const CACHE_VERSION = 'v20251019';
const CACHE_NAME = `japaverbs-static-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `japaverbs-data-${CACHE_VERSION}`;
const DATA_PATHS = ['/verbs_n5_0_clean.json', '/verbs_n5_1_clean.json'];
const ASSETS_TO_CACHE = [
  '/',
  '/diccionario',
  '/practica',
  '/conjugaciones',
  '/perfil',
  '/manifest.json',
  '/favicon.png'
];

const IS_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
let isUpdate = false;

if (IS_DEV) {
  console.log('[Service Worker] Dev mode detected, bypassing cache logic.');
  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });
  // Let fetch fall through to the network for dev to avoid stale assets
  self.addEventListener('fetch', () => {});
} else {
  // Install event - cache assets
  self.addEventListener('install', (event) => {
    isUpdate = !!self.registration?.active;
    console.log('[Service Worker] Installing...');
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[Service Worker] Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      }).catch((error) => {
        console.error('[Service Worker] Cache installation failed:', error);
      })
    );
    self.skipWaiting();
  });

  // Activate event - clean old caches
  self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys();
        const cachesToDelete = cacheNames.filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME);
        await Promise.all(
          cachesToDelete.map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
        await self.clients.claim();
        if (isUpdate) {
          const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
          clientList.forEach((client) => {
            client.postMessage({ type: 'PWA_UPDATE_READY' });
          });
        }
      })()
    );
  });

  // Fetch event - serve from cache, fallback to network
  self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
      return;
    }

    event.respondWith((async () => {
      try {
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          try {
            const networkResponse = await fetch(event.request);
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          } catch (error) {
            console.error('[Service Worker] Navigation fetch failed:', error);
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
              // Cache hit - return response
              return cachedResponse;
            }
            return cache.match('/');
          }
        }

        const requestUrl = new URL(event.request.url);
        if (DATA_PATHS.some((path) => requestUrl.pathname.endsWith(path))) {
          const cache = await caches.open(DATA_CACHE_NAME);
          try {
            const networkResponse = await fetch(event.request);
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          } catch (error) {
            console.error('[Service Worker] Data fetch failed:', error);
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
              // Cache hit - return response
              return cachedResponse;
            }
            throw error;
          }
        }

        const response = await caches.match(event.request);
        if (response) {
          // Cache hit - return response
          return response;
        }

        const fetchResponse = await fetch(event.request);
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }

        const responseToCache = fetchResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, responseToCache);

        return fetchResponse;
      } catch (error) {
        console.error('[Service Worker] Fetch handler error:', error);
        // Return offline page or fallback
        return caches.match('/');
      }
    })());
  });

  // Listen for messages from clients
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
}
