// routes/donorRoutes.js
const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes are protected and require donor role
router.use(protect);
router.use(authorize('donor'));

// Get donor dashboard data
router.get('/dashboard', donorController.getDashboard);

// Get donation history with filters
router.get('/donations/history', donorController.getDonationHistory);

// Generate tax certificate for a specific year
router.get('/tax-certificate/:year', donorController.generateTaxCertificate);

// Update donor profile and preferences
router.put('/profile', donorController.updateDonorProfile);

// Upload verification documents
router.post('/verify', 
  upload.array('documents', 5),  // Allow up to 5 documents
  async (req, res) => {
    try {
      const documentUrls = req.files.map(file => file.path);
      const updatedDonor = await donorService.updateVerificationStatus(
        req.user._id, 
        documentUrls
      );
      res.json(updatedDonor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get donor analytics
router.get('/analytics', async (req, res) => {
  try {
    const { timeframe = 30 } = req.query; // Default to 30 days
    const analytics = await donorService.getDonorAnalytics(
      req.user._id,
      parseInt(timeframe)
    );
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;