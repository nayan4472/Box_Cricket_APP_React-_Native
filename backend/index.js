const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const Stripe = require('stripe');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const areaRoutes = require('./routes/areaRoutes');
const slotRoutes = require('./routes/slots');
const Booking = require('./models/Booking');
const User = require('./models/User');
const OTP = require('./models/OTP'); // Ensure correct import

dotenv.config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/areas', areaRoutes);
app.use('/slots', slotRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Always 6 digit OTP
}

// User Registration - Sends OTP
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiration = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Remove old OTP record if exists
    await OTP.deleteOne({ email });

    const newOtp = new OTP({ email, otp, expiration: otpExpiration, username, password: hashedPassword });
    await newOtp.save();

    // Send OTP to email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP for Registration',
      html: `<p>Your OTP for registration is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: 'Registration initiated! Please check your email for OTP.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Resend OTP
app.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  try {
    const existingOtp = await OTP.findOne({ email });

    if (!existingOtp) {
      return res.status(404).json({ success: false, message: 'No registration found with this email.' });
    }

    // Generate new OTP
    const otp = generateOTP();
    existingOtp.otp = otp;
    existingOtp.expiration = Date.now() + 10 * 60 * 1000; // reset expiration
    await existingOtp.save();

    // Send OTP to email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Resent OTP for Registration',
      html: `<p>Your new OTP for registration is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'OTP resent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
  }

  try {
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'No OTP found for this email.' });
    }

    if (otpRecord.expiration < Date.now()) {
      await OTP.deleteOne({ email }); // clean expired OTP
      return res.status(400).json({ success: false, message: 'OTP expired. Please register again.' });
    }

    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // OTP matched, create user
    const { username, password } = otpRecord;

    const newUser = new User({
      username,
      email,
      password,
      isVerified: true
    });

    await newUser.save();
    await OTP.deleteOne({ email }); // Clean up OTP after successful registration

    res.status(200).json({ success: true, message: 'OTP verified successfully! User registered.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'All fields are required.' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    res.status(200).json({ success: true, message: 'Login successful!', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Booking with Email
app.post('/bookings', async (req, res) => {
  try {
    const { area, slotTime, price, name, email, mobile, advancePayment, dueAmount, bookingDate } = req.body;

    if (!area || !slotTime || !price || !name || !email || !mobile || !bookingDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (await Booking.findOne({ area, slotTime, bookingDate })) {
      return res.status(400).json({ success: false, message: 'Slot already booked for this date' });
    }

    const newBooking = new Booking({
      name,
      email,
      mobile,
      area,
      slotTime,
      price,
      advancePayment,
      dueAmount,
      bookingDate
    });

    await newBooking.save();

    // Send Confirmation Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '📅 Box Cricket Booking Confirmation',
      html: `
        <h2>✅ Booking Confirmed!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your booking. Here are your booking details:</p>
        <ul>
          <li><strong>📍 Area:</strong> ${area}</li>
          <li><strong>🗓️ Booking Date:</strong> ${bookingDate}</li>
          <li><strong>🕒 Slot Time:</strong> ${slotTime}</li>
          <li><strong>💰 Price:</strong> ₹${price}</li>
          <li><strong>💵 Advance Paid:</strong> ₹${advancePayment}</li>
          <li><strong>💳 Due Amount:</strong> ₹${dueAmount}</li>
        </ul>
        <p>Enjoy your game! 🏏</p>
        <p>— Box Cricket Booking Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: 'Booking confirmed and email sent!', booking: newBooking });
  } catch (error) {
    console.error('Error booking or sending mail:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Get user's bookings
app.get('/userbooking', async (req, res) => {
  const { email } = req.query;
  try {
    const bookings = await Booking.find({ email }).sort({ bookingDate: -1 });
    res.json({ success: true, booking: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching bookings" });
  }
});

// Stripe Payment Intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || !currency) return res.status(400).json({ success: false, message: 'Amount and currency are required.' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card']
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel Booking
app.delete('/cancelBooking/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Save user's email and advance payment info before deleting
    const userEmail = booking.email; // adjust field name if different
    const user = booking.name;
    const advancePayment = booking.advancePayment || 0; // adjust field name if different

    // Delete the booking
    await Booking.findByIdAndDelete(req.params.id);

    // Send cancellation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Booking Cancellation Confirmation',
      text: `Dear ${user},

Your booking has been successfully cancelled.

Your advance payment of ₹${advancePayment} will be returned within 7 days.

Thank you for choosing our service.

Best regards,
Box Cricket`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending cancellation email:', error);
      } else {
        console.log('Cancellation email sent:', info.response);
      }
    });

    res.json({ success: true, message: 'Booking cancelled and email sent.' });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get All Bookings (Admin)
app.get('/allbookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ bookingDate: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get All Users
app.get('/getUsers', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
