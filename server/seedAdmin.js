// Run with: node seedAdmin.js
// Creates a default admin account if one doesn't already exist.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@jobportal.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
  } else {
    await User.create({
      name: 'Portal Admin',
      email,
      password,
      role: 'admin'
    });
    console.log('✅ Admin created');
    console.log('   Email:', email);
    console.log('   Password:', password);
  }
  mongoose.connection.close();
};

run();