require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Update as needed for production
    methods: ['GET', 'POST']
  }
});

const { sequelize } = require('./models');

// Middleware
app.use(cors());
app.use(express.json());

// Import and use routes here
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const postsRoutes = require('./routes/posts');
app.use('/api/posts', postsRoutes);

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Placeholder: Add chat event handlers here

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


// Root endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

sequelize.sync().then(() => {
  // Start server
  const PORT = process.env.PORT || 5050;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to sync database:', err);
});
