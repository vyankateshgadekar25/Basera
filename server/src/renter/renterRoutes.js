const express = require('express');
const { authenticateToken, requireRole } = require('../auth/authMiddleware');
const { getMyStay, getMyArchivedStays } = require('./renterController');

const router = express.Router();

router.get('/my-stay', authenticateToken, requireRole('renter'), getMyStay);
router.get('/my-archived-stays', authenticateToken, requireRole('renter'), getMyArchivedStays);

module.exports = router;
