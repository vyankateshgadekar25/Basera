const express = require('express');
const { authenticateToken, requireRole } = require('../auth/authMiddleware');
const { createRating, replyToRating, getPropertyRatings } = require('./ratingController');

const router = express.Router();

router.post('/', authenticateToken, requireRole('renter'), createRating);
router.post('/:ratingId/reply', authenticateToken, requireRole('owner'), replyToRating);
router.get('/property/:propertyId', getPropertyRatings);

module.exports = router;
