const express = require('express');
const { authenticateToken, requireRole } = require('../auth/authMiddleware');
const { submitPayment, getMyBills } = require('./paymentController');

const router = express.Router();

router.post('/submit', authenticateToken, requireRole('renter'), submitPayment);
router.get('/my-bills', authenticateToken, requireRole('renter'), getMyBills);

module.exports = router;
