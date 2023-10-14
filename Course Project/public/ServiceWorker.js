const CACHE_STATIC_NAME = 'static-v1';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';

self.addEventListener("install", (e) => {
    // store pre-cache
    e.waitUntil(
        caches.open(CACHE_STATIC_NAME).then(cache => {
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
            console.log("[service worker] Service worker is installed successfully and pre-cache Also :)");
        }).catch(err => {
            console.log("Error in store pre-cache : ", err);
        })
    );
});

self.addEventListener("activate", (e) => {
    // clear up our cache
    e.waitUntil(
        caches.keys().then(keylist => {
            return Promise.all(keylist.map(key => {
                if (key !== CACHE_DYNAMIC_NAME && key !== CACHE_STATIC_NAME)
                    return caches.delete(key);
            }));
        }).catch(err => console.log("Error in clear up cache :", err))
    );
    console.log("[service worker] Service worker is activated successfully and cache is cleared successfully :)");
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
                return fetch(e.request).then(response => {
                    // add dynamic cache
                    return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                        cache.put(e.request.url, response.clone());
                        return response;
                    })
                }).catch(err => {
                    console.log("Error in store data from dynamic cache :", err);
                });
            }
        }).catch(err => {
            console.log("Error in retrive data from cache :", err);
        })
    )
});