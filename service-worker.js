self.addEventListener("install", (event) => {
  console.log("[SW] Installed");
  // self.skipWaiting(); // ❌ don’t force immediate activation
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // ✅ Pass all fetch requests directly to the network
  event.respondWith(fetch(event.request));
});
