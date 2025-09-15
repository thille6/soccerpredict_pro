// Service Worker för offline-stöd
const CACHE_NAME = 'soccerpredict-pro-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Lägg till andra viktiga resurser här
];

// Installation av service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Aktivering av service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch-händelser för offline-stöd
self.addEventListener('fetch', (event) => {
  // Endast hantera GET-förfrågningar
  if (event.request.method !== 'GET') {
    return;
  }

  // Skippa externa API-anrop och chrome-extension requests
  if (!event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Returnera cachad version om den finns
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }

        // Annars försök hämta från nätverket
        return fetch(event.request)
          .then((response) => {
            // Kontrollera om vi fick ett giltigt svar
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Klona svaret eftersom det är en stream
            const responseToCache = response.clone();

            // Lägg till i cache för framtida användning
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Om nätverket misslyckas, visa offline-sida för navigering
            if (event.request.destination === 'document') {
              return caches.match('/offline.html') || 
                     new Response('Offline - Applikationen är inte tillgänglig utan internetanslutning', {
                       status: 503,
                       statusText: 'Service Unavailable',
                       headers: { 'Content-Type': 'text/plain' }
                     });
            }
            
            // För andra resurser, returnera ett tomt svar
            return new Response('', { status: 404 });
          });
      })
  );
});

// Hantera meddelanden från huvudtråden
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Synkronisering i bakgrunden (för framtida funktioner)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // Här kan vi implementera bakgrundssynkronisering av data
  }
});

// Push-notifikationer (för framtida funktioner)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  // Här kan vi hantera push-notifikationer
});