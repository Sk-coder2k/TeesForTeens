import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  subject: String,
  message: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('ContactMessage', contactMessageSchema);
