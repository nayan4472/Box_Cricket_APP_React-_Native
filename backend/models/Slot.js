const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  area: { type: String, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model('Slot', slotSchema);
