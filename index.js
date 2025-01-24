require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Device = require('./models/Device');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === process.env.FIXED_USER_EMAIL && password === process.env.FIXED_USER_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Get all devices for a user
app.get('/api/devices/:userEmail', async (req, res) => {
  try {
    const devices = await Device.find({ userEmail: req.params.userEmail })
      .sort({ timestamp: -1 });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add or update a device
app.post('/api/devices', async (req, res) => {
  try {
    const { userEmail, visitorId, browserName, os, device, ip } = req.body;
    
    // Try to find existing device
    const existingDevice = await Device.findOne({ userEmail, visitorId });
    
    if (existingDevice) {
      // Update existing device
      existingDevice.browserName = browserName;
      existingDevice.os = os;
      existingDevice.device = device;
      existingDevice.ip = ip;
      existingDevice.timestamp = new Date();
      await existingDevice.save();
      res.json(existingDevice);
    } else {
      // Create new device
      const newDevice = new Device({
        userEmail,
        visitorId,
        browserName,
        os,
        device,
        ip
      });
      await newDevice.save();
      res.status(201).json(newDevice);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a device
app.delete('/api/devices/:userEmail/:visitorId', async (req, res) => {
  try {
    const { userEmail, visitorId } = req.params;
    await Device.findOneAndDelete({ userEmail, visitorId });
    res.json({ message: 'Device deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 