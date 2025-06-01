const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");

// Create a new message
router.post("/", messagesController.createMessage);

// Get all messages (optionally filter by chat, sender, receiver)
router.get("/", messagesController.getMessages);

// Get latest message per user (for chat list preview)
router.get("/latest-per-user", messagesController.getLatestMessagesPerUser);

// Get a single message by ID
router.get("/:id", messagesController.getMessageById);

// Update a message
router.put("/:id", messagesController.updateMessage);

// Delete a message
router.delete("/:id", messagesController.deleteMessage);

module.exports = router;
