import express from 'express';
import {
  getUsers,
  deleteUser,
  getUserById,
  getMyOrders,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/myorders').get(protect, getMyOrders);
router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.route('/password').put(protect, changePassword);
router.route('/').get(protect, admin, getUsers);
router.route('/:id').delete(protect, admin, deleteUser).get(protect, admin, getUserById);

export default router;
