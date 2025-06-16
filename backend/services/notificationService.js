// backend/services/notificationService.js
const webpush = require('web-push');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn(
    '[Web Push] VAPID keys are missing. Generate them with scripts/generateVapidKeys.js and add to your .env file.'
  );
}

webpush.setVapidDetails(
  'mailto:no-reply@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// DB-backed subscription store
const { PushSubscription } = require("../models");

/**
 * Add or update a user's push subscription in the DB.
 * @param {string|number} userId
 * @param {object} subscription
 */
async function saveSubscription(userId, subscription) {
  if (!userId || !subscription) return;
  const { endpoint, keys } = subscription;
  console.log("[PushSubscription] Received subscription:", subscription);
  if (!endpoint || !keys) return;
  if (!keys.auth || !keys.p256dh) {
    console.error("[PushSubscription] Subscription keys missing 'auth' or 'p256dh':", keys);
    return;
  }
  await PushSubscription.upsert({
    userId,
    endpoint,
    keys,
  });
}

/**
 * Get a user's push subscription from the DB.
 * @param {string|number} userId
 * @returns {Promise<object|null>}
 */
async function getSubscription(userId) {
  if (!userId) return null;
  const sub = await PushSubscription.findOne({ where: { userId } });
  if (!sub) return null;
  return {
    endpoint: sub.endpoint,
    keys: sub.keys,
  };
}

/**
 * Send a push notification to a user.
 * @param {string|number} userId
 * @param {object} payload
 * @returns {Promise}
 */
async function sendNotification(userId, payload) {
  const subscription = await getSubscription(userId);
  if (!subscription) {
    throw new Error('No subscription found for user: ' + userId);
  }
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

/**
 * Send a push notification to multiple users.
 * @param {Array<string|number>} userIds
 * @param {object} payload
 * @returns {Promise[]}
 */
function sendNotificationToUsers(userIds, payload) {
  return userIds.map((id) => sendNotification(id, payload).catch((err) => err));
}

module.exports = {
  saveSubscription,
  getSubscription,
  sendNotification,
  sendNotificationToUsers,
  VAPID_PUBLIC_KEY,
};
