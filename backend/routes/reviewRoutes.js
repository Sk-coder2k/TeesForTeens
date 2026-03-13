import express from 'express';
import {
  createReview,
  getProductReviews,
  getMyReviews,
  getAllReviews,
  replyToReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, createReview);
router.route('/my').get(protect, getMyReviews);
router.route('/product/:productId').get(getProductReviews);
router.route('/admin/all').get(protect, admin, getAllReviews);
router.route('/:id/reply').put(protect, admin, replyToReview);
router.route('/:id').delete(protect, admin, deleteReview);

export default router;
