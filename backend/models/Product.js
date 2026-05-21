const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['iPhone', 'iPad', 'MacBook', 'Android', 'Tablet', 'Accessories', 'Laptop', 'Smartwatch'],
    },
    brand: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0, min: 0 },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    specifications: { type: Map, of: String, default: {} },
    featured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Recompute average rating + review count whenever reviews change
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.numReviews = this.reviews.length;
    this.rating =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
  }
};

// Text search index (used by /api/products?search=...)
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
