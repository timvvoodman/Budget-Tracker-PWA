const FILES_TO_CACHE = [
  "/",
  "./index.html",
  "./assets/styles.css",
  "./assets/index.js",
  "./manifest.webmanifest",
  "./assets/images/icons/icon-192x192.png",
  "./assets/images/icons/icon-512x512.png",
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
];

const STATIC_CACHE = "static-cache-v2";
const DATA_CACHE = "data-cache-v1";

self.addEventListener("install", (event) => {
  //Existing cahe transaction data
  event.waitUntil(
    caches.open(DATA_CACHE).then((cache) => cache.add("/api/transaction"))
  );

  //Static assets
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  //Activate once installed
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const currentCache = [DATA_CACHE, STATIC_CACHE];

  //Prevent duplicates in cache by checking keys
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (!currentCache.includes(key)) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

//Manage online/offline behavior for transacions with cache
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/transaction")) {
    event.respondWith(
      caches
        .open(DATA_CACHE)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              // If good response...store in cache
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              //if Network request failed...try to fetch data from cache.
              return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
  }

  // Retreive and serve serve static assets using "offline-first" approach.
  event.respondWith(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.match(event.request).then((response) => {
        return response || fetch(event.request);
      });
    })
  );
});
