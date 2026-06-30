const express = require('express');
const { authenticateToken, requireRole } = require('../auth/authMiddleware');
const { createRoom, getRooms, updateRoom, deleteRoom } = require('./roomController');

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/rooms', authenticateToken, requireRole('owner'), createRoom);
router.get('/:propertyId/rooms', authenticateToken, requireRole('owner'), getRooms);
router.put('/:propertyId/rooms/:roomId', authenticateToken, requireRole('owner'), updateRoom);
router.delete('/:propertyId/rooms/:roomId', authenticateToken, requireRole('owner'), deleteRoom);

module.exports = router;
