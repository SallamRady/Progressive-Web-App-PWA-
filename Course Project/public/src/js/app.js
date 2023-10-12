// Declaration variables..
let installPrompt;

// check if browser support service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/ServiceWorker.js").then(() => {
        console.log("Service worker registered successfully :)");
    }).catch(err => {
        console.log("Error in register SW :", err);
    });
} else {
    console.log("Browser don't support service worker")
}

window.addEventListener('beforeintallpromot',(e)=>{
    e.preventDefault();
    installPrompt = e;
    return null;
});