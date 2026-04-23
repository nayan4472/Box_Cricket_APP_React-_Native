const mongoose = require('mongoose');

const AreaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true }, // Store image URL or base64
});

module.exports = mongoose.model('Area', AreaSchema);
