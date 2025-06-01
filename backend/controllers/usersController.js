const { User } = require("../models");

// Utility: emit userListUpdate event
async function emitUserListUpdate(io) {
  if (!io) return;
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
    order: [["full_name", "ASC"]],
  });
  io.emit("userListUpdate", users);
}

// Get all users (for contact list, admin, etc.)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["full_name", "ASC"]],
    });
    // Emit userListUpdate for real-time sync
    const io = req.app.get("io");
    if (io) {
      io.emit("userListUpdate", users);
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
};
