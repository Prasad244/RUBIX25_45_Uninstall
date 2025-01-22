const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationType: {
    type: String,
    enum: ['restaurant', 'hotel', 'catering', 'supermarket', 'individual', 'other'],
    required: true
  },
  businessName: {
    type: String,
    required: function() {
      return this.organizationType !== 'individual';
    }
  },
  foodSafetyCredentials: [{
    certificateType: String,
    certificateNumber: String,
    issuingAuthority: String,
    expiryDate: Date,
    documentUrl: String
  }],
  preferredPickupTimes: [{
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String
  }],
  storageCapacity: {
    refrigerated: Number,  // in cubic feet
    frozen: Number,
    dry: Number
  },
  donationSchedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'irregular']
    },
    typicalQuantity: Number,
    preferredNoticeTime: Number  // in hours
  },
  taxInformation: {
    taxId: String,
    registrationNumber: String,
    taxExemptStatus: Boolean
  },
  qualityMetrics: {
    totalRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    reportedIncidents: { type: Number, default: 0 },
    lastInspectionDate: Date
  }
}, {
  timestamps: true
});

// models/volunteer.js
const volunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availability: [{
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String,
    recurring: Boolean
  }],
  skills: [{
    type: String,
    enum: ['driving', 'food_handling', 'heavy_lifting', 'coordination', 'food_safety_certified']
  }],
  vehicle: {
    hasVehicle: Boolean,
    type: {
      type: String,
      enum: ['car', 'van', 'truck', 'motorcycle', 'bicycle']
    },
    capacity: Number,  // in cubic feet
    temperatureControlled: Boolean
  },
  serviceArea: {
    radius: Number,  // in kilometers
    preferredLocations: [{
      type: String  // area/neighborhood names
    }]
  },
  verificationStatus: {
    backgroundCheck: {
      completed: Boolean,
      date: Date,
      status: String,
      documentUrl: String
    },
    foodSafetyCertification: {
      completed: Boolean,
      certificateNumber: String,
      expiryDate: Date,
      documentUrl: String
    },
    driverLicense: {
      verified: Boolean,
      number: String,
      expiryDate: Date
    }
  },
  metrics: {
    completedDeliveries: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    reliabilityScore: { type: Number, default: 100 },
    averageResponseTime: { type: Number, default: 0 },  // in minutes
    cancelledDeliveries: { type: Number, default: 0 }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  }
}, {
  timestamps: true
});

// Add methods to both schemas
[donorSchema, volunteerSchema].forEach(schema => {
  schema.methods.updateMetrics = async function(newMetrics) {
    Object.assign(this.metrics, newMetrics);
    return await this.save();
  };
});

const Donor = mongoose.model('Donor', donorSchema);
const Volunteer = mongoose.model('Volunteer', volunteerSchema);

module.exports = { Donor, Volunteer };