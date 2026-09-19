const CACHE_NAME = 'ausgaben-tracker-v3';
const APP_FILES = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.webmanifest',
  './icons/app-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((saved) => saved || fetch(event.request)));
});
