importScripts("/src/js/idb.js");
importScripts("/src/js/utilitiy.js");
const CACHE_STATIC_NAME = 'static-v2';
const CACHE_DYNAMIC_NAME = 'dynamic-v2';


self.addEventListener("install", (e) => {
    // store pre-cache
    e.waitUntil(
        caches.open(CACHE_STATIC_NAME).then(cache => {
            cache.add('/');
            cache.add('/index.html');
            cache.add('/offline.htm');
            cache.add('/src/js/app.js');
            cache.add('/src/js/idb.js');
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
            console.log("[SW-error in ServiceWorker.js in install event]", err);
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
        }).catch(err => {
            console.log("[SW-error in ServiceWorker.js in activate event]", err);
        })
    );
    console.log("[service worker] Service worker is activated successfully and cache is cleared successfully :)");
});

/**
 * trimCache function used to remove over elements in cache according specific length.
 * @param {*} cacheName 
 * @param {*} maxLen 
 */
function trimCache(cacheName, maxLen) {
    caches.open(cacheName).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > maxLen) {
                cache.delete(keys[0]).then(() => trimCache(cacheName, maxLen));
            }
        })
    })
}

// this event will fire when we are online
self.addEventListener('sync', (e) => {
    console.log("[Service Worker] Background Syncing...");

    if (e.tag === "sync-new-post") {
        var urlCreatePost = 'http://localhost:9000/create/post';

        readAll("sync-posts").then(data => {
            for (const dt of data) {
                var post = {
                    id: dt.id,
                    title: dt.title,
                    location: dt.location,
                    image: "/src/images/alex.jpeg"
                };
                fetch(urlCreatePost, {
                    method: 'POST',
                    body: JSON.stringify(post),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }).then(res => {
                    if (res.ok) {
                        console.log("[SW] Sync function work successfully");
                        removeOneById("sync-posts", dt.id)
                    }
                }).catch(err => {
                    console.log("[SW] Sync function has Error :", err);
                })
            }
        }).catch(err => {
            console.log("[SW] Error in SYNC EVENT :", err)
        })
    }
});

self.addEventListener('fetch', (e) => {
    var url = 'http://localhost:9000/posts';
    e.respondWith(
        fetch(url).then(response => {
            let cloneResponse = response.clone();
            clearStore("posts").then(() => {
                return cloneResponse.json();
            }).then(data => {
                data = data?.posts;
                for (const key in data) {
                    writeDate('posts', data[key]);
                    // .then(() => {
                    //     removeOneById("posts",key);
                    // })
                }
            }).catch(err => {
                console.log("[SW-error in ServiceWorker.js in fetch event]", err);
            });
            return response;
        }).catch(err => {
            console.log("[SW] fetch function has Error :", err);
        })
    );
});

// react with user actions on notifications
self.addEventListener('notificationclick', e => {
    // declatation ..
    let notification = e.notification;
    let action = e.action;
    console.log("Notification : ", notification);
    if (action === 'confirm') {
        console.log("[SW] user click OK");
    } else {
        console.log("[SW] user click cancel");
    }
});

// listen for incomming notifications from back-end
self.addEventListener("push", (e) => {
    let data = { title: 'New!', content: "Something New happened!" };

    if (e.data) {
        data = JSON.parse(e.data.text());
    };
    let options = {
        body: data.content
    };
    e.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

/** // Cache with network fallback strategy
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
                        trimCache(CACHE_DYNAMIC_NAME, 3);
                        return response;
                    })
                }).catch(err => {
                    // not internet and page is not caced return offline error page
                    console.log("breakpoint1012");
                    return caches, open(CACHE_STATIC_NAME).then(cache => {
                        return cache.match('/offline.htm');
                    });
                });
            }
        }).catch(err => {
            console.log("Error in retrive data from cache :", err);
        })
    )
});
*/

/** // Cache-only Strategy
self.addEventListener("fetch", e => {
    e.responseWith(
        caches.match(e.request)
    );
});
 */

/** // Network-only Strategy
self.addEventListener("fetch", e => {
    e.responseWith(
        fetch(e.request)
    );
});
 */

/** //Network with cache fallback strategy
self.addEventListener("fetch", e => {
    e.responseWith(
        fetch(e.request).then(res => {
            return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                cache.put(e.request, res.clone());
                return res;
            });
        }).catch(err => {
            return caches.match(e.request);
        })
    );
});
 */

/** // Cache then network strategy.
self.addEventListener("fetch", e => {
    let url = 'https://httpbin.org/get';
    if (e.request.url.indexOf(url) > -1) {
        e.responseWith(
            caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                return fetch(e.request).then(res => {
                    cache.put(e.request, res.clone());
                    return res;
                });
            })
        );
    } else {
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
                        // not internet and page is not caced return offline error page
                        console.log("breakpoint1012");
                        return caches, open(CACHE_STATIC_NAME).then(cache => {
                            return cache.match('/offline.htm');
                        });
                    });
                }
            }).catch(err => {
                console.log("Error in retrive data from cache :", err);
            })
        )
    }
})
 */