// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  images: [String],
  verifiedDelivery: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// models/Event.js
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['food-drive', 'volunteer-training', 'awareness-campaign'],
    required: true
  },
  date: {
    start: Date,
    end: Date
  },
  location: {
    address: String,
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled']
    }
  }],
  capacity: Number,
  requirements: [String]
});

// models/Report.js
const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    required: true,
    enum: ['User', 'Donation', 'Review']
  },
  reason: {
    type: String,
    required: true
  },
  description: String,
  evidence: [String],
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending'
  },
  resolution: {
    action: String,
    notes: String,
    date: Date
  }
});