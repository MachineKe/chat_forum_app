const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");

// Toggle like on a comment
router.post("/:commentId/like", commentsController.toggleLike);

// Get like count and liked status for a comment
router.get("/:commentId/likes", commentsController.getLikes);

module.exports = router;
