const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  vertical: { type: String, required: true, enum: ['3d-printing', 'fashion', 'beauty'] },
  category: { type: String, required: true },
  brand: { type: String, default: '3DOM Tech' },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  stock: { type: Number, default: 10 },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  image: { type: String, required: true },
  description: { type: String, default: '' },
  attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
  isFeatured: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
