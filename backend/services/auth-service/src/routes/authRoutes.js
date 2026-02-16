const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../../../../shared/middleware/auth');
const {
  registerValidation,
  loginValidation,
} = require('../../../../shared/middleware/validation');
const { authLimiter } = require('../../../../shared/middleware/rateLimiter');

router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
