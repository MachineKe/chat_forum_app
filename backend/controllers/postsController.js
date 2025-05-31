const { Post } = require("../models");
const { User } = require("../models");
const { Comment } = require("../models");
const PostLike = require("../models/PostLike");
const path = require("path");

const toggleLike = async (req, res) => {
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

const getCommentsForPost = async (req, res) => {
  const { postId } = req.params;
  try {
    // Fetch all comments for the post, including author info
    const comments = await Comment.findAll({
      where: { post_id: postId },
      order: [["created_at", "ASC"]],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username", "full_name", "avatar"],
        },
      ],
    });
    // Format comments for frontend
    const formatted = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      // REMOVE: title: comment.title,
      media_title: comment.media_title,
      author: comment.author ? (comment.author.full_name || comment.author.username) : "Unknown",
      username: comment.author ? comment.author.username || "" : "",
      avatar: comment.author ? comment.author.avatar || "" : "",
      createdAt: comment.created_at,
      parent_id: comment.parent_id,
      media_id: comment.media_id,
      media_type: comment.media_type,
      media_path: comment.media_path
    }));
    return res.json(formatted);
  } catch (err) {
    console.error("Error in getCommentsForPost:", err);
    return res.status(500).json({ error: "Failed to fetch comments.", details: err.message, stack: err.stack });
  }
}

