self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || "🔔 Finz", {
      body: data.body || "Nueva alerta",
      icon: "/logo192.png",
      badge: "/logo192.png",
      tag: "finz-alert",
      requireInteraction: true,
      data: { url: "/" },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || "/"));
});

// Mantener el SW activo
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});
