self.addEventListener("install", (e) => {
    console.log("[service worker] Service worker is installed successfully :)");
});


self.addEventListener("activate", (e) => {
    console.log("[service worker] Service worker is activated successfully :)");
});


self.addEventListener('fetch', (e) => {
    console.log('[service worker] Fetching something ...')
})