const CACHE_NAME = 'forest-inventory-v1';
const ASSETS = [
    './index.html',
    './db.js',
    './styles.css',
    './components/Units.js',
    './components/Unit.js',
    './components/Plots.js',
    './components/Designs.js',
    './components/Trees.js',
    './components/Logs.js',
    './manifest.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/vue@3/dist/vue.global.prod.js'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});