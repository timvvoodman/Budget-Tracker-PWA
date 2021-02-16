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

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

//Install Service Worker
self.addEventListener("install", function (event) {
  //Pre Cache Image Data
  event.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/images"))
  );

  //Pre Cache all static assetts
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );

  //instruct browser to activate the service worker once
  // it has finished installing
  self.skipWaiting();
});

//Activate Service Worker and Remove old Data from the Cache
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

//Enable the server worker to intercept network requests
self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              // Network request failed, try to get it from the cache.
              return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
  }

  //Serve static files from the cache
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        return response || fetch(evt.request);
      });
    })
  );
});
