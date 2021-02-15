console.log("Hi from your service-worker.js file!");

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
self.addEventListener("install", function (evt) {
  //Pre Cache Image Data
  evt.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/images"))
  );

  //Pre Cache all static assetts
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );

  //instruct browser to activate the service worker once
  // it has finished installing
  self.skipWaiting();
});

//Activate Service Worker and Remove old Data from the Cache
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
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
self.addEventListener("fetch", function (evt) {});

//Serve static files from the cache
evt.respondWith(
  caches.open(CACHE_NAME).then((cache) => {
    return cache.match(evt.request).then((response) => {
      return response || fetch(evt.request);
    });
  })
);
