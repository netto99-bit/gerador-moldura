const CACHE = 'beth-story-v6';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest',
  '/icon.svg',
  '/frame/part00.txt',
  '/frame/part01.txt',
  '/frame/part02.txt',
  '/frame/part03.txt',
  '/frame/part04.txt',
  '/frame/part05.txt',
  '/frame/part06.txt',
  '/frame/part07.txt',
  '/frame/part08.txt',
  '/frame/part09.txt',
  '/frame/part10.txt',
  '/frame/part11.txt'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
