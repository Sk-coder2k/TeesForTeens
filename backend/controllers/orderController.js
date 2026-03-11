import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get dashboard stats
// @route   GET /api/orders/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [orders, products, users] = await Promise.all([
      Order.find({}).select('totalPrice createdAt orderStatus orderItems'),
      Product.countDocuments(),
      User.countDocuments({ isAdmin: false }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalOrders = orders.length;

    // Recent 5 orders with customer name
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name');

    // Top selling products by qty sold across all orders
    const salesMap = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const id = item.product?.toString();
        if (!id) return;
        if (!salesMap[id]) salesMap[id] = { qty: 0 };
        salesMap[id].qty += item.qty || 1;
      });
    });

    const topProductIds = Object.entries(salesMap)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([id]) => id);

    const topProducts = await Product.find({ _id: { $in: topProductIds } }).select('name price images');
    const topProductsWithSales = topProducts.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price,
      image: p.images?.[0] || '',
      sales: salesMap[p._id.toString()]?.qty || 0,
    })).sort((a, b) => b.sales - a.sales);

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts: products,
      totalCustomers: users,
      recentOrders: recentOrders.map(o => ({
        id: o._id,
        displayId: o.displayId,
        customer: o.user?.name || 'Guest',
        date: o.createdAt,
        total: o.totalPrice,
        status: o.orderStatus,
      })),
      topProducts: topProductsWithSales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      return res.json({ message: 'No order items' });
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'id name email phone');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = req.body.orderStatus || order.orderStatus;
      
      if (req.body.orderStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
