// Service Worker for PWA with smarter caching + offline fallback
const CACHE_VERSION = 'v3';
const STATIC_CACHE = `cineflix-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `cineflix-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (![STATIC_CACHE, RUNTIME_CACHE].includes(name)) {
            return caches.delete(name);
          }
          return null;
        })
      )
    ).then(() => self.clients.claim())
  );
});

const fromNetworkWithTimeout = async (request) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

const cacheFirst = async (request, cacheName = STATIC_CACHE) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fromNetworkWithTimeout(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return caches.match(OFFLINE_URL);
  }
};

const staleWhileRevalidate = async (request, cacheName = RUNTIME_CACHE) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fromNetworkWithTimeout(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkFetch;
};

const networkFirst = async (request, cacheName = RUNTIME_CACHE) => {
  try {
    const response = await fromNetworkWithTimeout(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    throw err;
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === location.origin;
  const isAPI = url.pathname.startsWith('/api') || request.headers.get('accept')?.includes('application/json');
  const isImage = request.destination === 'image';
  const isFont = request.destination === 'font';
  const isStyleOrScript = ['style', 'script'].includes(request.destination);
  const isNavigation = request.mode === 'navigate';
  const isEporner = url.hostname.includes('eporner.com');

  if (isNavigation) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  if (isAPI) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  if (isImage || isFont || isEporner) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  if (isSameOrigin && isStyleOrScript) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  }
});

// Push notification event listener
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Content Available';
  const options = {
    body: data.body || 'Check out the latest videos!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    image: data.image,
    tag: data.tag || 'cineflix-notification',
    data: data.url || '/',
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
