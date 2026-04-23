const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const Booking = require('../models/Booking'); // Ensure this model exists

// Get all slots
router.get('/all', async (req, res) => {
  try {
    const slots = await Slot.find();
    res.json(slots);
  } catch (error) {
    console.error("Error fetching all slots:", error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Get available slots for a specific area
router.get('/available/:area/:date', async (req, res) => {
  try {
    const { area, date } = req.params;

    // Fetch all slots for the area
    const slots = await Slot.find({ area });

    // Fetch bookings for the selected date
    const bookings = await Booking.find({ area, bookingDate: date });

    const bookedTimes = bookings.map(b => b.slotTime); // Fix field name

    // Mark slots as booked or not
    const formattedSlots = slots.map(slot => {
      const slotTime = `${slot.start_time} - ${slot.end_time}`;
      return {
        _id: slot._id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        price: slot.price,
        isBooked: bookedTimes.includes(slotTime),
      };
    });

    res.json(formattedSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Add a new slot
router.post('/add', async (req, res) => {
  try {
    const { area, start_time, end_time, price } = req.body;

    if (!area || !start_time || !end_time || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newSlot = new Slot({ area, start_time, end_time, price });
    await newSlot.save();
    res.json({ message: 'Slot added successfully' });
  } catch (error) {
    console.error("Error adding slot:", error);
    res.status(500).json({ error: 'Failed to add slot' });
  }
});

// Update a slot
router.put('/update/:id', async (req, res) => {
  try {
    const { area, start_time, end_time, price } = req.body;

    if (!area || !start_time || !end_time || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const updatedSlot = await Slot.findByIdAndUpdate(
      req.params.id,
      { area, start_time, end_time, price },
      { new: true, runValidators: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    res.json({ message: 'Slot updated successfully', updatedSlot });
  } catch (error) {
    console.error("Error updating slot:", error);
    res.status(500).json({ error: 'Failed to update slot' });
  }
});

// Delete a slot
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedSlot = await Slot.findByIdAndDelete(req.params.id);
    if (!deletedSlot) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error("Error deleting slot:", error);
    res.status(500).json({ error: 'Failed to delete slot' });
  }
});

// Book a slot
router.post('/book', async (req, res) => {
  try {
    const { userEmail, area, slotTime, price } = req.body;

    if (!userEmail || !area || !slotTime || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the slot is already booked
    const existingBooking = await Booking.findOne({ area, slotTime });
    if (existingBooking) {
      return res.status(400).json({ error: 'Slot is already booked' });
    }

    // Create a new booking
    const newBooking = new Booking({ userEmail, area, slotTime, price });
    await newBooking.save();

    res.json({ message: 'Slot booked successfully' });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ error: 'Failed to book slot' });
  }
});

// Get booked slots for a specific user
router.get('/booked/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    const bookings = await Booking.find({ userEmail });

    if (!bookings || bookings.length === 0) {
      return res.json([]);
    }

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

// Cancel a booked slot
router.delete('/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cancelledBooking = await Booking.findByIdAndDelete(id);

    if (!cancelledBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;
