/*
 * Service worker de Wamon : l'application reste utilisable hors ligne.
 *
 * - Pages (navigation) : réseau d'abord, cache en secours. Une nouvelle
 *   version publiée est donc visible dès le rechargement suivant.
 * - Fichiers du build (JS, CSS, polices) : cache d'abord. Leur nom contient
 *   un hachage, un nouveau build produit de nouveaux fichiers.
 *
 * L'ancienne version servait index.html depuis le cache sans jamais le
 * mettre à jour : les visiteurs restaient bloqués sur l'ancienne interface.
 * Changer CACHE efface les anciens caches à l'activation.
 */
const CACHE = 'wamon-v3';
const SHELL = ['./', './index.html', './manifest.json', './favicon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
