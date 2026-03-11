import mongoose from 'mongoose';

const homepageSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  trending: {
    name: { type: String, default: 'Trending Now' },
    subtitle: { type: String, default: 'Oversized Mint Tee' },
    emoji: { type: String, default: '🔥' },
    heroImages: [{ type: String }],
  },
  categories: [{
    id: String,
    name: String,
    query: String,
    count: String,
    image: String,
  }],
  featuredIds: [{ type: String }],
  bestsellerIds: [{ type: String }],
}, { timestamps: true });

const HomepageSettings = mongoose.model('HomepageSettings', homepageSettingsSchema);
export default HomepageSettings;
