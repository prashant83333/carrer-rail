// Run with: node resetAdmin.js
// Deletes the existing admin@jobportal.com user so seedAdmin.js can recreate it fresh.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const run = async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || 'admin@jobportal.com';
  const result = await User.deleteOne({ email });
  console.log(`Deleted ${result.deletedCount} user(s) with email: ${email}`);
  await mongoose.connection.close();
};

run();