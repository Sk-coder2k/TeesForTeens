import User from '../models/User.js';
import Order from '../models/Order.js';
import bcrypt from 'bcryptjs';

// @desc    Get logged-in user's own orders
// @route   GET /api/users/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name    = req.body.name    ?? user.name;
    user.phone   = req.body.phone   ?? user.phone;
    user.address = req.body.address ?? user.address;

    if (req.body.defaultShipping) {
      user.defaultShipping = { ...user.defaultShipping?.toObject?.() || {}, ...req.body.defaultShipping };
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      defaultShipping: updated.defaultShipping,
      role: updated.role,
      image: updated.image,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change logged-in user's password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});

    // Get order counts for all users in one query
    const orderCounts = await Order.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    const orderCountMap = {};
    orderCounts.forEach(({ _id, count }) => {
      orderCountMap[_id?.toString()] = count;
    });

    const usersWithOrders = users.map(u => ({
      ...u.toObject(),
      orderCount: orderCountMap[u._id.toString()] || 0
    }));

    res.json(usersWithOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
