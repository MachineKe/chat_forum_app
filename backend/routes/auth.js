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

// Multer setup for banner uploads
const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const bannerDir = path.join(__dirname, "../public/uploads/banner");
    // Ensure the directory exists
    require("fs").mkdirSync(bannerDir, { recursive: true });
    cb(null, bannerDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = "banner-" + Date.now() + ext;
    cb(null, name);
  },
});
const bannerUpload = multer({ storage: bannerStorage });

// POST /api/auth/upload-avatar
router.post("/upload-avatar", upload.single("avatar"), authController.uploadAvatar);

// POST /api/auth/upload-banner
router.post("/upload-banner", bannerUpload.single("banner"), authController.uploadBanner);


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
