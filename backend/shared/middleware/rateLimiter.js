const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: { status: 'fail', message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const authLimiter = createLimiter(15 * 60 * 1000, 20, 'Too many auth attempts. Try again later.');
const apiLimiter = createLimiter(15 * 60 * 1000, 100, 'Too many requests. Please slow down.');

module.exports = { createLimiter, authLimiter, apiLimiter };
