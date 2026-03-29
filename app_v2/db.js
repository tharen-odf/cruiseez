const DB_NAME = "forest_inventory_db";
const DB_VERSION = 3;
let db;

export function uid() {
    return crypto.randomUUID();
}

export function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
            db = e.target.result;
            if (!db.objectStoreNames.contains("units")) {
                db.createObjectStore("units", { keyPath: "id" });
            }
        };
        req.onsuccess = e => { db = e.target.result; resolve(); };
        req.onerror = e => reject(e.target.error);
    });
}

function tx(store, mode = "readonly") {
    return db.transaction(store, mode).objectStore(store);
}

function idbRequest(req) {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export const dbGet = (store, key) => idbRequest(tx(store).get(key));
export const dbGetAll = store => idbRequest(tx(store).getAll());
export const dbPut = (store, val) => idbRequest(tx(store, "readwrite").put(val));
export const dbAdd = (store, val) => idbRequest(tx(store, "readwrite").add(val));
export const dbDel = (store, key) => idbRequest(tx(store, "readwrite").delete(key));

export function debounce(func, delay) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}