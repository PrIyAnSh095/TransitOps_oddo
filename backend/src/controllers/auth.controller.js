const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { verifyTurnstile } = require('../services/captcha.service');
const { sendPasswordResetEmail } = require('../services/email.service');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password, turnstileToken } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check lockout
  if (user.isLocked()) {
    const remainingTime = Math.ceil((user.lockoutUntil - new Date()) / 60000);
    res.status(423).json({
      message: 'Account locked due to too many failed attempts.',
      remainingTimeMinutes: remainingTime
    });
    return;
  }

  const loginMaxAttempts = parseInt(process.env.LOGIN_MAX_ATTEMPTS) || 6;
  const captchaAfterAttempts = parseInt(process.env.CAPTCHA_AFTER_ATTEMPTS) || 3;

  // Check CAPTCHA if needed
  if (user.failedLoginAttempts >= captchaAfterAttempts) {
    if (!turnstileToken) {
      res.status(403).json({ message: 'CAPTCHA required.', requireCaptcha: true });
      return;
    }
    const isValidCaptcha = await verifyTurnstile(turnstileToken);
    if (!isValidCaptcha) {
      res.status(403);
      throw new Error('Invalid CAPTCHA token');
    }
  }

  if (await user.matchPassword(password)) {
    // Reset failed attempts and lockout
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } else {
    // Increment failed attempts
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= loginMaxAttempts) {
      user.lockoutUntil = new Date(Date.now() + (parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 15) * 60000);
    }

    await user.save();

    if (user.isLocked()) {
      res.status(423).json({
        message: 'Account locked due to too many failed attempts.',
        remainingTimeMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 15
      });
      return;
    }

    const remainingToLock = loginMaxAttempts - user.failedLoginAttempts;
    res.status(401).json({
      message: `Invalid email or password.`,
      requireCaptcha: user.failedLoginAttempts >= captchaAfterAttempts,
      remainingAttempts: remainingToLock
    });
  }
});

// @desc    Register a new user (for testing/setup)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'Dispatcher'
  });

  if (user) {
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  const user = await User.findOne({ email });

  // Security best practice: Never reveal if the email exists or not unless policy says otherwise.
  // The specs say: "Never reveal whether an email exists unless your application's security policy explicitly allows it."

  if (user) {
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Invalidate existing unused tokens for this user
    await PasswordResetToken.updateMany({ user: user._id, used: false }, { used: true });

    await PasswordResetToken.create({
      user: user._id,
      token: resetTokenHash,
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    });

    const resetUrl = `http://localhost:5173/auth/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);
  }

  res.status(200).json({ message: 'If that email address is in our database, we will send you an email to reset your password.' });
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400);
    throw new Error('Please provide token and new password');
  }

  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const resetRecord = await PasswordResetToken.findOne({
    token: resetTokenHash,
    used: false,
    expiresAt: { $gt: Date.now() }
  }).populate('user');

  if (!resetRecord) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  const user = resetRecord.user;
  user.password = newPassword;

  // Reset lockout
  user.failedLoginAttempts = 0;
  user.lockoutUntil = null;

  await user.save();

  // Invalidate token
  resetRecord.used = true;
  await resetRecord.save();

  res.status(200).json({ message: 'Password reset successful' });
});

// @desc    Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleOAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Missing Google credential');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    res.status(401);
    throw new Error('Invalid Google credential');
  }

  const { email, sub: googleId } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    // Spec: If user does not exist, do not automatically create. Deny auth.
    res.status(403).json({
      message: 'No user account was found for this Google account. Please contact your administrator to be added as a user.',
      code: 'GOOGLE_USER_NOT_FOUND'
    });
    return;
  }

  // Update googleId if not set
  if (!user.googleId) {
    user.googleId = googleId;
    await user.save();
  }

  // Reset lockout
  user.failedLoginAttempts = 0;
  user.lockoutUntil = null;
  await user.save();

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: generateToken(user._id),
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  googleOAuth,
  getMe
};
