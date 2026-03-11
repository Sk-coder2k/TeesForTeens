import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '../models/Coupon.js';

dotenv.config();

const initialCoupons = [
  { code: 'WELCOME20', discountType: 'percentage', discountValue: 20, minOrderValue: 999, expiry: '2024-12-31', timesUsed: 142, status: 'Active' },
  { code: 'FLAT500', discountType: 'fixed', discountValue: 500, minOrderValue: 1999, expiry: '2024-08-30', timesUsed: 310, status: 'Expired' },
  { code: 'TEEN30', discountType: 'percentage', discountValue: 30, minOrderValue: 0, expiry: '2025-12-31', timesUsed: 89, status: 'Active' }
];

const connectDB = async () => {
  try {
    console.log(`Attempting connection to MongoDB ...`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected!');

    console.log('Clearing existing Coupon records...');
    await Coupon.deleteMany();
    
    console.log('Seeding mock structural payload...');
    await Coupon.insertMany(initialCoupons);
    
    console.log('Coupons Imported Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

connectDB();
