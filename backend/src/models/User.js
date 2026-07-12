const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    // Required unless signing in with Google
    required: function() {
      return !this.googleId;
    }
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'],
    default: 'Dispatcher'
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockoutUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isLocked = function() {
  return this.lockoutUntil && this.lockoutUntil > new Date();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
