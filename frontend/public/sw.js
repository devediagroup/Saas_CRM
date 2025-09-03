// Service Worker for PWA functionality
const CACHE_NAME = 'echoops-crm-v1';
const API_CACHE = 'echoops-api-v1';
const IMAGE_CACHE = 'echoops-images-v1';

// Resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/leads',
  '/api/properties',
  '/api/deals',
  '/api/companies',
  '/api/analytics',
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('Failed to cache static resources:', error);
      })
  );
  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE && cacheName !== IMAGE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-HTTP(S) requests (e.g., chrome-extension://)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Handle API requests
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle image requests
  if (request.destination === 'image' || /\.(?:png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request).then((response) => {
          // Cache successful GET requests (only for http/https schemes)
          if (request.method === 'GET' && response.status === 200 && 
              (request.url.startsWith('http://') || request.url.startsWith('https://'))) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
      .catch(() => {
        // Return offline fallback (simple HTML response)
        return new Response(
          `<!doctype html><html lang="ar"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>وضع عدم الاتصال</title><style>body{font-family: system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f3f4f6;color:#111827} .card{background:#fff;padding:24px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.08);max-width:520px;text-align:center} h1{font-size:20px;margin:0 0 8px} p{margin:0;color:#6b7280} </style></head><body><div class="card"><h1>أنت غير متصل بالإنترنت</h1><p>يرجى التحقق من اتصال الإنترنت ثم إعادة المحاولة.</p></div></body></html>`,
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })
  );
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'You are currently offline. Please check your internet connection.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Fetch from network
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return placeholder image
    return new Response(
      `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#f3f4f6"/>
          <text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="14">Image Offline</text>
        </svg>
      `)}`,
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'sync-leads') {
    event.waitUntil(syncPendingLeads());
  }

  if (event.tag === 'sync-deals') {
    event.waitUntil(syncPendingDeals());
  }
});

// Sync pending leads
async function syncPendingLeads() {
  try {
    // Get pending leads from IndexedDB or similar
    const pendingLeads = await getPendingLeads();

    for (const lead of pendingLeads) {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
    }

    // Clear synced leads
    await clearPendingLeads();
  } catch (error) {
    console.error('Failed to sync leads:', error);
  }
}

// Sync pending deals
async function syncPendingDeals() {
  try {
    const pendingDeals = await getPendingDeals();

    for (const deal of pendingDeals) {
      await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal)
      });
    }

    await clearPendingDeals();
  } catch (error) {
    console.error('Failed to sync deals:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingLeads() {
  // Implement IndexedDB logic
  return [];
}

async function clearPendingLeads() {
  // Implement IndexedDB logic
}

async function getPendingDeals() {
  // Implement IndexedDB logic
  return [];
}

async function clearPendingDeals() {
  // Implement IndexedDB logic
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('EchoOps CRM', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: '1.0.0',
      cache: CACHE_NAME
    });
  }
});

// Periodic cache cleanup
setInterval(() => {
  cleanupOldCaches();
}, 24 * 60 * 60 * 1000); // Daily cleanup

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();

  for (const cacheName of cacheNames) {
    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE && cacheName !== IMAGE_CACHE) {
      await caches.delete(cacheName);
    }
  }
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});
