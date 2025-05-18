const CACHE_NAME = 'story-app-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/app.bundle.js', // sesuaikan nama file bundle dari Webpack
];

// Cache file saat service worker terinstall
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ambil dari cache saat offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match('/index.html'); // fallback jika offline
    })
  );
});

// Update cache saat SW diaktifkan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  clients.claim();
});

// Handler untuk pesan push dari server
self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received');
  
  let message = 'New Story has been added!';
  
  try {
    if (event.data) {
      message = event.data.text();
      console.log('[Service Worker] Push message data:', message);
    }
  } catch (e) {
    console.error('[Service Worker] Error parsing push data:', e);
  }

  event.waitUntil(
    self.registration.showNotification('📢 Story App', {
      body: message,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      requireInteraction: true
    })
  );
});


// ✅ Tambahkan ini:
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title || 'Story App', {
      body: event.data.body || 'Notification from Story App',
      icon: '/icons/icon-192.png',
      requireInteraction: event.data.requireInteraction || false,
    });
  }
});

// Opsional: jika ingin handle klik notifikasi
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received');
  
  event.notification.close();
  
  // Buka jendela browser atau fokus jika sudah terbuka
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});