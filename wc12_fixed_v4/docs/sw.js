const CACHE_NAME = 'wcc-ues-v15';
const BASE = '/worldcup-v15b-loading-fixed';
const STATIC_ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/app.html',
  BASE + '/login.html',
  BASE + '/css/app.css',
  BASE + '/css/main.css',
  BASE + '/css/auth.css',
  BASE + '/js/utils/db.js',
  BASE + '/js/utils/auth.js',
  BASE + '/js/utils/toast.js',
  BASE + '/js/utils/modal.js',
  BASE + '/js/modules/api.js',
  BASE + '/js/modules/gacha.js',
  BASE + '/js/modules/album.js',
  BASE + '/js/modules/predictions.js',
  BASE + '/js/modules/profile.js',
  BASE + '/js/modules/stats.js',
  BASE + '/js/modules/dashboard.js',
  BASE + '/js/modules/battle.js',
  BASE + '/js/modules/exchange.js',
  BASE + '/js/app.js',
  BASE + '/manifest.json'
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
      }).catch(() => caches.match(BASE + '/app.html'));
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
