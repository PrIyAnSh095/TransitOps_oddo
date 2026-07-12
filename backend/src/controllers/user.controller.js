const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Create a new user (admin action)
// @route   POST /api/users
// @access  Private (FleetManager only)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, password } = req.body;

  if (!name || !email || !role || !password) {
    res.status(400);
    throw new Error('Please provide name, email, role, and password');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const userExists = await User.findOne({ email: email.toLowerCase().trim() });
  if (userExists) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const validRoles = ['FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'];
  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role,
    password,
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json({
    success: true,
    data: users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    })),
  });
});

module.exports = { createUser, getUsers };
