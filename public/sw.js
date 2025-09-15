// Service Worker för offline-stöd med network-first strategi
const CACHE_NAME = 'soccerpredict-pro-v3-' + Date.now();
const urlsToCache = [
  '/soccerpredict_pro/',
  '/soccerpredict_pro/index.html',
  '/soccerpredict_pro/manifest.json',
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

// Fetch-händelser med network-first strategi
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
    fetch(event.request)
      .then((response) => {
        // Om nätverket fungerar, använd det och uppdatera cache
        if (response && response.status === 200) {
          console.log('Service Worker: Serving from network', event.request.url);
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        }
        return response;
      })
      .catch(() => {
        // Om nätverket misslyckas, försök cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              console.log('Service Worker: Serving from cache (fallback)', event.request.url);
              return response;
            }
            // Fallback för navigation
            if (event.request.destination === 'document') {
              return caches.match('/soccerpredict_pro/index.html') || 
                     new Response('Offline - Applikationen är inte tillgänglig utan internetanslutning', {
                       status: 503,
                       statusText: 'Service Unavailable',
                       headers: { 'Content-Type': 'text/plain' }
                     });
            }
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