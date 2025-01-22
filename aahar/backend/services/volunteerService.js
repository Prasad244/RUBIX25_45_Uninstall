const User = require('../models/User');
const Donation = require('../models/donation');

const volunteerService = {
  getAvailableDonations: async (location, radius) => {
    return await Donation.find({
      status: 'available',
      'pickupDetails.address.city': location
    }).populate('donor', 'name rating address');
  },

  updateVolunteerStatus: async (volunteerId, status) => {
    return await User.findByIdAndUpdate(
      volunteerId,
      { $set: { 'volunteer.status': status } },
      { new: true }
    );
  },

  trackVolunteerMetrics: async (volunteerId, metrics) => {
    const update = {};
    if (metrics.hours) {
      update.$inc = { 'impactMetrics.volunteringHours': metrics.hours };
    }
    return await User.findByIdAndUpdate(volunteerId, update, { new: true });
  }
};