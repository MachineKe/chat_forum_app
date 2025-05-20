const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");

// GET /api/posts
router.get("/", postsController.getAllPosts);

// POST /api/posts
router.post("/", postsController.createPost);

// GET /api/posts/:postId/comments
router.get("/:postId/comments", postsController.getCommentsForPost);

// POST /api/posts/:postId/comments
router.post("/:postId/comments", postsController.addCommentToPost);

module.exports = router;
