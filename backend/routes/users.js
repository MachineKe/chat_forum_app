const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// GET /api/users - Get all users
router.get("/", usersController.getAllUsers);

module.exports = router;
