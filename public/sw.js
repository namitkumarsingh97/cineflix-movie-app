// Service Worker for PWA with advanced caching strategies
const CACHE_VERSION = 'v4';
const STATIC_CACHE = `cineflix-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `cineflix-runtime-${CACHE_VERSION}`;
const API_CACHE = `cineflix-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `cineflix-images-${CACHE_VERSION}`;
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
const API_CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes for API responses
const IMAGE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days for images

// Background sync queue
const SYNC_QUEUE = 'cineflix-sync-queue';

// Cache-busting strategies per resource type
const getCacheKey = (request, resourceType) => {
  const url = new URL(request.url);
  
  // For API endpoints, add version to cache key
  if (resourceType === 'api') {
    // Include query params in cache key for API requests
    const queryString = url.search;
    return `${url.pathname}${queryString ? `?${queryString}` : ''}`;
  }
  
  // For images, use URL without query params (thumbnails may have size params)
  if (resourceType === 'image') {
    // Remove common cache-busting params but keep size params
    const params = new URLSearchParams(url.search);
    params.delete('_t');
    params.delete('_cb');
    params.delete('v');
    const cleanQuery = params.toString();
    return `${url.pathname}${cleanQuery ? `?${cleanQuery}` : ''}`;
  }
  
  // For static assets, use full URL
  return request.url;
};

// Check if response is stale
const isStale = (response, maxAge) => {
  if (!response) return true;
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return true;
  const age = Date.now() - new Date(dateHeader).getTime();
  return age > maxAge;
};

// Network fetch with timeout
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

// Cache-first strategy (for images, fonts, static assets)
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
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    throw err;
  }
};

// Stale-while-revalidate strategy (for API/category metadata)
const staleWhileRevalidate = async (request, cacheName = API_CACHE, maxAge = API_CACHE_MAX_AGE) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const isCachedStale = isStale(cached, maxAge);

  // Return stale cache immediately if available
  const cacheResponse = cached && !isCachedStale ? cached : null;

  // Fetch fresh data in background
  const networkFetch = fromNetworkWithTimeout(request)
    .then((response) => {
      if (response && response.status === 200) {
        // Clone response before caching
        const responseToCache = response.clone();
        cache.put(request, responseToCache);
      }
      return response;
    })
    .catch(() => {
      // If network fails, return stale cache or null
      return cacheResponse || cached;
    });

  // Return cached immediately if available, otherwise wait for network
  return cacheResponse || networkFetch;
};

// Network-first strategy (for dynamic content)
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

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (![STATIC_CACHE, RUNTIME_CACHE, API_CACHE, IMAGE_CACHE].includes(name)) {
            return caches.delete(name);
          }
          return null;
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event - route requests based on type
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests (except for background sync)
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === location.origin;
  const isAPI = url.pathname.startsWith('/api') || 
                request.headers.get('accept')?.includes('application/json');
  const isImage = request.destination === 'image' || 
                  /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(url.pathname);
  const isFont = request.destination === 'font' || 
                 /\.(woff|woff2|ttf|otf|eot)(\?.*)?$/i.test(url.pathname);
  const isStyleOrScript = ['style', 'script'].includes(request.destination) ||
                          /\.(css|js)(\?.*)?$/i.test(url.pathname);
  const isNavigation = request.mode === 'navigate';
  const isEporner = url.hostname.includes('eporner.com');

  // Navigation requests
  if (isNavigation) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // API requests - use stale-while-revalidate for metadata endpoints
  if (isAPI) {
    const isMetadataEndpoint = 
      url.pathname.includes('/categories') ||
      url.pathname.includes('/stars') ||
      url.pathname.includes('/movies') && !url.pathname.match(/\/movies\/[^/]+$/); // List endpoints, not individual
    
    if (isMetadataEndpoint) {
      // Stale-while-revalidate for category/metadata endpoints
      event.respondWith(staleWhileRevalidate(request, API_CACHE, API_CACHE_MAX_AGE));
    } else {
      // Network-first for individual items
      event.respondWith(networkFirst(request, API_CACHE));
    }
    return;
  }

  // Images - cache-first with cache-busting and format optimization
  if (isImage || isEporner) {
    // Add image optimization headers
    const optimizedRequest = new Request(request, {
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      }
    });
    event.respondWith(cacheFirst(optimizedRequest, IMAGE_CACHE));
    return;
  }

  // Fonts - cache-first
  if (isFont) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Styles and scripts - stale-while-revalidate
  if (isSameOrigin && isStyleOrScript) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE, 24 * 60 * 60 * 1000)); // 24 hours
    return;
  }
});

