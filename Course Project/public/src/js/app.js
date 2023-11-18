// Declaration variables..
let installPrompt;
let enableNotificationsBtns = document.querySelectorAll('.enable-notifications');


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

window.addEventListener('beforeintallpromot', (e) => {
    e.preventDefault();
    installPrompt = e;
    return null;
});


// display notification
function displayNotification(title, body) {
    // send notifivation via service worker
    if ('serviceWorker' in navigator) {
        let options = {
            body,
            icon: '/src/images/icons/app-icon-96x96.png',
            image: '/src/images/cairo.jpg',
            dir: 'ltr',
            lang: 'en-US',
            vibrate: [100, 50, 200],
            badge: '/src/images/icons/app-icon-96x96.png',
            tag: "confirm-notification",
            renotify: true,
            actions: [
                {
                    action: "confirm",
                    title: "OK!",
                    icon: "/src/images/icons/app-icon-96x96.png"
                },
                {
                    action: "cancel",
                    title: "Cancel",
                    icon: "/src/images/icons/app-icon-96x96.png"
                },
            ]
        };
        navigator.serviceWorker.ready.then(sw => {
            sw.showNotification(title, options)
        }).catch(err => console.log("Error during SW ready :", err))
    }

    // send notifications via normal js
    // let options = {
    //     body
    // };
    // new Notification(title, options);
}
// push notifications using subscription
function configurePushSubscription() {
    if (!('serviceWorker' in navigator)) return;

    let sw;
    navigator.serviceWorker.ready.then(_sw => {
        sw = _sw;
        return _sw.pushManager.getSubscription();
    }).then(subscription => {
        // check if subscription is not found create new one.
        console.log("subscription : ",subscription)
        if (subscription === null) {
            let publicKey = `BN9LQCggbHNq7a1nSAv2UCVQ5xF9oc2IBrRVL1pqpIdYdDI-pOd0kICULtcvs2ws2N4BHFuOdSHpeqidK2N56qY`;
            let convertedPublicKey = urlBase64ToUint8Array(publicKey);
            // create a subscription
            return sw.pushManager.subscribe({
                userVisibleOnly:true,
                applicationServerKey:convertedPublicKey
            }); 
        } else {
            console.log("user has a subscription");
        }
    }).then(newSubscription => {
        console.log("new subscription",newSubscription)
        var urlCreateSubscription = 'http://localhost:9000/create/subscription';
        return fetch(urlCreateSubscription, {
            method: 'POST',
            body: JSON.stringify(newSubscription),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
    }).then(res => {
        if (res.ok) {
            console.log("SubScription Created Successfully :)",res);
            displayNotification('SubScription Created Successfully :)', 'You successfully subscribed in a new Subscription');
        }
    }).then(err => {
        console.log("There is an error in config a subscription:", err);
    })
}


// Ask user permission for push notifications.
function askNotificationsPermission() {
    Notification.requestPermission((result) => {
        if (result !== 'granted') {
            console.log("User Block Notifications");
        } else {
            configurePushSubscription();
        }
    });
};
// check if browser support notification
if ('Notification' in window) {
    for (let i = 0; i < enableNotificationsBtns.length; i++) {
        enableNotificationsBtns[i].style.display = 'inline-block';
        enableNotificationsBtns[i].addEventListener('click', askNotificationsPermission)
    }
}