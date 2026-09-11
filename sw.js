const CACHE_NAME = 'bill-gen-v18'; //  v18  v19
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './style.css',
  './script.js',
  './update.js',                    //  Update popup system
  './bills-history-actions.js',     //  Delete system
  './bills-edit-actions.js',        //  Edit system
  './bills-download-actions.js',    //  Download History
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11'  //  SweetAlert2 (offline bhi popups!)
];


// 1. Cache assets on install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Clear old caches on activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Old cache deleted:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Network first, fallback to cache (Online = fresh, Offline = cache)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});