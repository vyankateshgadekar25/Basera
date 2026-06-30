const express = require('express');
const { authenticateToken, requireRole } = require('../auth/authMiddleware');
const { checkIn, checkOut, getPropertyTenants } = require('./tenancyController');

const router = express.Router();

router.post('/checkin', authenticateToken, requireRole('owner'), checkIn);
router.post('/:tenancy_id/checkout', authenticateToken, requireRole('owner'), checkOut);
router.get('/property/:propertyId', authenticateToken, requireRole('owner'), getPropertyTenants);

module.exports = router;
