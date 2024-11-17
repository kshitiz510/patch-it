const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
  },
  videoPath: { // Field for video storage
    type: String,
    required: true,
  },
}, { 
  timestamps: true,
});

// Add a 2dsphere index for geospatial queries
LocationSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Location', LocationSchema);
