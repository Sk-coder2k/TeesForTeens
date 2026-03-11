import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const ADMIN_EMAIL = 'teesforteens.official@gmail.com';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB Connected');

  const stripped = await User.updateMany(
    { email: { $ne: ADMIN_EMAIL } },
    { $set: { role: 'customer' } }
  );
  console.log(`Demoted ${stripped.modifiedCount} user(s) to customer.`);

  const result = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    { $set: { role: 'admin' } },
    { new: true }
  );

  if (result) {
    console.log(`Admin confirmed: ${ADMIN_EMAIL}`);
  } else {
    console.log(`Admin email not found. Run makeAdmin.js first.`);
  }

  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
