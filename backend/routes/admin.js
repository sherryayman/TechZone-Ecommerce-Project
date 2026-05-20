const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// All admin routes require auth + admin role
router.use(protect, admin);

// ----- DASHBOARD STATS -----
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [totalProducts, totalOrders, totalUsers, revenueData, recentOrders, ordersByStatus, salesByMonth] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments(),
        Order.aggregate([
          { $match: { isPaid: true } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]),
        Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
        Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Order.aggregate([
          { $match: { isPaid: true } },
          {
            $group: {
              _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
              sales: { $sum: '$totalPrice' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 6 },
        ]),
      ]);

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      revenue: revenueData[0]?.total || 0,
      recentOrders,
      ordersByStatus,
      salesByMonth,
    });
  })
);

// ----- PRODUCTS CRUD -----
router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  })
);

router.post(
  '/products',
  asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  })
);

router.put(
  '/products/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  })
);

router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  })
);

// ----- ORDERS -----
router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  })
);

router.put(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json(order);
  })
);

// ----- USERS -----
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  })
);

router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    // Block admin from deleting themselves -> would lock the system out
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  })
);

module.exports = router;
