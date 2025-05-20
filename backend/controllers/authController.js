const { User } = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const crypto = require("crypto");

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Password: min 8 chars, upper, lower, number, special
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

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
  // Optionally generate JWT here
  return res.json({ message: "Login successful." });
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
