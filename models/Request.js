const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerEmail: { type: String, required: true },
  whatsappNumber: { type: String, default: 'N/A' },
  requestedItem: { type: String, required: true },
  requiredDate: { type: String, default: 'As soon as possible' },
  deliveryAddress: { type: String, default: 'N/A' },
  status: { type: String, enum: ['pending', 'in-progress', 'fulfilled', 'rejected'], default: 'pending' }
}, {
  timestamps: true
});

module.exports = mongoose.models.Request || mongoose.model('Request', requestSchema);
