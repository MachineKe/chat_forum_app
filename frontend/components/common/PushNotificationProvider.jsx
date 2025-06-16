// frontend/components/common/PushNotificationProvider.jsx
import React from "react";
import useUser from "../../hooks/useUser";
import useVapidPublicKey from "../../hooks/useVapidPublicKey";
import usePushNotifications from "../../hooks/usePushNotifications";

/**
 * Component to enable push notifications for the logged-in user.
 * Should be mounted after login.
 */
export default function PushNotificationProvider() {
  const { userId, loading } = useUser(); // useUser returns userId, not user object
  const vapidPublicKey = useVapidPublicKey();

  console.log("[PushNotificationProvider] userId:", userId);
  console.log("[PushNotificationProvider] loading:", loading);
  console.log("[PushNotificationProvider] vapidPublicKey:", vapidPublicKey);

  // Only run push notifications when userId is available and not loading
  usePushNotifications(!loading ? userId : null, vapidPublicKey);

  return null; // No UI
}
