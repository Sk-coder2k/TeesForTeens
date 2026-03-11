import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

await mongoose.connect(process.env.MONGO_URI);

const User = (await import('../models/User.js')).default;

// Show ALL users with their roles and emails
const users = await User.find({}).select('name email role image');
console.log('\n=== All Users in DB ===');
users.forEach(u => {
  console.log(`${u.role === 'admin' ? '👑 ADMIN' : '👤 customer'} | ${u.email} | ${u.name}`);
});

// Fix: make ALL accounts with 'teesforteens' in the email admin
const result = await User.updateMany(
  { email: { $regex: /teesforteens/i } },
  { $set: { role: 'admin' } }
);
console.log(`\n✅ Updated ${result.modifiedCount} teesforteens account(s) to admin`);

const admins = await User.find({ role: 'admin' }).select('email name');
console.log('\n=== Current Admins ===');
admins.forEach(a => console.log(`👑 ${a.email} | ${a.name}`));

process.exit(0);
