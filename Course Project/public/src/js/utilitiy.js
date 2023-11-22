// prepare idb object ot connect indexDB.
const idbPromise = idb.open("posts-store", 1, (db) => {
    // check if table is not exist
    if (!db.objectStoreNames.contains('posts')) {
        // create table
        db.createObjectStore('posts', { keyPath: 'id' });
    }
    // check if table is not exist - for syncing data on it
    if (!db.objectStoreNames.contains('sync-posts')) {
        // create table
        db.createObjectStore('sync-posts', { keyPath: 'id' });
    }
});

function writeDate(store, data) {
    return idbPromise.then(db => {
        // prepare transaction
        let tx = db.transaction(store, 'readwrite');
        let _store = tx.objectStore(store);
        _store.put(data);
        return tx.complete;
    }).catch(err => {
        console.log("[indexDB in utility.js in writeData]", err);
    });
}

function readAll(store) {
    return idbPromise.then(db => {
        // prepare transaction
        let tx = db.transaction(store, 'readonly');
        let _store = tx.objectStore(store);
        return _store.getAll();
    }).catch(err => {
        console.log("[indexDB in utility.js in readAll]", err);
    });
}

function clearStore(store) {
    return idbPromise.then(db => {
        // prepare transaction
        let tx = db.transaction(store, 'readwrite');
        let _store = tx.objectStore(store);
        _store.clear();
        return tx.complete;
    }).catch(err => {
        console.log("[indexDB in utility.js in clearStore]", err);
    });
}

function removeOneById(store, id) {
    idbPromise.then(db => {
        // prepare transaction
        let tx = db.transaction(store, 'readwrite');
        let _store = tx.objectStore(store);
        _store.delete(id);
        return tx.complete;
    }).catch(err => {
        console.log("[indexDB in utility.js in removeOneById]", err);
    });
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  }