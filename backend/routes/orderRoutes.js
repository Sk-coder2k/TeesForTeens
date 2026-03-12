import express from 'express';
import {
  addOrderItems,
  getOrderById,
  getOrders,
  updateOrderStatus,
  getDashboardStats,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/dashboard-stats').get(protect, admin, getDashboardStats);
router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/:id').get(protect, getOrderById).delete(protect, admin, deleteOrder);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
