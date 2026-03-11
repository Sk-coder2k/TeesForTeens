import express from 'express';
import HomepageSettings from '../models/HomepageSettings.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_CATEGORIES = [
  { id: "1", name: "Oversized Tees", query: "Oversized", count: "120+", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600" },
  { id: "2", name: "Streetwear", query: "Streetwear", count: "85+", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600" },
  { id: "3", name: "Couple Match", query: "Couple", count: "40+", image: "https://images.unsplash.com/photo-1583391265517-35bbbad0120b?auto=format&fit=crop&q=80&w=600" },
  { id: "4", name: "Classic Fit", query: "Classic", count: "200+", image: "https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&q=80&w=600" },
];

// GET /api/homepage — public
router.get('/', async (req, res) => {
  try {
    let settings = await HomepageSettings.findOne({ key: 'main' });
    if (!settings) {
      settings = await HomepageSettings.create({ key: 'main', categories: DEFAULT_CATEGORIES });
    }
    res.json({
      trending: settings.trending,
      categories: settings.categories?.length ? settings.categories : DEFAULT_CATEGORIES,
      featuredIds: settings.featuredIds || [],
      bestsellerIds: settings.bestsellerIds || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/homepage — admin only
router.put('/', protect, admin, async (req, res) => {
  try {
    const { trending, categories, featuredIds, bestsellerIds } = req.body;
    const update = {};
    if (trending !== undefined) update.trending = trending;
    if (categories !== undefined) update.categories = categories;
    if (featuredIds !== undefined) update.featuredIds = featuredIds;
    if (bestsellerIds !== undefined) update.bestsellerIds = bestsellerIds;

    const settings = await HomepageSettings.findOneAndUpdate(
      { key: 'main' },
      update,
      { new: true, upsert: true }
    );
    res.json({
      trending: settings.trending,
      categories: settings.categories,
      featuredIds: settings.featuredIds,
      bestsellerIds: settings.bestsellerIds,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
