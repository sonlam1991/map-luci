const mongoose = require('mongoose');

const SpeedSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  tinhThanhPho: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  changeSpeed: {
    type: Boolean,
    required: false
  },
  gocHuong: {
    type: String,
    required: false
  },
  lon: {
    type: Number,
    required: false
  },
  lat: {
    type: Number,
    required: false
  },
  minSpeed: {
    type: Number,
    required: false
  },
  maxSpeed: {
    type: Number,
    required: false
  },
  status: {
    type: Number,
    required: false
  },
  addressData: {
    type: Object,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Speeds = mongoose.model('speed', SpeedSchema);

module.exports = Speeds;
