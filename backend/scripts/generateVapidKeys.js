// VAPID key generation snippet for Web Push API
// Run: node backend/scripts/generateVapidKeys.js

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Public Key:', vapidKeys.publicKey);
console.log('VAPID Private Key:', vapidKeys.privateKey);
