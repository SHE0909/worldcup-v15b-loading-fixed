/**
 * Service Worker — WCC UES
 * Estrategia:
 *   • HTML / JS / CSS  → Network First (siempre intenta la red, caché como fallback)
 *   • Imágenes / iconos → Cache First (no cambian seguido, mejor rendimiento)
 *   • APIs externas     → solo red, sin caché
 *
 * Al cambiar CACHE_VERSION el SW se instala automáticamente y limpia la caché vieja.
 * ¡Incrementar este número en cada deploy!
 */
const CACHE_VERSION = 'wcc-ues-v18';
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

// ── INSTALL: pre-cachear assets estáticos ──────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .catch(() => {})
  );
  // Activa el nuevo SW de inmediato sin esperar a que cierren las pestañas
  self.skipWaiting();
});

// ── ACTIVATE: limpiar cachés viejas y tomar control de todos los clientes ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = e.request.url;

  // APIs externas: solo red, nunca caché
  if (
    url.includes('worldcup26.ir') ||
    url.includes('api.football-data') ||
    url.includes('thesportsdb') ||
    url.includes('api-football') ||
    url.includes('flagcdn')
  ) return;

  const isAppShell = STATIC_ASSETS.some(a => url.endsWith(a) || url.includes(a));
  const isImage    = /\.(png|jpg|jpeg|svg|webp|gif|ico)(\?.*)?$/.test(url);

  if (isImage) {
    // Cache First para imágenes (raramente cambian)
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // Network First para HTML / JS / CSS y todo lo demás del app shell
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Solo cachear respuestas válidas
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Sin red → servir desde caché como fallback
        return caches.match(e.request)
          .then(cached => cached || caches.match(BASE + '/app.html'));
      })
  );
});

// ── MENSAJE desde la app: forzar actualización ────────────────────────────
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

// ── PUSH notifications ────────────────────────────────────────────────────
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'WCC UES', body: '¡Tienes nuevas tiradas disponibles!' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:     data.body,
      icon:     '/icons/icon-192.png',
      badge:    '/icons/icon-192.png',
      vibrate:  [100, 50, 100]
    })
  );
});
