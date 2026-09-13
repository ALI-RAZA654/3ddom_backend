const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  vertical: { type: String }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, default: 'Guest Customer' },
    email: { type: String, default: 'guest@example.com' },
    phone: { type: String, default: 'N/A' },
    address: { type: String, default: 'N/A' }
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  couponCode: { type: String, default: null },
  paymentMethod: { type: String, default: 'Stripe Gateway' },
  paymentStatus: { type: String, default: 'paid' },
  orderStatus: { type: String, default: 'confirmed' },
  carrier: { type: String, default: 'Bluedart' },
  trackingNumber: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
