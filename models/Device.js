const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  browserName: String,
  os: String,
  device: String,
  ip: String
});

// Compound index for userEmail and visitorId to ensure unique devices per user
deviceSchema.index({ userEmail: 1, visitorId: 1 }, { unique: true });

module.exports = mongoose.model('Device', deviceSchema); 