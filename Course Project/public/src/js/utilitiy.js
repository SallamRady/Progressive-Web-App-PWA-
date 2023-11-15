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