const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// GET /api/auth/user-by-email
router.get("/user-by-email", authController.getUserByEmail);

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/register
router.post("/register", authController.register);

module.exports = router;
