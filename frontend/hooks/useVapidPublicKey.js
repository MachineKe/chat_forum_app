// frontend/hooks/useVapidPublicKey.js
import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

/**
 * Custom hook to fetch the VAPID public key from the backend.
 * @returns {string|null}
 */
export default function useVapidPublicKey() {
  const [vapidKey, setVapidKey] = useState(null);

  useEffect(() => {
    apiFetch("/api/notifications/vapid-public-key")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch VAPID public key");
        const data = await res.json();
        setVapidKey(data.publicKey);
      })
      .catch((err) => {
        console.error("Failed to fetch VAPID public key:", err);
        setVapidKey(null);
      });
  }, []);

  return vapidKey;
}
