/**
 * Service Worker — World Cup Collector UES v7 PWA
 */
const CACHE_NAME = 'wcc-ues-v14';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.html',
  '/login.html',
  '/css/app.css',
  '/css/main.css',
  '/css/auth.css',
  '/js/utils/db.js',
  '/js/utils/auth.js',
  '/js/utils/toast.js',
  '/js/utils/modal.js',
  '/js/modules/api.js',
  '/js/modules/gacha.js',
  '/js/modules/album.js',
  '/js/modules/predictions.js',
  '/js/modules/profile.js',
  '/js/modules/stats.js',
  '/js/modules/dashboard.js',
  '/js/modules/battle.js',
  '/js/modules/exchange.js',
  '/js/app.js',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
      .catch(() => {}) // No fallar si algún asset no existe aún
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Solo cachear requests GET
  if (e.request.method !== 'GET') return;
  // No cachear APIs externas
  if (e.request.url.includes('api.football-data') || e.request.url.includes('thesportsdb')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/app.html'));
    })
  );
});

// Notificaciones push (futuro)
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'WCC UES', body: '¡Tienes nuevas tiradas disponibles!' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100]
    })
  );
});
