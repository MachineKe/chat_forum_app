require('module-alias/register');

const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve .webm files in /uploads/audio as audio/webm
app.use("/uploads/audio", (req, res, next) => {
  if (req.path.endsWith(".webm")) {
    res.type("audio/webm");
  }
  next();
});

// Serve static files from public directory
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Mount API routes using aliases
app.use("/api/auth", require("@routes/auth"));
// Existing routes
app.use("/api/posts", require("@routes/posts"));
app.use("/api/comments", require("@routes/comments"));
app.use("/api/messages", require("@routes/messages"));
app.use("/api/users", require("@routes/users"));

// Health check
app.get("/", (req, res) => res.send("Backend API running"));

// Global error handler (log all errors)
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR HANDLER:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message, stack: err.stack });
});

const http = require("http");
const { Server } = require("socket.io");

// Start server
const PORT = process.env.PORT || 5050;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket.IO client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket.IO client disconnected:", socket.id);
  });
});

// Make io accessible globally (for controllers to emit events)
app.set("io", io);

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Socket.IO server running on ws://localhost:${PORT}`);
});
