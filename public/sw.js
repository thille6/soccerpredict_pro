// Service Worker för offline-stöd med aggressiv cache-busting
const CACHE_NAME = 'soccerpredict-pro-v4-' + Date.now();
const STATIC_CACHE = 'soccerpredict-static-v4-' + Date.now();
const JS_CACHE = 'soccerpredict-js-v4-' + Date.now();

const urlsToCache = [
  '/soccerpredict_pro/',
  '/soccerpredict_pro/index.html',
  '/soccerpredict_pro/manifest.json',
];

// Hjälpfunktion för att identifiera JavaScript-filer
function isJavaScriptAsset(url) {
  return url.includes('/assets/') && (url.endsWith('.js') || url.includes('index-') && url.includes('.js'));
}

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
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== JS_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete - Force claiming all clients');
      return self.clients.claim();
    })
  );
});

// Fetch-händelser med specialiserad cache-strategi
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

  const url = event.request.url;
  
  // Specialhantering för JavaScript-assets - ALDRIG cache för index-*.js
  if (isJavaScriptAsset(url)) {
    console.log('Service Worker: JavaScript asset detected, forcing network fetch', url);
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response && response.status === 200) {
            console.log('Service Worker: Fresh JS from network', url);
            // Cacha INTE index-*.js filer alls
            if (!url.includes('index-')) {
              const responseToCache = response.clone();
              caches.open(JS_CACHE).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          }
          return response;
        })
        .catch(() => {
          // Endast fallback för icke-index JS-filer
          if (!url.includes('index-')) {
            return caches.match(event.request);
          }
          return new Response('', { status: 404 });
        })
    );
    return;
  }

  // Standard network-first för andra resurser
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          console.log('Service Worker: Serving from network', url);
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              console.log('Service Worker: Serving from cache (fallback)', url);
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
    console.log('Service Worker: Force skipping waiting');
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Service Worker: Clearing all caches');
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    });
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