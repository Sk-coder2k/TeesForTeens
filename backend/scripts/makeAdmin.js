// Run this once to make teesforteens.official@gmail.com the admin:
// node scripts/makeAdmin.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const ADMIN_EMAIL = 'teesforteens.official@gmail.com';
const ADMIN_NAME = 'TeesforTeens Admin';
const ADMIN_PASSWORD = 'Admin@TFT2024!'; // Change this after first login

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB Connected');

  let admin = await User.findOne({ email: ADMIN_EMAIL });

  if (admin) {
    // Already exists — just promote to admin
    admin.role = 'admin';
    await admin.save();
    console.log(`✅ Existing user "${ADMIN_EMAIL}" promoted to admin.`);
  } else {
    // Create new admin account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });
    console.log(`✅ Admin account created:`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   ⚠️  Change this password after first login!`);
  }

  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
