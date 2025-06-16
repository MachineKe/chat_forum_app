// backend/routes/notifications.js
const express = require('express');
const {
  saveSubscription,
  sendNotificationToUsers,
  VAPID_PUBLIC_KEY,
} = require('../services/notificationService');

const router = express.Router();

/**
 * Get the VAPID public key for the client.
 */
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

/**
 * Subscribe endpoint: stores a user's push subscription.
 * Expects: { userId, subscription }
 */
router.post('/subscribe', async (req, res) => {
  const { userId, subscription } = req.body;
  if (!userId || !subscription) {
    return res.status(400).json({ error: 'userId and subscription are required.' });
  }
  try {
    await saveSubscription(userId, subscription);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Failed to save push subscription:", err);
    res.status(500).json({ error: "Failed to save push subscription" });
  }
});

/**
 * Notify endpoint: triggers a push notification to one or more users.
 * Expects: { userIds, title, body, senderName, preview }
 */
router.post('/notify', async (req, res) => {
  const { userIds, title, body, senderName, preview } = req.body;
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'userIds (array) is required.' });
  }
  if (!title || !body || !senderName || !preview) {
    return res.status(400).json({ error: 'title, body, senderName, and preview are required.' });
  }

  const payload = {
    title,
    body,
    senderName,
    preview,
    timestamp: Date.now(),
  };

  const results = await Promise.all(
    userIds.map((id) =>
      sendNotificationToUsers([id], payload)
    )
  );

  res.json({ success: true, results });
});

module.exports = router;
