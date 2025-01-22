// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  };
  
  // middleware/asyncHandler.js
  const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  
  // middleware/uploadMiddleware.js
  const multer = require('multer');
  const path = require('path');
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|pdf/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      if (extname) {
        return cb(null, true);
      }
      cb('Error: Only jpeg, jpg, png, pdf files are allowed!');
    }
  });
  
  // utils/notificationService.js
  const nodemailer = require('nodemailer');
  const twilio = require('twilio');
  
  const emailTransporter = nodemailer.createTransport({
    // Configure your email service
  });
  
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  const sendNotification = async (type, recipients, content) => {
    switch(type) {
      case 'EMAIL':
        await emailTransporter.sendMail({
          to: recipients.email,
          subject: content.subject,
          html: content.html
        });
        break;
      case 'SMS':
        await twilioClient.messages.create({
          body: content.message,
          to: recipients.phone,
          from: process.env.TWILIO_PHONE_NUMBER
        });
        break;
    }
  };
  
  // utils/geocoding.js
  const axios = require('axios');
  
  const geocodeAddress = async (address) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );
      return response.data.results[0].geometry.location;
    } catch (error) {
      throw new Error('Geocoding failed');
    }
  };