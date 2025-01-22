const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['donor', 'recipient', 'volunteer', 'admin'],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String  // URLs to uploaded documents
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  impactMetrics: {
    totalDonations: { type: Number, default: 0 },
    peopleServed: { type: Number, default: 0 },
    volunteringHours: { type: Number, default: 0 }
  },
  rewards: {
    points: { type: Number, default: 0 },
    badges: [String],
    certificates: [{
      type: String,
      documentUrl: String,
      issuedDate: Date
    }]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;