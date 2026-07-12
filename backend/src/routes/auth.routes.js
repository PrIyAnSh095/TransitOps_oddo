const express = require('express');
const router = express.Router();
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  googleOAuth,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Rate limit all auth routes except /me
router.use((req, res, next) => {
  if (req.path === '/me') {
    return next();
  }
  authLimiter(req, res, next);
});

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleOAuth);
router.get('/me', protect, getMe);

module.exports = router;
