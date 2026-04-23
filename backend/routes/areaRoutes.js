const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Area = require('../models/Area'); // Ensure this model is correctly defined

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// ✅ Add a new area with image upload
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // Store file path

    // Validation check
    if (!name || !image) {
      return res.status(400).json({ error: 'Name and image are required' });
    }

    const newArea = new Area({ name, image });
    await newArea.save();
    res.status(201).json({ message: 'Area added successfully', area: newArea });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all areas
router.get('/all', async (req, res) => {
  try {
    const areas = await Area.find();
    res.json(areas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete an area
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid area ID' });
    }

    const deletedArea = await Area.findByIdAndDelete(id);
    if (!deletedArea) {
      return res.status(404).json({ error: 'Area not found' });
    }

    res.json({ message: 'Area deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update an area (Now Supports Image Upload)
router.put('/update/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid area ID' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updatedData = { name };
    if (image) updatedData.image = image;

    const updatedArea = await Area.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    });

    if (!updatedArea) {
      return res.status(404).json({ error: 'Area not found' });
    }

    res.json({ message: 'Area updated successfully', area: updatedArea });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Serve uploaded images statically
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;
