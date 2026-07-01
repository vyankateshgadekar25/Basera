const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendOTP, verifyOTP } = require('./authController');

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,                    // 5 attempts per IP per 10 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Wait 10 minutes and try again.' },
});

router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', otpLimiter, verifyOTP);

module.exports = router;