// Background sync for watch later actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-watch-later') {
    event.waitUntil(syncWatchLaterQueue());
  }
});

// Sync watch later queue
async function syncWatchLaterQueue() {
  try {
    const queue = await getSyncQueue();
    if (queue.length === 0) return;

    const token = await getAuthToken();
    if (!token) {
      console.log('No auth token for background sync');
      return;
    }

    const apiBase = await getApiBaseUrl();
    
    for (const action of queue) {
      try {
        const url = `${apiBase}/user/watch-later`;
        const options = {
          method: action.type === 'add' ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(action.data),
        };

        const response = await fetch(url, options);
        if (response.ok || response.status === 400) {
          // Remove from queue on success or if item already exists
          await removeFromSyncQueue(action.id);
        } else if (response.status === 401) {
          // Unauthorized - remove from queue
          await removeFromSyncQueue(action.id);
        } else {
          console.error('Background sync failed:', response.status);
          // Keep in queue for retry
        }
      } catch (err) {
        console.error('Background sync error:', err);
        // Keep in queue for retry
      }
    }
  } catch (err) {
    console.error('Sync queue error:', err);
  }
}

// Get sync queue from IndexedDB
async function getSyncQueue() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cineflix-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([SYNC_QUEUE], 'readonly');
      const store = transaction.objectStore(SYNC_QUEUE);
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result || []);
      getAll.onerror = () => reject(getAll.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SYNC_QUEUE)) {
        db.createObjectStore(SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Remove from sync queue
async function removeFromSyncQueue(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cineflix-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SYNC_QUEUE)) {
        db.createObjectStore(SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Get auth token from client via message
async function getAuthToken() {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      resolve(event.data?.token || null);
    };
    
    self.clients.matchAll().then((clients) => {
      if (clients.length === 0) {
        resolve(null);
        return;
      }
      
      // Send message to first client
      clients[0].postMessage({ type: 'get-auth-token' }, [channel.port2]);
      
      // Timeout after 1 second
      setTimeout(() => resolve(null), 1000);
    });
  });
}

// Get API base URL from client via message
async function getApiBaseUrl() {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      resolve(event.data?.apiBase || '/api');
    };
    
    self.clients.matchAll().then((clients) => {
      if (clients.length === 0) {
        resolve('/api');
        return;
      }
      
      // Send message to first client
      clients[0].postMessage({ type: 'get-api-base' }, [channel.port2]);
      
      // Timeout after 1 second
      setTimeout(() => resolve('/api'), 1000);
    });
  });
}

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

// Message handler for communication with clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'queue-watch-later') {
    event.waitUntil(queueWatchLaterAction(event.data.action));
  }
  // Note: get-auth-token and get-api-base are handled via MessageChannel in getAuthToken/getApiBaseUrl
});

// Queue watch later action for background sync
async function queueWatchLaterAction(action) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cineflix-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE);
      const addRequest = store.add({
        type: action.type, // 'add' or 'remove'
        data: action.data,
        timestamp: Date.now(),
      });
      
      addRequest.onsuccess = () => {
        // Register background sync
        if ('sync' in self.registration) {
          self.registration.sync.register('sync-watch-later');
        }
        resolve();
      };
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SYNC_QUEUE)) {
        db.createObjectStore(SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
