// Multer setup for avatar uploads
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authController = require("../controllers/authController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = "avatar-" + Date.now() + ext;
    cb(null, name);
  },
});
const upload = multer({ storage });

// POST /api/auth/upload-avatar
router.post("/upload-avatar", upload.single("avatar"), authController.uploadAvatar);


// GET /api/auth/user-by-email
router.get("/user-by-email", authController.getUserByEmail);

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/register
router.post("/register", authController.register);

/**
 * Profile management endpoints
 */
// GET /api/auth/profile
router.get("/profile", authController.getProfile);
// PUT /api/auth/profile
router.put("/profile", authController.updateProfile);
// PUT /api/auth/profile/password
router.put("/profile/password", authController.changePassword);

module.exports = router;
