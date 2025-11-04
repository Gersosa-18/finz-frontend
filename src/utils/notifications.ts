import api from "../services/api";

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export const initNotifications = async () => {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    console.log("Push no soportado");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/service-worker.js"
    );
    const permission = await Notification.requestPermission();

    if (permission !== "granted") return false;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await api.post("/notificaciones/suscribir", {
      subscription: subscription.toJSON(),
    });

    console.log("✅ Suscrito a push");
    return true;
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
};

export const notify = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/logo192.png" });
  }
};
