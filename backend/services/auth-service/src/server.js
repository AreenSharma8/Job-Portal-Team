const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const errorHandler = require('../../../shared/middleware/errorHandler');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 5001;

// Middleware setup
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// Health check (available before DB connection)
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'ok', 
    service: 'auth-service',
    database: dbStatus
  });
});

// Start server
const start = async () => {
  try {
    // Connect to MongoDB with better timeout settings
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    console.log(`📦 Database: ${mongoose.connection.name}`);
    
    // Load routes AFTER database is connected
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/v1/auth', authRoutes);

    // Error handling
    app.use(errorHandler);

    // Start listening
    app.listen(PORT, () => {
      console.log(`🔐 Auth Service running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('💡 Check MongoDB connection and credentials');
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

start();

module.exports = app;
