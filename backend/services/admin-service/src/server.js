const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('../../../shared/config/db');
const errorHandler = require('../../../shared/middleware/errorHandler');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.ADMIN_SERVICE_PORT || 5007;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/admin', adminRoutes);
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'admin-service' }));
app.use(errorHandler);

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`🛡️ Admin Service running on port ${PORT}`));
};
start();
module.exports = app;
