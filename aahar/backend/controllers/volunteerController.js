const volunteerService = require('../services/volunteerService');
const Donation = require('../models/donation');

const volunteerController = {
  getAvailablePickups: async (req, res) => {
    try {
      const { location, radius } = req.query;
      const donations = await volunteerService.getAvailableDonations(location, radius);
      res.json(donations);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  acceptPickup: async (req, res) => {
    try {
      const { donationId } = req.params;
      const volunteerId = req.user._id;

      const donation = await Donation.findById(donationId);
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }

      if (donation.status !== 'available') {
        return res.status(400).json({ message: 'Donation is no longer available' });
      }

      donation.status = 'assigned';
      donation.assignedTo.volunteer = volunteerId;
      donation.tracking.push({
        status: 'assigned',
        timestamp: new Date(),
        updatedBy: volunteerId
      });

      await donation.save();
      res.json(donation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateDeliveryStatus: async (req, res) => {
    try {
      const { donationId } = req.params;
      const { status, location } = req.body;
      const volunteerId = req.user._id;

      const donation = await Donation.findById(donationId);
      if (!donation || donation.assignedTo.volunteer.toString() !== volunteerId.toString()) {
        return res.status(404).json({ message: 'Donation not found or not assigned to you' });
      }

      donation.status = status;
      donation.tracking.push({
        status,
        location,
        timestamp: new Date(),
        updatedBy: volunteerId
      });

      if (status === 'delivered') {
        await volunteerService.trackVolunteerMetrics(volunteerId, { hours: 1 });
      }

      await donation.save();
      res.json(donation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getVolunteerMetrics: async (req, res) => {
    try {
      const volunteer = await User.findById(req.user._id)
        .select('impactMetrics');
      res.json(volunteer.impactMetrics);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = volunteerController;