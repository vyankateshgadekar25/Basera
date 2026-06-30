const express = require('express');
const { authenticateToken, requireRole } = require('../auth/authMiddleware');
const { createBed, updateBed, deleteBed } = require('./bedController');

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/rooms/:roomId/beds', authenticateToken, requireRole('owner'), createBed);
router.put('/:propertyId/rooms/:roomId/beds/:bedId', authenticateToken, requireRole('owner'), updateBed);
router.delete('/:propertyId/rooms/:roomId/beds/:bedId', authenticateToken, requireRole('owner'), deleteBed);

module.exports = router;
