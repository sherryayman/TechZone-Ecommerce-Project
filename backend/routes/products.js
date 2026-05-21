const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

// GET /api/products  — supports filtering, search, sort, pagination
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      category, brand, minPrice, maxPrice,
      minRating, search, sort, featured,
      page = 1, limit = 12,
    } = req.query;

    const query = {};

    if (category && category !== 'All') query.category = category;
    if (brand) query.brand = { $in: brand.split(',') };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (featured === 'true') query.featured = true;
    if (search) query.$text = { $search: search };

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };
    const sortObj = sortMap[sort] || { featured: -1, createdAt: -1 };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sortObj).skip(skip).limit(limitNum),
    ]);

    res.json({
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  })
);


// GET /api/products/categories
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category');
    res.json(categories);
  })
);

// GET /api/products/featured
router.get(
  '/featured',
  asyncHandler(async (req, res) => {
    const products = await Product.find({ featured: true }).limit(8);
    res.json(products);
  })
);

// GET /api/products/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  })
);

// POST /api/products/:id/reviews  (authenticated users only)
router.post(
  '/:id/reviews',
  protect,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const rating = Number(req.body.rating);
    const comment = (req.body.comment || '').toString().trim();

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (!comment) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Already reviewed this product' });
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating,
      comment,
    });
    product.updateRating();
    await product.save();

    res.status(201).json({ message: 'Review added' });
  })
);

module.exports = router;
