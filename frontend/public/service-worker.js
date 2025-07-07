// Service Worker für VALERO-NeuroERP PWA
const CACHE_NAME = 'valero-neuroerp-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/static/js/main.js',
    '/static/css/main.css',
    '/manifest.json',
    '/favicon.ico',
    '/logo192.png',
    '/logo512.png'
];

// Installation
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache geöffnet');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Statische Assets gecached');
                return self.skipWaiting();
            })
    );
});

// Aktivierung
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName.startsWith('valero-neuroerp-') &&
                                   cacheName !== CACHE_NAME;
                        })
                        .map((cacheName) => {
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('Alte Caches gelöscht');
                return self.clients.claim();
            })
    );
});

// Fetch-Handler
self.addEventListener('fetch', (event) => {
    // API-Anfragen
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Nur erfolgreiche GET-Anfragen cachen
                    if (
                        event.request.method === 'GET' &&
                        response.status === 200
                    ) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // Bei Offline-Zustand aus Cache laden
                    return caches.match(event.request);
                })
        );
    }
    // Statische Assets
    else {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request)
                        .then((response) => {
                            // Neue statische Assets cachen
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(event.request, responseClone);
                                    });
                            }
                            return response;
                        });
                })
        );
    }
});

// Background Sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-transactions') {
        event.waitUntil(
            syncTransactions()
        );
    }
});

// Push-Benachrichtigungen
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/logo192.png',
        badge: '/favicon.ico'
    };
    
    event.waitUntil(
        self.registration.showNotification('VALERO-NeuroERP', options)
    );
});

// Offline-Transaktionen synchronisieren
async function syncTransactions() {
    try {
        const db = await openDB();
        const tx = db.transaction('offline-transactions', 'readwrite');
        const store = tx.objectStore('offline-transactions');
        
        const transactions = await store.getAll();
        
        for (const transaction of transactions) {
            try {
                const response = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(transaction)
                });
                
                if (response.ok) {
                    await store.delete(transaction.id);
                }
            } catch (error) {
                console.error('Sync-Fehler:', error);
            }
        }
        
        await tx.complete;
    } catch (error) {
        console.error('DB-Fehler:', error);
    }
}

// IndexedDB öffnen
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('valero-neuroerp-offline', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('offline-transactions')) {
                db.createObjectStore('offline-transactions', {
                    keyPath: 'id',
                    autoIncrement: true
                });
            }
        };
    });
} 