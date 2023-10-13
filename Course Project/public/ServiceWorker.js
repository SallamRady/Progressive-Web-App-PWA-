self.addEventListener("install", (e) => {
    // store pre-cache
    e.waitUntil(
        caches.open('static').then(cache => {
            // cache.addAll([
            //     '/',
            //     '/index.html',
            //     '/src/js/app.js',
            //     '/src/js/feed.js',
            //     '/src/js/fetch.js',
            //     '/src/js/promise.js',
            //     '/src/js/material.min.js',
            //     '/src/css/app.css',
            //     '/src/css/feed.css',
            //     '/images/main-image-lg.jpg',
            //     '/images/main-image-sm.jpg',
            //     '/images/main-image.jpg',
            //     'https://fonts.googleapis.com/css?family=Roboto:400,700',
            //     'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
            // ]);
            cache.add('/');
            cache.add('/index.html');
            cache.add('/src/js/app.js');
            cache.add('/src/js/feed.js');
            cache.add('/src/js/fetch.js');
            cache.add('/src/js/promise.js');
            cache.add('/src/js/material.min.js');
            cache.add('/src/css/app.css');
            cache.add('/src/css/feed.css');
            cache.add('/src/images/main-image-lg.jpg');
            cache.add('/src/images/main-image-sm.jpg');
            cache.add('/src/images/main-image.jpg');
            cache.add('https://fonts.googleapis.com/css?family=Roboto:400,700');
            cache.add('https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css');
        }).catch(err => {
            console.log("Error in store pre-cache");
        })
    )
    console.log("[service worker] Service worker is installed successfully and pre-cache Also :)");
});

self.addEventListener("activate", (e) => {
    console.log("[service worker] Service worker is activated successfully :)");
});

self.addEventListener('fetch', (e) => {
    // check if http request in cache?
    e.respondWith(
        caches.match(e.request).then(response => {
            if (response) {
                // this request is cached and return response.
                console.log("[service worker] Return response from cache.")
                return response;
            } else {
                // continue reach request from internet network.
                console.log('[service worker] Fetching request from internet.');
                return fetch(e.request);
            }
        }).catch(err => {
            console.log("Error in retrive data from cache :", err);
        })
    )
});