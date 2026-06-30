const express = require('express');
const { authenticateToken, requireRole } = require('../auth/authMiddleware');
const { generateBills, getOwnerBills, reviewPayment } = require('./billController');

const router = express.Router();

router.post('/generate', authenticateToken, requireRole('owner'), generateBills);
router.get('/owner', authenticateToken, requireRole('owner'), getOwnerBills);
router.post('/:billId/review', authenticateToken, requireRole('owner'), reviewPayment);

module.exports = router;
