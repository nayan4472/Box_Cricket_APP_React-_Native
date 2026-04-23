const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiration: { type: Number, required: true },
  username: { type: String },
  password: { type: String },
});

module.exports = mongoose.model('OTP', otpSchema);
