// services/donorService.js
const User = require('../models/User');
const Donation = require('../models/donation');

const donorService = {
  // Calculate donor's impact metrics
  calculateImpactMetrics: async (donorId) => {
    try {
      const metrics = await Donation.aggregate([
        { 
          $match: { 
            donor: donorId,
            status: 'delivered'
          }
        },
        {
          $group: {
            _id: null,
            totalDonations: { $sum: 1 },
            totalQuantity: { 
              $sum: '$foodDetails.quantity.amount'
            },
            totalPeopleServed: { 
              $sum: '$impactMetrics.peopleServed'
            },
            carbonFootprint: {
              $sum: '$impactMetrics.carbonSaved'
            }
          }
        }
      ]);

      return metrics[0] || null;
    } catch (error) {
      throw new Error('Error calculating impact metrics: ' + error.message);
    }
  },

  // Generate reward points based on donation activity
  updateRewardPoints: async (donorId, donation) => {
    try {
      // Calculate points based on donation quantity and type
      const basePoints = donation.foodDetails.quantity.amount * 10;
      let bonusPoints = 0;

      // Bonus points for quick pickup (within 2 hours of posting)
      const responseTime = donation.assignedTo.volunteer 
        ? (new Date(donation.assignedTo.timestamp) - new Date(donation.createdAt)) / (1000 * 60 * 60)
        : null;
      
      if (responseTime && responseTime <= 2) {
        bonusPoints += 50;
      }

      // Bonus for regular donations (more than 5 in a month)
      const monthlyDonations = await Donation.countDocuments({
        donor: donorId,
        createdAt: {
          $gte: new Date(new Date().setDate(1)), // First day of current month
          $lte: new Date()
        }
      });

      if (monthlyDonations > 5) {
        bonusPoints += 100;
      }

      // Update donor's reward points
      await User.findByIdAndUpdate(donorId, {
        $inc: {
          'rewards.points': basePoints + bonusPoints
        }
      });

      return basePoints + bonusPoints;
    } catch (error) {
      throw new Error('Error updating reward points: ' + error.message);
    }
  },

  // Manage donor verification status
  updateVerificationStatus: async (donorId, verificationDocuments) => {
    try {
      const updateData = {
        verificationDocuments,
        verified: false, // Will be reviewed by admin
        'verificationStatus.lastUpdated': new Date(),
        'verificationStatus.documents': verificationDocuments
      };

      const donor = await User.findByIdAndUpdate(
        donorId,
        { $set: updateData },
        { new: true }
      );

      return donor;
    } catch (error) {
      throw new Error('Error updating verification status: ' + error.message);
    }
  },

  // Get donor analytics
  getDonorAnalytics: async (donorId, timeframe) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      const analytics = await Donation.aggregate([
        {
          $match: {
            donor: donorId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            donationCount: { $sum: 1 },
            totalQuantity: { $sum: '$foodDetails.quantity.amount' },
            successfulDeliveries: {
              $sum: {
                $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
              }
            },
            averagePickupTime: {
              $avg: {
                $subtract: [
                  { $arrayElemAt: ['$tracking.timestamp', 1] },
                  '$createdAt'
                ]
              }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      return analytics;
    } catch (error) {
      throw new Error('Error getting donor analytics: ' + error.message);
    }
  }
};

module.exports = donorService;