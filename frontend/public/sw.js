// Service Worker für VALEO NeuroERP PWA
// Version: 1.0.0

const CACHE_NAME = 'valeo-neuroerp-v1.0.0';
const STATIC_CACHE = 'valeo-static-v1.0.0';
const API_CACHE = 'valeo-api-v1.0.0';

// Assets für Offline-Caching
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API-Endpunkte für Caching
const API_ENDPOINTS = [
  '/api/products',
  '/api/categories',
  '/api/users',
  '/api/transactions',
  '/api/ai/barcode/suggestions',
  '/api/ai/inventory/suggestions',
  '/api/ai/voucher/optimizations'
];

// Install Event - Cache statische Assets
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker wird installiert...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Statische Assets werden gecacht...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service Worker erfolgreich installiert');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Fehler beim Installieren:', error);
      })
  );
});

// Activate Event - Cleanup alte Caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker wird aktiviert...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log('[SW] Alte Cache wird gelöscht:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker erfolgreich aktiviert');
        return self.clients.claim();
      })
  );
});

// Fetch Event - Caching-Strategien
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Statische Assets - Cache First
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // API-Calls - Network First mit Fallback
  if (isApiRequest(request)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Andere Requests - Network First
  event.respondWith(networkFirst(request));
});

// Background Sync für fehlgeschlagene API-Calls
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync Event:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncPendingRequests());
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push Notification empfangen');
  
  const options = {
    body: event.data ? event.data.text() : 'Neue Benachrichtigung',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Öffnen',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('VALEO NeuroERP', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification Click:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Cache First Strategie
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First Fehler:', error);
    throw error;
  }
}

// Network First Strategie
async function networkFirst(request, cacheName = null) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && cacheName) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network nicht verfügbar, versuche Cache...');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback für HTML-Requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

// Stale While Revalidate Strategie
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Hilfsfunktionen
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    request.method === 'GET' &&
    (url.pathname.startsWith('/static/') ||
     url.pathname.startsWith('/assets/') ||
     url.pathname.endsWith('.js') ||
     url.pathname.endsWith('.css') ||
     url.pathname.endsWith('.png') ||
     url.pathname.endsWith('.jpg') ||
     url.pathname.endsWith('.ico') ||
     url.pathname === '/manifest.json')
  );
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Background Sync für fehlgeschlagene Requests
async function syncPendingRequests() {
  try {
    const db = await openIndexedDB();
    const pendingRequests = await db.getAll('pendingRequests');
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });
        
        if (response.ok) {
          await db.delete('pendingRequests', request.id);
          console.log('[SW] Pending Request erfolgreich synchronisiert:', request.url);
        }
      } catch (error) {
        console.error('[SW] Fehler beim Synchronisieren:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Fehler beim Background Sync:', error);
  }
}

// IndexedDB Helper
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ValeoNeuroERP', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Pending Requests Store
      if (!db.objectStoreNames.contains('pendingRequests')) {
        const store = db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
        store.createIndex('url', 'url', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Offline Data Store
      if (!db.objectStoreNames.contains('offlineData')) {
        const store = db.createObjectStore('offlineData', { keyPath: 'key' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Message Handler für Client-Kommunikation
self.addEventListener('message', (event) => {
  console.log('[SW] Message empfangen:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CACHE_API_RESPONSE') {
    event.waitUntil(
      caches.open(API_CACHE)
        .then((cache) => cache.put(event.data.request, event.data.response))
    );
  }
});

// Error Handler
self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker Fehler:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled Promise Rejection:', event.reason);
});

console.log('[SW] Service Worker geladen'); 