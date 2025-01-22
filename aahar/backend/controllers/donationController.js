const Donation = require('../models/donation');
const User = require('../models/User');
const { sendNotification } = require('../utils/notifications');

const donationController = {
  // Create a new donation
  createDonation: async (req, res) => {
    try {
      const donation = new Donation({
        donor: req.user._id,
        ...req.body
      });
      
      await donation.save();
      
      // Update donor's impact metrics
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'impactMetrics.totalDonations': 1 }
      });
      
      // Notify nearby volunteers
      await sendNotification('NEW_DONATION', {
        donation: donation._id,
        location: donation.pickupDetails.address
      });
      
      res.status(201).json(donation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // List available donations with filters
  listDonations: async (req, res) => {
    try {
      const { foodType, location, urgent, page = 1, limit = 10 } = req.query;
      
      let query = { status: 'available' };
      
      if (foodType) {
        query['foodDetails.type'] = foodType;
      }
      
      if (urgent) {
        const urgentTime = new Date();
        urgentTime.setHours(urgentTime.getHours() + 24);
        query['foodDetails.expiryTime'] = { $lt: urgentTime };
      }
      
      if (location) {
        // Add location-based query using MongoDB geospatial queries
        query['pickupDetails.address.city'] = location;
      }
      
      const donations = await Donation.find(query)
        .populate('donor', 'name rating')
        .sort({ 'foodDetails.expiryTime': 1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      const total = await Donation.countDocuments(query);
      
      res.json({
        donations,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update donation status
  updateDonationStatus: async (req, res) => {
    try {
      const { donationId } = req.params;
      const { status, volunteerId, recipientId } = req.body;
      
      const donation = await Donation.findById(donationId);
      
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }
      
      donation.status = status;
      
      if (volunteerId) {
        donation.assignedTo.volunteer = volunteerId;
      }
      
      if (recipientId) {
        donation.assignedTo.recipient = recipientId;
      }
      
      // Add tracking information
      donation.tracking.push({
        status,
        timestamp: new Date(),
        updatedBy: req.user._id,
        location: req.body.location
      });
      
      await donation.save();
      
      // Send notifications based on status change
      await sendNotification(status, {
        donation: donation._id,
        donor: donation.donor,
        volunteer: donation.assignedTo.volunteer,
        recipient: donation.assignedTo.recipient
      });
      
      res.json(donation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = donationController;