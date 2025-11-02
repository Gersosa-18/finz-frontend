self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || "🔔 Finz", {
      body: data.body || "Nueva alerta",
      icon: "/logo192.png",
      tag: "finz-alert",
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow("/"));
});
