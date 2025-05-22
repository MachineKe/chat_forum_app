const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from public directory
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Mount API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/comments", require("./routes/comments"));

// Health check
app.get("/", (req, res) => res.send("Backend API running"));

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
