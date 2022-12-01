var cacheName = "camera-share-cache-v1"

var assets = [
    "./",
    "index.html",
    "css/style.css",
    "css/bootstrap.rtl.min.css",
    "js/main.js",
    "js/bootstrap.bundle.js",
]

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(cacheName).then(cache => {
            cache.addAll(assets)
        })
    )
});

self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        })
    );
});
