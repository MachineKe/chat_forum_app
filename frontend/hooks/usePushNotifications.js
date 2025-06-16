// frontend/hooks/usePushNotifications.js
import { useEffect, useCallback } from "react";
import { urlBase64ToUint8Array } from "../utils/vapid";
import { apiFetch } from "../utils/api";

/**
 * Custom hook to handle push notification registration and subscription.
 * @param {string} userId - The current user's ID.
 * @param {string} vapidPublicKey - The VAPID public key from the backend.
 */
export default function usePushNotifications(userId, vapidPublicKey) {
  const subscribeUser = useCallback(async () => {
    console.log("[PushNotifications] subscribeUser called with", { userId, vapidPublicKey });

    if (!userId || !vapidPublicKey) {
      console.log("[PushNotifications] Skipping: userId or vapidPublicKey missing", { userId, vapidPublicKey });
      return;
    }

    if (!("serviceWorker" in navigator)) {
      console.warn("Service workers are not supported in this browser.");
      return;
    }
    if (!("PushManager" in window)) {
      console.warn("Push notifications are not supported in this browser.");
      return;
    }
    const isDev =
      (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.MODE === "development") ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (window.location.protocol !== "https:" && !isDev) {
      alert("Push notifications require HTTPS in production.");
      return;
    }

    try {
      console.log("[PushNotifications] Registering service worker...");
      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("[PushNotifications] Service worker registered:", registration);

      // Request notification permission
      if (Notification.permission === "default") {
        console.log("[PushNotifications] Requesting notification permission...");
        const permission = await Notification.requestPermission();
        console.log("[PushNotifications] Notification permission result:", permission);
        if (permission !== "granted") {
          console.warn("Notification permission denied.");
          return;
        }
      } else if (Notification.permission === "denied") {
        console.warn("Notification permission previously denied.");
        return;
      } else {
        console.log("[PushNotifications] Notification permission already granted.");
      }

      // Subscribe to push
      console.log("[PushNotifications] Calling registration.pushManager.subscribe...");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      console.log("[PushNotifications] Push subscription object:", subscription);

      // Send subscription to backend
      console.log("[PushNotifications] Sending subscription to backend...", { userId, subscription });
      await apiFetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          subscription,
        }),
      });
      console.log("Push subscription registered and sent to backend.");
    } catch (err) {
      console.error("Push notification setup failed:", err);
    }
  }, [userId, vapidPublicKey]);

  useEffect(() => {
    if (userId && vapidPublicKey) {
      subscribeUser();
    }
  }, [userId, vapidPublicKey, subscribeUser]);
}
