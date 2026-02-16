const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('../../../shared/config/db');
const errorHandler = require('../../../shared/middleware/errorHandler');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
const PORT = process.env.JOB_SERVICE_PORT || 5003;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

app.use('/api/v1/jobs', jobRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'job-service' });
});

app.use(errorHandler);

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`💼 Job Service running on port ${PORT}`));
};

start();
module.exports = app;
