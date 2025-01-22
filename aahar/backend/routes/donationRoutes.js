const express = require('express');
const Donation = require('../models/donation');
const Donor = require('aahar\backend\models\donation.js');
const router = express.Router();

// Create a new donation
router.post('/donate', async (req, res) => {
  const { foodType, quantity, expirationDate, donorId } = req.body;

  try {
    // Check if the donor exists
    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(400).json({ error: 'Donor not found' });
    }

    // Create a new donation linked to the donor
    const newDonation = new Donation({
      foodType,
      quantity,
      expirationDate,
      donor: donorId,
    });

    await newDonation.save();
    res.status(201).json(newDonation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
