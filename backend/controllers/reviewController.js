import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Create a review for a product (only if order is delivered)
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment } = req.body;

    // 1. Verify the order exists, belongs to this user, and is delivered
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This order does not belong to you' });
    }

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ message: 'You can only review products from delivered orders' });
    }

    // 2. Verify the product is part of this order
    const itemInOrder = order.orderItems.find(
      (item) => item.product.toString() === productId
    );
    if (!itemInOrder) {
      return res.status(400).json({ message: 'This product is not in the specified order' });
    }

    // 3. Check for duplicate review
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
      order: orderId,
    });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product for this order' });
    }

    // 4. Create the review
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating: Number(rating),
      title,
      comment,
    });

    // 5. Recalculate product rating and numReviews
    const allReviews = await Review.find({ product: productId });
    const numReviews = allReviews.length;
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10, // e.g. 4.3
      numReviews,
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate review' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews the current user has written (to check which items are already reviewed)
// @route   GET /api/reviews/my
// @access  Private
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).select('product order rating');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
