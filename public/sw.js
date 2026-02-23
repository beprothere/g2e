const CACHE_NAME = "g2e-cache-v4";
const urlsToCache = [
  "/manifest.json",
  "/img/g2eappicon192.png",
  "/img/g2eappicon512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Keep admin and API traffic fully network-native for lowest TTFB/LCP.
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/"))
  ) {
    return;
  }

  // Navigation requests should be network-first so users don't get stale HTML/app shells.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(async () => {
          const cached = await caches.match(event.request);
          return (
            cached ||
            new Response("Offline", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          );
        }),
    );
    return;
  }

  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/img/") ||
      url.pathname === "/manifest.json" ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".jpg") ||
      url.pathname.endsWith(".jpeg") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".ico"));

  if (!isStaticAsset) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const networkFetch = fetch(event.request)
        .then((response) => {
          cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    }),
  );
});

self.addEventListener("push", function (event) {
  let data = { title: "Glow2Earn", body: "New update available!" };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Glow2Earn", body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: "/img/g2eappicon192.png",
    badge: "/img/g2eappicon192.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/"
    },
    actions: [
      { action: 'open', title: 'View Details' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
