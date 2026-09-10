const CACHE_NAME = "fred-hiring-system-v8";
const scopeUrl = new URL(self.registration.scope);
const asset = (path) => new URL(path, scopeUrl).toString();
const APP_SHELL = [
  asset("./"),
  asset("manifest.webmanifest"),
  asset("offline.html"),
  asset("icons/icon-192.png"),
  asset("icons/icon-512.png"),
  asset("icons/icon-maskable-512.png"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("fred-hiring-system-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(asset("./"), copy));
          return response;
        })
        .catch(async () => (await caches.match(asset("./"))) || (await caches.match(asset("offline.html")))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
      return cached || network;
    }),
  );
});
