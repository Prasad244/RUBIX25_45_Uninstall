// controllers/donorController.js
const User = require('../models/User');
const Donation = require('../models/donation');

const donorController = {
  // Get donor dashboard data
  getDashboard: async (req, res) => {
    try {
      const donorId = req.user._id;
      
      // Get donation statistics
      const totalDonations = await Donation.countDocuments({ donor: donorId });
      const activeDonations = await Donation.countDocuments({ 
        donor: donorId,
        status: { $in: ['available', 'assigned'] }
      });
      
      // Get impact metrics
      const impactMetrics = await Donation.aggregate([
        { $match: { donor: donorId } },
        { $group: {
          _id: null,
          totalQuantity: { $sum: '$foodDetails.quantity.amount' },
          peopleServed: { $sum: '$impactMetrics.peopleServed' },
          carbonSaved: { $sum: '$impactMetrics.carbonSaved' }
        }}
      ]);

      // Get recent donations
      const recentDonations = await Donation.find({ donor: donorId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assignedTo.volunteer', 'name');

      res.json({
        statistics: {
          totalDonations,
          activeDonations,
          impactMetrics: impactMetrics[0] || {}
        },
        recentDonations
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Generate tax certificate
  generateTaxCertificate: async (req, res) => {
    try {
      const { year } = req.params;
      const donorId = req.user._id;
      
      // Get all donations for the specified year
      const donations = await Donation.find({
        donor: donorId,
        status: 'delivered',
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31)
        }
      });

      // Calculate total contribution value
      const totalValue = donations.reduce((sum, donation) => 
        sum + (donation.foodDetails.estimatedValue || 0), 0);

      // Generate certificate metadata
      const certificateData = {
        certificateNumber: `TC-${year}-${donorId.toString().slice(-6)}`,
        donorName: req.user.name,
        year,
        totalDonations: donations.length,
        totalValue,
        issuedDate: new Date()
      };

      // Update user's certificates array
      await User.findByIdAndUpdate(donorId, {
        $push: { 'rewards.certificates': certificateData }
      });

      res.json(certificateData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get donation history with filters
  getDonationHistory: async (req, res) => {
    try {
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
      const query = { donor: req.user._id };

      if (status) {
        query.status = status;
      }
      
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const donations = await Donation.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('assignedTo.volunteer', 'name')
        .populate('assignedTo.recipient', 'name');

      const total = await Donation.countDocuments(query);

      res.json({
        donations,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update donor profile and preferences
  updateDonorProfile: async (req, res) => {
    try {
      const {
        organizationType,
        preferredPickupTimes,
        notificationPreferences,
        foodSafetyCredentials
      } = req.body;

      const updatedDonor = await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            'donor.organizationType': organizationType,
            'donor.preferredPickupTimes': preferredPickupTimes,
            'donor.notificationPreferences': notificationPreferences,
            'donor.foodSafetyCredentials': foodSafetyCredentials
          }
        },
        { new: true }
      );

      res.json(updatedDonor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = donorController;