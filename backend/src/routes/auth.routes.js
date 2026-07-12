const express = require('express');
const router = express.Router();
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  googleOAuth,
  getMe,
  updateProfile,
  requestPasswordChange,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

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
router.put('/profile', protect, updateProfile);
router.post('/request-password-change', protect, requestPasswordChange);

// ── DEV-ONLY: Diagnostic routes (never runs in production) ──
if (process.env.NODE_ENV !== 'production') {
  // GET /api/auth/dev-users  -- list all users + lockout state
  router.get('/dev-users', asyncHandler(async (req, res) => {
    const users = await User.find({}, 'name email role failedLoginAttempts lockoutUntil createdAt');
    res.json({ users: users.map(u => ({
      email: u.email,
      name: u.name,
      role: u.role,
      failedLoginAttempts: u.failedLoginAttempts,
      locked: u.lockoutUntil && u.lockoutUntil > new Date(),
      lockoutUntil: u.lockoutUntil,
    })) });
  }));

  // POST /api/auth/dev-reset-password  -- reset password + unlock
  // Body: { email, newPassword }
  router.post('/dev-reset-password', asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'email and newPassword required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: `No user found: ${email}` });
    }
    user.password = newPassword; // pre-save hook bcrypts it
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();
    res.json({ message: `Password reset and account unlocked for: ${user.email}` });
  }));

  // POST /api/auth/dev-create-user  -- create a user (for seeding)
  // Body: { email, password, name, role }
  router.post('/dev-create-user', asyncHandler(async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'email, password, and name are required' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: `User already exists: ${email}` });
    }
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      role: role || 'FleetManager',
    });
    res.status(201).json({ message: 'User created', email: user.email, role: user.role });
  }));
}

module.exports = router;
