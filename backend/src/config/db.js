const mongoose = require("mongoose");
const User = require("../models/User"); // Import User model

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed hardcoded admin
    const adminEmail = 'admin@test.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: 'admin', // the pre-save hook in User model will hash this
        role: 'FleetManager'
      });
      console.log(`Hardcoded admin created: ${adminEmail} / admin`);
    } else {
      console.log(`Hardcoded admin already exists: ${adminEmail}`);
    }

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;