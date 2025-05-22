const { CommentLike } = require("../models");
const { User } = require("../models");

exports.toggleLike = async (req, res) => {
  const { commentId } = req.params;
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required." });
  }
  try {
    const existing = await CommentLike.findOne({ where: { comment_id: commentId, user_id } });
    if (existing) {
      await existing.destroy();
      return res.json({ liked: false });
    } else {
      await CommentLike.create({ comment_id: commentId, user_id });
      return res.json({ liked: true });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to toggle like.", details: err.message });
  }
};

exports.getLikes = async (req, res) => {
  const { commentId } = req.params;
  const { user_id } = req.query;
  try {
    const count = await CommentLike.count({ where: { comment_id: commentId } });
    let liked = false;
    if (user_id) {
      liked = !!(await CommentLike.findOne({ where: { comment_id: commentId, user_id } }));
    }
    return res.json({ count, liked });
  } catch (err) {
    return res.status(500).json({ error: "Failed to get likes.", details: err.message });
  }
};
