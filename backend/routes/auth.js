const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  verifyEmail,
  login,
  getMe,
  resendVerification,
  updateProfile
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/resend-verification', resendVerification);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
