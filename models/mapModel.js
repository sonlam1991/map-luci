const mongoose = require('mongoose');

const MapSchema = new mongoose.Schema({
  lon: {
    type: String,
    required: true
  },
  lat: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Maps = mongoose.model('map', MapSchema);

module.exports = Maps;
