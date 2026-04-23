const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  area: { type: String, required: true },
  slotTime: { type: String, required: true },
  price: { type: Number, required: true },
  advancePayment: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  bookingDate: { type: String, required: true }, // ✅ added field
}, {
  timestamps: true, // optional: adds createdAt and updatedAt fields
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
