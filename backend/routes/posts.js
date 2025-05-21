// Multer setup for post media uploads
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const postsController = require("../controllers/postsController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = "media-" + Date.now() + ext;
    cb(null, name);
  },
});
const upload = multer({ storage });

 // POST /api/posts/upload-media
router.post("/upload-media", upload.single("media"), postsController.uploadMedia);

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

module.exports = router;
