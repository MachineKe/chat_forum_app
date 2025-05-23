const { User } = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const crypto = require("crypto");

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Password: min 8 chars, upper, lower, number, special
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  // Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET || "default_jwt_secret",
    { expiresIn: "7d" }
  );
  return res.json({
    message: "Login successful.",
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      avatar: user.avatar || "",
    },
  });
};

exports.getUserByEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  return res.json({ id: user.id, username: user.username, email: user.email, full_name: user.full_name, avatar: user.avatar || "" });
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // Validate email
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  // Validate password strength
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  // Check for duplicate email or username
  const existing = await User.findOne({
    where: { [Op.or]: [{ email }, { username }] },
  });
  if (existing) {
    return res.status(409).json({ error: "Email or username already in use." });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate email verification token
  const emailToken = crypto.randomBytes(32).toString("hex");
  // In production, store token in DB and send email
  // For now, just return it in the response

  // Create user (unverified)
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    is_ldap_user: false,
    // Add emailVerified: false, emailToken if you extend the model
  });

  // Send verification email
  const { sendMail } = require("../services/mailer");
  const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${emailToken}&email=${encodeURIComponent(email)}`;
  try {
    await sendMail({
      to: email,
      subject: "Verify your email address",
      html: `<p>Hi ${username},</p>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>If you did not register, please ignore this email.</p>`,
      text: `Hi ${username},\n\nThank you for registering. Please verify your email by visiting: ${verifyUrl}\n\nIf you did not register, please ignore this email.`,
    });
  } catch (e) {
    console.error("Email send error:", e);
    return res.status(500).json({ error: "Failed to send verification email.", details: e.message || e.toString() });
  }

  return res.status(201).json({
    message: "Registration successful. Please check your email to verify your account.",
  });
};

  // GET /api/auth/profile?user_id=123 or ?email=... or ?username=...
exports.getProfile = async (req, res) => {
  const { user_id, email, username } = req.query;
  if (!user_id && !email && !username) {
    return res.status(400).json({ error: "user_id, email, or username is required." });
  }
  try {
    let where = {};
    if (user_id) where = { id: user_id };
    else if (email) where = { email };
    else if (username) where = { username };
    const user = await User.findOne({ where });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    // Get followers and following counts
    const { UserFollow } = require("../models");
    const followers = await UserFollow.count({ where: { following_id: user.id } });
    const following = await UserFollow.count({ where: { follower_id: user.id } });

    return res.json({
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      avatar: user.avatar || "",
      bio: user.bio || "",
      followers,
      following,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch profile.", details: err.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  const { user_id, full_name, email, avatar } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required." });
  }
  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (full_name !== undefined) user.full_name = full_name;
    if (email !== undefined) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    await user.save();
    return res.json({
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      avatar: user.avatar || "",
      bio: user.bio || "",
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update profile.", details: err.message });
  }
};

  // PUT /api/auth/profile/password
  exports.changePassword = async (req, res) => {
    const { user_id, old_password, new_password } = req.body;
    if (!user_id || !old_password || !new_password) {
      return res.status(400).json({ error: "user_id, old_password, and new_password are required." });
    }
    try {
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      const valid = await bcrypt.compare(old_password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Old password is incorrect." });
      }
      // Validate new password
      if (!passwordRegex.test(new_password)) {
        return res.status(400).json({
          error:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
        });
      }
      user.password = await bcrypt.hash(new_password, 12);
      await user.save();
      return res.json({ message: "Password updated successfully." });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update password.", details: err.message });
    }
  };

  // POST /api/auth/upload-avatar
  exports.uploadAvatar = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    // Return the URL to the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({ url: fileUrl });
  };
