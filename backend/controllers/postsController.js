const { Post } = require("../models");
const { User } = require("../models");
const { Comment } = require("../models");
const PostLike = require("../models/PostLike");

exports.getCommentsForPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.findAll({
      where: { post_id: Number(postId) },
      order: [["created_at", "ASC"]],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username", "full_name", "avatar"],
        },
      ],
    });
    const formatted = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: comment.author ? (comment.author.full_name || comment.author.username) : "Unknown",
      username: comment.author ? comment.author.username || "" : "",
      avatar: comment.author ? comment.author.avatar || "" : "",
      createdAt: comment.created_at,
      parent_id: comment.parent_id,
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch comments.", details: err.message });
  }
};

// POST /api/posts/:postId/like
exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required." });
  }
  try {
    const existing = await PostLike.findOne({ where: { post_id: postId, user_id } });
    if (existing) {
      await existing.destroy();
      return res.json({ liked: false });
    } else {
      await PostLike.create({ post_id: postId, user_id });
      return res.json({ liked: true });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to toggle like.", details: err.message });
  }
};

// GET /api/posts/:postId/likes
exports.getLikes = async (req, res) => {
  const { postId } = req.params;
  const { user_id } = req.query;
  try {
    const count = await PostLike.count({ where: { post_id: postId } });
    let liked = false;
    if (user_id) {
      liked = !!(await PostLike.findOne({ where: { post_id: postId, user_id } }));
    }
    return res.json({ count, liked });
  } catch (err) {
    return res.status(500).json({ error: "Failed to get likes.", details: err.message });
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
          attributes: ["username", "full_name", "avatar"],
        },
      ],
    });
    return res.status(201).json({
      id: commentWithAuthor.id,
      content: commentWithAuthor.content,
      author: commentWithAuthor.author ? (commentWithAuthor.author.full_name || commentWithAuthor.author.username) : "Unknown",
      avatar: commentWithAuthor.author ? commentWithAuthor.author.avatar || "" : "",
      createdAt: commentWithAuthor.created_at,
      parent_id: commentWithAuthor.parent_id,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to add comment.", details: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const { commented_by, liked_by } = req.query;
    let posts;
    const { User, Comment } = require("../models");

    if (commented_by) {
      // Find user by username
      const user = await User.findOne({ where: { username: commented_by } });
      if (!user) {
        return res.json([]);
      }
      // Find all post_ids where user has commented
      const userComments = await Comment.findAll({
        where: { user_id: user.id },
        attributes: ["post_id"],
        group: ["post_id"],
      });
      const postIds = userComments.map((c) => c.post_id);
      if (postIds.length === 0) {
        return res.json([]);
      }
      posts = await Post.findAll({
        where: { id: postIds },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "author",
            attributes: ["username", "full_name", "avatar"],
          },
        ],
      });
    } else if (liked_by) {
      // Find user by username
      const user = await User.findOne({ where: { username: liked_by } });
      if (!user) {
        return res.json([]);
      }
      // Find all post_ids the user has liked
      const likedPosts = await PostLike.findAll({
        where: { user_id: user.id },
        attributes: ["post_id"],
        group: ["post_id"],
      });
      const postIds = likedPosts.map((l) => l.post_id);
      if (postIds.length === 0) {
        return res.json([]);
      }
      posts = await Post.findAll({
        where: { id: postIds },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "author",
            attributes: ["username", "full_name", "avatar"],
          },
        ],
      });
    } else {
      posts = await Post.findAll({
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "author",
            attributes: ["username", "full_name", "avatar"],
          },
        ],
      });
    }

    // Fetch comment counts for all posts in one query
    const postIds = posts.map(post => post.id);
    const commentCountsRaw = await Comment.findAll({
      attributes: [
        "post_id",
        [require("sequelize").fn("COUNT", require("sequelize").col("id")), "count"]
      ],
      where: { post_id: postIds },
      group: ["post_id"]
    });
    const commentCounts = {};
    commentCountsRaw.forEach(row => {
      commentCounts[row.post_id] = parseInt(row.get("count"), 10);
    });

    // Format posts to include author username, comment count, and view count
    const formatted = posts.map(post => ({
      id: post.id,
      content: post.content,
      author: post.author ? (post.author.full_name || post.author.username) : "Unknown",
      username: post.author ? post.author.username || "" : "",
      avatar: post.author ? post.author.avatar || "" : "",
      createdAt: post.created_at,
      commentCount: commentCounts[post.id] || 0,
      viewCount: post.view_count,
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
          attributes: ["username", "full_name", "avatar"],
        },
      ],
    });
    return res.status(201).json({
      id: postWithAuthor.id,
      content: postWithAuthor.content,
      author: postWithAuthor.author ? (postWithAuthor.author.full_name || postWithAuthor.author.username) : "Unknown",
      avatar: postWithAuthor.author ? postWithAuthor.author.avatar || "" : "",
      createdAt: postWithAuthor.created_at,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create post.", details: err.message });
  }
};

/**
 * POST /api/posts/upload-media
 * Handles media file uploads for posts.
 */
exports.uploadMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  // Return the URL to the uploaded file
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({ url: fileUrl });
};

  // POST /api/posts/:postId/view
exports.incrementView = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    await post.increment("view_count");
    await post.reload();
    return res.json({ viewCount: post.view_count });
  } catch (err) {
    return res.status(500).json({ error: "Failed to increment view count.", details: err.message });
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
          attributes: ["username", "full_name", "avatar"],
        },
      ],
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.json({
      id: post.id,
      content: post.content,
      author: post.author ? (post.author.full_name || post.author.username) : "Unknown",
      username: post.author ? post.author.username || "" : "",
      avatar: post.author ? post.author.avatar || "" : "",
      createdAt: post.created_at,
      viewCount: post.view_count,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch post.", details: err.message });
  }
};
