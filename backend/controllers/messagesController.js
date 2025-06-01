const { Message } = require("../models");

/**
 * Create a new message
 * Accepts: content, media_id, media_type, media_title, media_src, media_path, thumbnail, parent_id, sender_id, receiver_id
 */
exports.createMessage = async (req, res) => {
  try {
    const {
      content,
      media_id,
      media_type,
      media_title,
      media_src,
      media_path,
      thumbnail,
      parent_id,
      sender_id,
      receiver_id,
    } = req.body;
    const message = await Message.create({
      content,
      media_id,
      media_type,
      media_title,
      media_src,
      media_path,
      thumbnail,
      parent_id,
      sender_id,
      receiver_id,
    });
    // Emit updated messages for this conversation
    const io = req.app.get("io");
    if (io && sender_id && receiver_id) {
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { sender_id, receiver_id },
            { sender_id: receiver_id, receiver_id: sender_id }
          ]
        },
        order: [["created_at", "ASC"]],
      });
      console.log("Emitting messageUpdate", { sender_id, receiver_id, messagesCount: messages.length });
      io.emit("messageUpdate", {
        sender_id,
        receiver_id,
        messages,
      });
    }
    // Emit chat list update for all clients
    if (io) {
      io.emit("chatListUpdate");
    }
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to create message", details: err.message });
  }
};

const { Op } = require("sequelize");
// Get all messages (optionally by chat or user)
exports.getMessages = async (req, res) => {
  try {
    // Optionally filter by chat, sender, or receiver
    const { chat_id, sender_id, receiver_id } = req.query;
    let where = {};
    if (chat_id) where.chat_id = chat_id;
    // If both sender_id and receiver_id are provided, fetch conversation between both users
    if (sender_id && receiver_id) {
      where = {
        [Op.or]: [
          { sender_id, receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id }
        ]
      };
    } else {
      if (sender_id) where.sender_id = sender_id;
      if (receiver_id) where.receiver_id = receiver_id;
    }
    const messages = await Message.findAll({ where, order: [["created_at", "ASC"]] });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages", details: err.message });
  }
};

// Get a single message by ID
exports.getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch message", details: err.message });
  }
};

// Update a message
exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, media_id, media_type, media_title, media_src, thumbnail } = req.body;
    const message = await Message.findByPk(id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    await message.update({ content, media_id, media_type, media_title, media_src, thumbnail });
    // Emit updated messages for this receiver
    const io = req.app.get("io");
    if (io && message.receiver_id) {
      const messages = await Message.findAll({
        where: { receiver_id: message.receiver_id },
        order: [["created_at", "ASC"]],
      });
      io.emit("messageUpdate", messages);
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to update message", details: err.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id);
    if (!message) return res.status(404).json({ error: "Message not found" });
    const receiver_id = message.receiver_id;
    await message.destroy();
    // Emit updated messages for this receiver
    const io = req.app.get("io");
    if (io && receiver_id) {
      const messages = await Message.findAll({
        where: { receiver_id },
        order: [["created_at", "ASC"]],
      });
      io.emit("messageUpdate", messages);
    }
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message", details: err.message });
  }
};

const { User } = require("../models");

exports.getLatestMessagesPerUser = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    // Find all users except the current user
    const users = await User.findAll({
      where: { id: { [Op.ne]: user_id } },
      attributes: { exclude: ["password"] },
      order: [["full_name", "ASC"]],
    });

    // For each user, find the latest message exchanged with the current user
    const MessageModel = require("../models").Message;
    const results = await Promise.all(
      users.map(async (user) => {
        const latestMsg = await MessageModel.findOne({
          where: {
            [Op.or]: [
              { sender_id: user_id, receiver_id: user.id },
              { sender_id: user.id, receiver_id: user_id },
            ],
          },
          order: [["created_at", "DESC"]],
        });
        return {
          ...user.toJSON(),
          lastMessage: latestMsg ? latestMsg.content : null,
          lastMessageTime: latestMsg ? latestMsg.created_at : null,
        };
      })
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch latest messages", details: err.message });
  }
};
