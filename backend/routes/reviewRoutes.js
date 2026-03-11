import express from 'express';
import {
  createReview,
  getProductReviews,
  getMyReviews,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, createReview);
router.route('/my').get(protect, getMyReviews);
router.route('/product/:productId').get(getProductReviews);

export default router;
