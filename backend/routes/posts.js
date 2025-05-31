// Multer setup for post media uploads
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const postsController = require("../controllers/postsController");

const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let subfolder = "others";
    console.log("Multer upload file mimetype:", file.mimetype, "originalname:", file.originalname);
    if (file.mimetype.startsWith("image/")) {
      subfolder = "photos";
    } else if (
      file.originalname && file.originalname.toLowerCase().endsWith(".webm")
    ) {
      // Try to get intended type from fieldname if not in req.body
      let intendedType = req.body.media_type || req.body.mediaType;
      if (!intendedType && file.fieldname && file.fieldname.includes("__")) {
        // e.g., fieldname: "audio__media" or "video__media"
        intendedType = file.fieldname.split("__")[0];
        console.log("DEBUG intendedType from fieldname:", intendedType);
      }
      console.log("DEBUG intendedType:", intendedType, "typeof:", typeof intendedType);
      if (intendedType && typeof intendedType === "string") {
        intendedType = intendedType.trim().toLowerCase();
        // Set mimetype to intendedType for downstream logic
        file.mimetype = intendedType;
      }
      // Now use mimetype-based logic as normal
      if (file.mimetype.startsWith("audio")) {
        subfolder = "audio";
      } else if (file.mimetype.startsWith("video")) {
        subfolder = "videos";
      } else {
        subfolder = file.mimetype === "video/webm" ? "videos" : "audio";
      }
    } else if (file.mimetype.startsWith("audio/")) {
      subfolder = "audio";
    } else if (file.mimetype.startsWith("video/")) {
      subfolder = "videos";
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-powerpoint" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      subfolder = "documents";
    }
    const dest = path.join(__dirname, "../public/uploads", subfolder);
    console.log("Multer upload destination:", dest);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = "media-" + Date.now() + ext;
    cb(null, name);
  },
});
const upload = multer({ storage });

 // POST /api/posts/upload-media
router.post(
  "/upload-media",
  upload.fields([
    { name: "media", maxCount: 1 },
    { name: "audio__media", maxCount: 1 },
    { name: "video__media", maxCount: 1 },
  ]),
  postsController.uploadMedia
);

 // POST /api/posts/:postId/like
router.post("/:postId/like", postsController.toggleLike);

// POST /api/posts/:postId/view
router.post("/:postId/view", postsController.incrementView);

// GET /api/posts/:postId/likes
router.get("/:postId/likes", postsController.getLikes);

// GET /api/posts
router.get("/", postsController.getAllPosts);

// POST /api/posts
router.post("/", postsController.createPost);

// GET /api/posts/:postId
router.get("/:postId", postsController.getPostById);

// GET /api/posts/:postId/comments
router.get("/:postId/comments", postsController.getCommentsForPost);

// POST /api/posts/:postId/comments
router.post("/:postId/comments", postsController.addCommentToPost);

/**
 * Multer storage for thumbnails (uploads/thumbnail)
 */
const thumbnailStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../public/uploads/thumbnail");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = "thumb-" + Date.now() + ext;
    cb(null, uniqueName);
  },
});
const uploadThumbnail = multer({ storage: thumbnailStorage });

/**
 * POST /api/posts/upload-thumbnail
 * Accepts: thumbnail (file), media_url (string)
 */
router.post(
  "/upload-thumbnail",
  uploadThumbnail.single("thumbnail"),
  postsController.uploadThumbnail
);

module.exports = router;
