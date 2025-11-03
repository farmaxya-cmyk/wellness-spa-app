const CACHE_NAME = 'wellness-spa-cache-v2'; // Increment version to trigger update
const urlsToCache = [
  './',
  './index.html',
  './pharmacy.html',
  './music.html',
  './manifest.json',
  './images/icons/icon-192.png',
  './images/icons/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://unpkg.com/react@18.2.0/umd/react.development.js',
  'https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://files.catbox.moe/zc81yy.mp3'
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache resources during install:', err);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // For external resources like from unpkg or googleapis, use a cache-first or network-first strategy
  if (event.request.url.startsWith('http')) {
      event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
          return cache.match(event.request).then(response => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
              // Check if we received a valid response to cache
              if(networkResponse && networkResponse.status === 200) {
                 cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
            // Return cached response if available, otherwise fetch from network
            return response || fetchPromise;
          });
        })
      );
  } else {
    // For local assets, stick with the original strategy
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          }
          return fetch(event.request);
        }
      )
    );
  }
});


// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
