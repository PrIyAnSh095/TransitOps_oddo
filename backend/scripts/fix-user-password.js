/**
 * Diagnostic & Fix Script: Lists all users and resets a user's password.
 *
 * Usage:
 *   node scripts/fix-user-password.js                          -- lists all users
 *   node scripts/fix-user-password.js <email> <newPassword>    -- resets password
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const [,, email, newPassword] = process.argv;

async function main() {
  console.log('\nConnecting to MongoDB...');
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('Connected!\n');

  if (!email) {
    // --- List all users ---
    const users = await User.find({}, 'name email role failedLoginAttempts lockoutUntil createdAt');
    if (users.length === 0) {
      console.log('No users found in the database.');
      console.log('\nTo create one, run:');
      console.log('  node scripts/fix-user-password.js create <email> <password> <name> <role>');
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      users.forEach((u) => {
        const locked = u.lockoutUntil && u.lockoutUntil > new Date();
        console.log(`  Email   : ${u.email}`);
        console.log(`  Name    : ${u.name}`);
        console.log(`  Role    : ${u.role}`);
        console.log(`  Failed  : ${u.failedLoginAttempts} attempts`);
        console.log(`  Locked  : ${locked ? `YES (until ${u.lockoutUntil})` : 'No'}`);
        console.log('');
      });
      console.log('To reset a password, run:');
      console.log('  node scripts/fix-user-password.js <email> <newPassword>');
      console.log('\nTo unlock an account (clear failed attempts), run:');
      console.log('  node scripts/fix-user-password.js unlock <email>');
    }
  } else if (email === 'unlock') {
    // --- Unlock account ---
    const targetEmail = newPassword; // 2nd arg is email in this mode
    if (!targetEmail) {
      console.error('Usage: node scripts/fix-user-password.js unlock <email>');
      process.exit(1);
    }
    const user = await User.findOne({ email: targetEmail.toLowerCase() });
    if (!user) {
      console.error(`No user found with email: ${targetEmail}`);
      process.exit(1);
    }
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();
    console.log(`✅ Account unlocked for: ${user.email}`);
  } else if (email === 'create') {
    // --- Create user ---
    // node scripts/fix-user-password.js create <email> <password> <name> <role>
    const [,,, createEmail, createPass, createName, createRole] = process.argv;
    if (!createEmail || !createPass || !createName) {
      console.error('Usage: node scripts/fix-user-password.js create <email> <password> <name> [role]');
      process.exit(1);
    }
    const exists = await User.findOne({ email: createEmail.toLowerCase() });
    if (exists) {
      console.error(`User already exists: ${createEmail}`);
      process.exit(1);
    }
    const user = await User.create({
      email: createEmail.toLowerCase().trim(),
      password: createPass,
      name: createName,
      role: createRole || 'FleetManager',
    });
    console.log(`✅ User created:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name : ${user.name}`);
    console.log(`   Role : ${user.role}`);
  } else {
    // --- Reset password ---
    if (!newPassword) {
      console.error('Usage: node scripts/fix-user-password.js <email> <newPassword>');
      process.exit(1);
    }
    if (newPassword.length < 6) {
      console.error('Password must be at least 6 characters.');
      process.exit(1);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error(`No user found with email: ${email}`);
      console.log('\nRun without arguments to list all users.');
      process.exit(1);
    }

    // Hash manually (bypasses the pre-save hook double-hash risk by direct assignment)
    user.password = newPassword; // pre-save hook will bcrypt this
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    console.log(`✅ Password reset for: ${user.email}`);
    console.log(`   Name: ${user.name}  |  Role: ${user.role}`);
    console.log(`   Account unlocked (failedAttempts cleared)`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
