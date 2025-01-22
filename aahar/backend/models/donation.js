const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodDetails: {
    type: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    quantity: {
      amount: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        required: true
      }
    },
    preparedTime: Date,
    expiryTime: {
      type: Date,
      required: true
    },
    dietaryInfo: [{
      type: String
    }],
    allergens: [{
      type: String
    }]
  },
  pickupDetails: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    availableTimeStart: Date,
    availableTimeEnd: Date,
    specialInstructions: String
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'in-transit', 'delivered', 'cancelled'],
    default: 'available'
  },
  assignedTo: {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  qualityMetrics: {
    temperature: Number,
    packagingQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  tracking: [{
    status: String,
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [Number]
    },
    timestamp: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
donationSchema.index({ "tracking.location": "2dsphere" });

// Index for searching donations
donationSchema.index({ 
  "foodDetails.type": "text",
  "foodDetails.description": "text"
});

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;