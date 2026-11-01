// Self-unregistering service worker to clear any stale dev worker registrations
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.registration.unregister()
  );
});
