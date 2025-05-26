const { Post } = require("../models");
const { User } = require("../models");
const { Comment } = require("../models");
const PostLike = require("../models/PostLike");
const path = require("path");

exports.getCommentsForPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const { Comment, User, Media } = require("../models");
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

    // Fetch all media for comments in one query
    const mediaIds = comments.map(c => c.media_id).filter(Boolean);
    let mediaMap = {};
    if (mediaIds.length > 0) {
      const mediaRecords = await Media.findAll({ where: { id: mediaIds } });
      mediaMap = Object.fromEntries(mediaRecords.map(m => [m.id, m]));
    }

    const formatted = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: comment.author ? (comment.author.full_name || comment.author.username) : "Unknown",
      username: comment.author ? comment.author.username || "" : "",
      avatar: comment.author ? comment.author.avatar || "" : "",
      createdAt: comment.created_at,
      parent_id: comment.parent_id,
      media: comment.media_id && mediaMap[comment.media_id]
        ? {
            id: mediaMap[comment.media_id].id,
            url: mediaMap[comment.media_id].url,
            type: mediaMap[comment.media_id].type,
            filename: mediaMap[comment.media_id].filename,
          }
        : null,
      media_type: comment.media_type || (comment.media_id && mediaMap[comment.media_id] ? mediaMap[comment.media_id].type : null),
      media_path: comment.media_path || (comment.media_id && mediaMap[comment.media_id] ? mediaMap[comment.media_id].url : null)
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
  const { user_id, content, parent_id, media_id, media_type, media_path } = req.body;
  if (!user_id || !content) {
    return res.status(400).json({ error: "user_id and content are required." });
  }

  // Helper to clean content and set media marker (same as in createPost)
  function parseContentAndMedia(content, media_type, media_path) {
    let text = content || "";
    let type = media_type || null;
    let path = media_path || null;

    // If content contains media HTML, extract type/path
    const audioRegex = /<audio[^>]*src="([^"]+)"[^>]*>/i;
    const videoRegex = /<video[^>]*src="([^"]+)"[^>]*>/i;
    const pdfRegex = /<embed[^>]*type="application\/pdf"[^>]*src="([^"]+)"[^>]*>/i;
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/i;

    if (audioRegex.test(text)) {
      const match = text.match(audioRegex);
      type = "audio";
      path = match[1];
      text = ""; // Remove marker from content
    } else if (videoRegex.test(text)) {
      const match = text.match(videoRegex);
      type = "video";
      path = match[1];
      text = "";
    } else if (pdfRegex.test(text)) {
      const match = text.match(pdfRegex);
      type = "pdf";
      path = match[1];
      text = "";
    } else if (imgRegex.test(text)) {
      const match = text.match(imgRegex);
      type = "image";
      path = match[1];
      text = "";
    } else if (type && path) {
      // If type/path provided, leave text as is (no marker)
    } else {
      // Remove any HTML tags, keep only text
      text = text.replace(/<[^>]+>/g, "").trim();
    }
    // Remove any "+ audio", "+ video", "+ pdf" markers from text
    text = text.replace(/^\s*\+\s*(audio|video|pdf)\s*$/i, "").trim();
    return { text, type, path };
  }

  try {
    let finalMediaType = media_type;
    let finalMediaPath = media_path;

    // If media_id is provided, fetch media info
    let resolvedMediaId = media_id || null;
    if (media_id && (!media_type || !media_path)) {
      const Media = require("../models/Media");
      const media = await Media.findByPk(media_id);
      if (media) {
        finalMediaType = media.type && media.type.startsWith("audio") ? "audio"
          : media.type && media.type.startsWith("video") ? "video"
          : media.type && media.type.startsWith("image") ? "image"
          : media.type === "application/pdf" ? "pdf"
          : null;
        finalMediaPath = media.url;
      }
    }

    // Clean content and set marker
    const { text, type, path } = parseContentAndMedia(content, finalMediaType, finalMediaPath);

    const comment = await Comment.create({
      post_id: postId,
      user_id,
      content: text,
      parent_id: parent_id || null,
      media_id: resolvedMediaId,
      media_type: type,
      media_path: path
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
      media_id: commentWithAuthor.media_id,
      media_type: commentWithAuthor.media_type,
      media_path: commentWithAuthor.media_path
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

    // Fetch media for all posts in one query
    const Media = require("../models/Media");
    const mediaIds = posts.map(post => post.media_id).filter(Boolean);
    let mediaMap = {};
    if (mediaIds.length > 0) {
      const mediaRecords = await Media.findAll({ where: { id: mediaIds } });
      mediaMap = Object.fromEntries(mediaRecords.map(m => [m.id, m]));
    }

    // Format posts to include author username, comment count, view count, and media
    const formatted = posts.map(post => ({
      id: post.id,
      content: post.content,
      author: post.author ? (post.author.full_name || post.author.username) : "Unknown",
      username: post.author ? post.author.username || "" : "",
      avatar: post.author ? post.author.avatar || "" : "",
      createdAt: post.created_at,
      commentCount: commentCounts[post.id] || 0,
      viewCount: post.view_count,
      media: post.media_id && mediaMap[post.media_id]
        ? {
            id: mediaMap[post.media_id].id,
            url: mediaMap[post.media_id].url,
            type: mediaMap[post.media_id].type,
            filename: mediaMap[post.media_id].filename,
          }
        : null,
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch posts.", details: err.message });
  }
};

exports.createPost = async (req, res) => {
  const { user_id, content, media_id, media_type, media_path } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required." });
  }

  // Helper to clean content and set media marker
  function parseContentAndMedia(content, media_type, media_path) {
    let text = content || "";
    let type = media_type || null;
    let path = media_path || null;

    // If content contains media HTML, extract type/path
    const audioRegex = /<audio[^>]*src="([^"]+)"[^>]*>/i;
    const videoRegex = /<video[^>]*src="([^"]+)"[^>]*>/i;
    const pdfRegex = /<embed[^>]*type="application\/pdf"[^>]*src="([^"]+)"[^>]*>/i;
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/i;

    if (audioRegex.test(text)) {
      const match = text.match(audioRegex);
      type = "audio";
      path = match[1];
      text = ""; // Remove marker from content
    } else if (videoRegex.test(text)) {
      const match = text.match(videoRegex);
      type = "video";
      path = match[1];
      text = "";
    } else if (pdfRegex.test(text)) {
      const match = text.match(pdfRegex);
      type = "pdf";
      path = match[1];
      text = "";
    } else if (imgRegex.test(text)) {
      const match = text.match(imgRegex);
      type = "image";
      path = match[1];
      text = "";
    } else if (type && path) {
      // If type/path provided, leave text as is (no marker)
    } else {
      // Remove any HTML tags, keep only text
      text = text.replace(/<[^>]+>/g, "").trim();
    }
    // Remove any "+ audio", "+ video", "+ pdf" markers from text
    text = text.replace(/^\s*\+\s*(audio|video|pdf)\s*$/i, "").trim();
    return { text, type, path };
  }

  // Allow post if content has text or any media info
  const hasMedia = !!(media_type && media_path) || (content && /<(img|video|audio|embed)\b/i.test(content));
  if ((!content || !content.trim()) && !hasMedia && !media_id) {
    return res.status(400).json({ error: "Post content cannot be empty." });
  }

  try {
    let finalMediaType = media_type;
    let finalMediaPath = media_path;

    // If media_id is provided, fetch media info
    if (media_id && (!media_type || !media_path)) {
      const Media = require("../models/Media");
      const media = await Media.findByPk(media_id);
      if (media) {
        finalMediaType = media.type && media.type.startsWith("audio") ? "audio"
          : media.type && media.type.startsWith("video") ? "video"
          : media.type && media.type.startsWith("image") ? "image"
          : media.type === "application/pdf" ? "pdf"
          : null;
        finalMediaPath = media.url;
      }
    }

    // Clean content and set marker
    const { text, type, path } = parseContentAndMedia(content, finalMediaType, finalMediaPath);

    const post = await Post.create({
      user_id,
      content: text,
      media_id: media_id || null,
      media_type: type,
      media_path: path
    });

    // Fetch with author and media
    const postWithAuthor = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username", "full_name", "avatar"],
        },
        {
          model: require("../models/Media"),
          as: "media",
        },
      ],
    });
    return res.status(201).json({
      id: postWithAuthor.id,
      content: postWithAuthor.content,
      author: postWithAuthor.author ? (postWithAuthor.author.full_name || postWithAuthor.author.username) : "Unknown",
      avatar: postWithAuthor.author ? postWithAuthor.author.avatar || "" : "",
      createdAt: postWithAuthor.created_at,
      media: postWithAuthor.media
        ? {
            id: postWithAuthor.media.id,
            url: postWithAuthor.media.url,
            type: postWithAuthor.media.type,
            filename: postWithAuthor.media.filename,
          }
        : null,
      media_type: postWithAuthor.media_type,
      media_path: postWithAuthor.media_path
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create post.", details: err.message });
  }
};

/**
 * POST /api/posts/upload-media
 * Handles media file uploads for posts.
 */
const Media = require("../models/Media");

exports.uploadMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  // Determine subfolder from destination
  const destParts = req.file.destination.split(path.sep);
  const uploadsIdx = destParts.lastIndexOf("uploads");
  let subfolder = "";
  if (uploadsIdx !== -1 && destParts.length > uploadsIdx + 1) {
    subfolder = destParts[uploadsIdx + 1];
  }
  const fileUrl = `/uploads/${subfolder}/${req.file.filename}`;
  try {
    const media = await Media.create({
      filename: req.file.filename,
      url: fileUrl,
      type: req.file.mimetype,
      uploader_id: req.user ? req.user.id : null, // If using authentication middleware
      created_at: new Date(),
    });
    return res.json({ id: media.id, url: media.url });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save media record.", details: err.message });
  }
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
        {
          model: require("../models/Media"),
          as: "media",
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
      media: post.media
        ? {
            id: post.media.id,
            url: post.media.url,
            type: post.media.type,
            filename: post.media.filename,
          }
        : null,
      media_type: post.media_type,
      media_path: post.media_path
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch post.", details: err.message });
  }
};
