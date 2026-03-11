import express from 'express';
import {
  createStripePaymentIntent,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/stripe', createStripePaymentIntent);
router.post('/razorpay', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