// GET /api/posts/:postId/likes
const getLikes = async (req, res) => {
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

const addCommentToPost = async (req, res) => {
  const { postId } = req.params;
  const { user_id, content, parent_id, media_id, media_type, media_path, title, media_title } = req.body;
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
    }
    if (videoRegex.test(text)) {
      const match = text.match(videoRegex);
      type = "video";
      path = match[1];
    }
    if (pdfRegex.test(text)) {
      const match = text.match(pdfRegex);
      type = "pdf";
      path = match[1];
    }
    if (imgRegex.test(text)) {
      const match = text.match(imgRegex);
      type = "image";
      path = match[1];
    }
    // Always extract plain text from the HTML, regardless of media
    const originalHtml = text;
    // Use DOMParser for robust plain text extraction
    let plainText = "";
    try {
      const { JSDOM } = require("jsdom");
      const dom = new JSDOM(`<body>${text}</body>`);
      plainText = dom.window.document.body.textContent || "";
    } catch (e) {
      // Fallback to regex if jsdom is not available
      plainText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }
    // Remove any "+ audio", "+ video", "+ pdf" markers from text
    plainText = plainText.replace(/^\s*\+\s*(audio|video|pdf)\s*$/i, "").trim();
    return { text: plainText, type, path };
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
      title: title || null,
      media_title: media_title || null,
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
      media_path: commentWithAuthor.media_path,
      media_title: commentWithAuthor.media_title
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to add comment.", details: err.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const { commented_by, liked_by, limit, offset } = req.query;
    let posts;
    const { User, Comment } = require("../models");

    // Parse limit/offset as integers, with defaults
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

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
        limit: parsedLimit,
        offset: parsedOffset,
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
        limit: parsedLimit,
        offset: parsedOffset,
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
        limit: parsedLimit,
        offset: parsedOffset,
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

    // Format posts to include author username, comment count, view count, media, and media_title
    const formatted = posts.map(post => ({
      id: post.id,
      content: post.content,
      author: post.author ? (post.author.full_name || post.author.username) : "Unknown",
      username: post.author ? post.author.username || "" : "",
      avatar: post.author ? post.author.avatar || "" : "",
      createdAt: post.created_at,
      commentCount: commentCounts[post.id] || 0,
      viewCount: post.view_count,
      media_title: post.media_title,
      media: post.media_id && mediaMap[post.media_id]
        ? {
            id: mediaMap[post.media_id].id,
            url: mediaMap[post.media_id].url,
            type: mediaMap[post.media_id].type,
            filename: mediaMap[post.media_id].filename,
            title: mediaMap[post.media_id].title, // include media title
          }
        : null,
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch posts.", details: err.message });
  }
};

const createPost = async (req, res) => {
  const { user_id, content, media_id, media_type, media_path, title, media_title } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required." });
  }
  // Strip HTML tags from content before saving
  function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const plainTextContent = stripHtml(content);

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
    }
    if (videoRegex.test(text)) {
      const match = text.match(videoRegex);
      type = "video";
      path = match[1];
    }
    if (pdfRegex.test(text)) {
      const match = text.match(pdfRegex);
      type = "pdf";
      path = match[1];
    }
    if (imgRegex.test(text)) {
      const match = text.match(imgRegex);
      type = "image";
      path = match[1];
    }
    // Always extract plain text from the HTML, regardless of media
    const originalHtml = text;
    let plainText = "";
    try {
      const { JSDOM } = require("jsdom");
      const dom = new JSDOM(`<body>${text}</body>`);
      plainText = dom.window.document.body.textContent || "";
    } catch (e) {
      // Fallback to regex if jsdom is not available
      plainText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }
    // Remove any "+ audio", "+ video", "+ pdf" markers from text
    plainText = plainText.replace(/^\s*\+\s*(audio|video|pdf)\s*$/i, "").trim();
    return { text: plainText, type, path };
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

    // Save only the plain text content, not the HTML
    const newPost = await Post.create({
      user_id,
      content: plainTextContent,
      title: title || null,
      media_title: media_title || null,
      media_id: media_id || null,
      media_type: type || null,
      media_path: path || null,
    });

    // Debug: log media_title and media_id
    console.log("createPost: media_id =", media_id, "media_title =", media_title);

    // If media_id and media_title are provided, update the Media's title as well
    let updatedMedia = null;
    if (media_id && media_title) {
      const Media = require("../models/Media");
      const [affectedRows] = await Media.update(
        { title: media_title },
        { where: { id: media_id } }
      );
      console.log("Media.update result: affectedRows =", affectedRows);
      // Re-fetch the updated media record to get the new title
      updatedMedia = await Media.findByPk(media_id);
    }

    // Fetch with author and media
    const postWithAuthor = await Post.findOne({
      where: { id: newPost.id },
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

    // If we have an updated media, use it in the response
    let mediaResponse = null;
    if (updatedMedia) {
      mediaResponse = {
        id: updatedMedia.id,
        url: updatedMedia.url,
        type: updatedMedia.type,
        filename: updatedMedia.filename,
        title: updatedMedia.title,
      };
    } else if (postWithAuthor.media) {
      mediaResponse = {
        id: postWithAuthor.media.id,
        url: postWithAuthor.media.url,
        type: postWithAuthor.media.type,
        filename: postWithAuthor.media.filename,
        title: postWithAuthor.media.title,
      };
    }

    return res.status(201).json({
      id: postWithAuthor.id,
      content: postWithAuthor.content,
      author: postWithAuthor.author ? (postWithAuthor.author.full_name || postWithAuthor.author.username) : "Unknown",
      avatar: postWithAuthor.author ? postWithAuthor.author.avatar || "" : "",
      createdAt: postWithAuthor.created_at,
      media: mediaResponse,
      media_type: postWithAuthor.media_type,
      media_path: postWithAuthor.media_path
    });
  } catch (err) {
    console.error("Error in createPost:", err);
    return res.status(500).json({ error: "Failed to create post.", details: err.message, stack: err.stack });
  }
};

/**
 * POST /api/posts/upload-media
 * Handles media file uploads for posts.
 */
const Media = require("../models/Media");

const uploadMedia = async (req, res) => {
  // Support Multer .fields: check all possible fieldnames
  let file = null;
  if (req.files) {
    if (req.files["audio__media"] && req.files["audio__media"].length > 0) {
      file = req.files["audio__media"][0];
    } else if (req.files["video__media"] && req.files["video__media"].length > 0) {
      file = req.files["video__media"][0];
    } else if (req.files["media"] && req.files["media"].length > 0) {
      file = req.files["media"][0];
    }
  }
  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  // Optional title from form-data
  const title = req.body.title || null;
  // Determine subfolder from destination
  const destParts = file.destination.split(path.sep);
  const uploadsIdx = destParts.lastIndexOf("uploads");
  let subfolder = "";
  // Determine intended media type from mimetype or explicit form field
  let intendedType = req.body.media_type || req.body.mediaType || file.mimetype || "";
  if (typeof intendedType !== "string") {
    intendedType = "";
  }
  intendedType = intendedType.toLowerCase();

  // Special handling for .webm: use intendedType to decide folder
  if (file.originalname && file.originalname.toLowerCase().endsWith('.webm')) {
    // Debug log for troubleshooting
    console.log("UPLOAD DEBUG: .webm upload", {
      mimetype: file.mimetype,
      fieldname: file.fieldname,
      intendedType,
      size: file.size
    });
    // Use explicit media_type from frontend if provided, fallback to mimetype
    let explicitType = req.body.media_type || req.body.mediaType;
    if (typeof explicitType !== "string") {
      explicitType = "";
    }
    if (explicitType) {
      if (explicitType.toLowerCase().startsWith("video")) {
        subfolder = "videos";
      } else if (explicitType.toLowerCase().startsWith("audio")) {
        subfolder = "audio";
      } else {
        // fallback: use mimetype
        subfolder = file.mimetype === "video/webm" ? "videos" : "audio";
      }
    } else {
      // fallback: use mimetype
      subfolder = file.mimetype === "video/webm" ? "videos" : "audio";
    }
  } else if (uploadsIdx !== -1 && destParts.length > uploadsIdx + 1) {
    subfolder = destParts[uploadsIdx + 1];
  }
  const fileUrl = `/uploads/${subfolder}/${file.filename}`;
  try {
    // If file is .webm, set mimetype based on intendedType
    let mediaType = file.mimetype;
    if (file.originalname && file.originalname.toLowerCase().endsWith('.webm')) {
      if (intendedType.startsWith("video")) {
        mediaType = 'video/webm';
      } else if (intendedType.startsWith("audio")) {
        mediaType = 'audio/webm';
      }
    }
    const media = await Media.create({
      filename: file.filename,
      url: fileUrl,
      type: mediaType,
      title: title,
      uploader_id: req.user ? req.user.id : null, // If using authentication middleware
      created_at: new Date(),
    });
    return res.json({ id: media.id, url: media.url, title: media.title });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save media record.", details: err.message });
  }
};

  // POST /api/posts/:postId/view
const incrementView = async (req, res) => {
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
const getPostById = async (req, res) => {
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
      media_title: post.media_title,
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

module.exports = {
  getCommentsForPost,
  toggleLike,
  getLikes,
  addCommentToPost,
  getAllPosts,
  createPost,
  uploadMedia,
  incrementView,
  getPostById,
};
