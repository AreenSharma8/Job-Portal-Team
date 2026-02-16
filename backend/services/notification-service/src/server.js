const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('../../../shared/config/db');
const errorHandler = require('../../../shared/middleware/errorHandler');
const notificationRoutes = require('./routes/notificationRoutes');
const { verifyAccessToken } = require('../../../shared/utils/jwt');

const app = express();
const server = http.createServer(app);
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5006;

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket auth middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    const decoded = verifyAccessToken(token);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userId}`);
  socket.join(`user_${socket.userId}`);

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.userId}`);
  });
});

app.set('io', io);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/notifications', notificationRoutes);
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'notification-service' }));
app.use(errorHandler);

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  server.listen(PORT, () => console.log(`🔔 Notification Service running on port ${PORT}`));
};
start();
module.exports = { app, server, io };
