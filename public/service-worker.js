console.log("Hi from your service-worker.js file!");

//Install Service Worker
self.addEventListener("install", function(evt) {
    //Pre Cache Image Data
    evt.waitUntil(
        caches.open(DATA_CACHE_NAME)
    )
}