import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
});

const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', subscriberSchema);
export default NewsletterSubscriber;
