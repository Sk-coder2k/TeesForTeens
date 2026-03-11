import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Public (for now)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Admin only (skipped auth for now)
router.post('/', async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, expiry, status } = req.body;
    const couponExists = await Coupon.findOne({ code });

    if (couponExists) {
      return res.status(400).json({ message: 'Coupon already exists' });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderValue,
      expiry,
      status,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Admin only (skipped auth for now)
router.put('/:id', async (req, res) => {
  try {
    const { status, expiry, timesUsed } = req.body;
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      coupon.status = status || coupon.status;
      coupon.expiry = expiry || coupon.expiry;
      
      // Allow atomic increments if explicitly passed
      if (timesUsed !== undefined) {
          coupon.timesUsed = timesUsed;
      }

      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Admin only (skipped auth for now)
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await Coupon.deleteOne({ _id: coupon._id });
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
