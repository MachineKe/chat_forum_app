const { Post } = require("../models");
const { User } = require("../models");
const { Comment } = require("../models");

exports.getCommentsForPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.findAll({
      where: { post_id: postId },
      order: [["created_at", "ASC"]],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username"],
        },
      ],
    });
    const formatted = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: comment.author ? comment.author.username : "Unknown",
      createdAt: comment.created_at,
      parent_id: comment.parent_id,
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch comments.", details: err.message });
  }
};

exports.addCommentToPost = async (req, res) => {
  const { postId } = req.params;
  const { user_id, content, parent_id } = req.body;
  if (!user_id || !content) {
    return res.status(400).json({ error: "user_id and content are required." });
  }
  try {
    const comment = await Comment.create({
      post_id: postId,
      user_id,
      content,
      parent_id: parent_id || null,
    });
    // Fetch with author
    const commentWithAuthor = await Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username"],
        },
      ],
    });
    return res.status(201).json({
      id: commentWithAuthor.id,
      content: commentWithAuthor.content,
      author: commentWithAuthor.author ? commentWithAuthor.author.username : "Unknown",
      createdAt: commentWithAuthor.created_at,
      parent_id: commentWithAuthor.parent_id,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to add comment.", details: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username"],
        },
      ],
    });
    // Format posts to include author username
    const formatted = posts.map(post => ({
      id: post.id,
      content: post.content,
      author: post.author ? post.author.username : "Unknown",
      createdAt: post.created_at,
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch posts.", details: err.message });
  }
};

exports.createPost = async (req, res) => {
  const { user_id, content } = req.body;
  if (!user_id || !content) {
    return res.status(400).json({ error: "user_id and content are required." });
  }
  try {
    const post = await Post.create({ user_id, content });
    // Fetch with author
    const postWithAuthor = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username"],
        },
      ],
    });
    return res.status(201).json({
      id: postWithAuthor.id,
      content: postWithAuthor.content,
      author: postWithAuthor.author ? postWithAuthor.author.username : "Unknown",
      createdAt: postWithAuthor.created_at,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create post.", details: err.message });
  }
};

// GET /api/posts/:postId
exports.getPostById = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findOne({
      where: { id: postId },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username"],
        },
      ],
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.json({
      id: post.id,
      content: post.content,
      author: post.author ? post.author.username : "Unknown",
      createdAt: post.created_at,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch post.", details: err.message });
  }
};
