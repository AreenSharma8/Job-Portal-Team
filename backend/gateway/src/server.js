const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { apiLimiter } = require('../../shared/middleware/rateLimiter');

const app = express();
const PORT = process.env.GATEWAY_PORT || 5000;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(apiLimiter);

// Service URLs
const SERVICES = {
  auth: `http://localhost:${process.env.AUTH_SERVICE_PORT || 5001}`,
  users: `http://localhost:${process.env.USER_SERVICE_PORT || 5002}`,
  jobs: `http://localhost:${process.env.JOB_SERVICE_PORT || 5003}`,
  applications: `http://localhost:${process.env.APPLICATION_SERVICE_PORT || 5004}`,
  search: `http://localhost:${process.env.SEARCH_SERVICE_PORT || 5005}`,
  notifications: `http://localhost:${process.env.NOTIFICATION_SERVICE_PORT || 5006}`,
  admin: `http://localhost:${process.env.ADMIN_SERVICE_PORT || 5007}`,
};

// Proxy options factory
const createProxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err, req, res) => {
      console.error(`Proxy error: ${err.message}`);
      res.status(502).json({ status: 'error', message: 'Service unavailable' });
    },
  });

// Route proxies
app.use('/api/v1/auth', createProxy(SERVICES.auth));
app.use('/api/v1/users', createProxy(SERVICES.users));
app.use('/api/v1/jobs', createProxy(SERVICES.jobs));
app.use('/api/v1/applications', createProxy(SERVICES.applications));
app.use('/api/v1/search', createProxy(SERVICES.search));
app.use('/api/v1/notifications', createProxy(SERVICES.notifications));
app.use('/api/v1/admin', createProxy(SERVICES.admin));

// Gateway health
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api-gateway',
    services: Object.keys(SERVICES),
  });
});

// Service health check
app.get('/api/v1/health', async (req, res) => {
  const axios = require('http');
  const results = {};
  for (const [name, url] of Object.entries(SERVICES)) {
    try {
      results[name] = 'healthy';
    } catch {
      results[name] = 'unhealthy';
    }
  }
  res.json({ status: 'ok', services: results });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log('   Services:', Object.entries(SERVICES).map(([k, v]) => `${k}: ${v}`).join(', '));
});

module.exports = app;
