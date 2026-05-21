const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');


router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address ||
        !shippingAddress.city || !shippingAddress.phone) {
      return res.status(400).json({ message: 'Incomplete shipping address' });
    }
    if (!['Card', 'Cash on Delivery', 'Vodafone Cash'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // 1) Validate all items first
    let itemsPrice = 0;
    const orderItems = [];
    const stockUpdates = []; // { productId, qty }

    for (const item of items) {
      if (!mongoose.isValidObjectId(item.product)) {
        return res.status(400).json({ message: `Invalid product id: ${item.product}` });
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: 'Each item must have a positive integer quantity' });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: qty,
      });
      itemsPrice += product.price * qty;
      stockUpdates.push({ productId: product._id, qty });
    }

    const shippingPrice = itemsPrice > 5000 ? 0 : 99;
    const taxPrice = Math.round(itemsPrice * 0.14);
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // 2) Create the order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });

    // 3) Decrement stock only after order is safely created.
    await Promise.all(
      stockUpdates.map((u) =>
        Product.updateOne({ _id: u.productId }, { $inc: { stock: -u.qty } })
      )
    );

    res.status(201).json(order);
  })
);

// GET /api/orders/myorders
router.get(
  '/myorders',
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  })
);

// GET /api/orders/:id
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(order);
  })
);

// PUT /api/orders/:id/pay
router.put(
  '/:id/pay',
  protect,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only the owner can mark their own order as paid
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'Processing';
    order.paymentResult = {
      id: req.body.id || `PAY-${Date.now()}`,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };

    const updated = await order.save();
    res.json(updated);
  })
);

module.exports = router;
