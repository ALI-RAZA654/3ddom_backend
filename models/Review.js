const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  customerName: { type: String, default: 'Anonymous' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' }
}, {
  timestamps: true
});

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
