export const initNotifications = async () => {
  if (!("Notification" in window)) return false;

  // Registrar SW
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("/service-worker.js");
  }

  // Pedir permiso
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }

  return Notification.permission === "granted";
};

export const notify = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/logo192.png" });
  }
};
