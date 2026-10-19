// Service worker de la guía: permite abrirla sin señal dentro del condominio.
// Para forzar una actualización de todo el caché, cambiar el número de VERSION.
const VERSION = 'almapuyai-v1';
const PRECACHE = ['/', '/en/', '/hero.webp', '/favicon.svg', '/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Muestra lo guardado al tiro y actualiza en segundo plano (la próxima visita ya trae lo nuevo).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(hit => {
        const red = fetch(req).then(res => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => hit);
        return hit || red;
      })
    )
  );
});
