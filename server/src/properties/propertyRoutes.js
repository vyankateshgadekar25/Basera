const express = require('express');
const { authenticateToken, requireRole } = require('../auth/authMiddleware');
const {
  createProperty, getMyProperties, getProperty, updateProperty, deleteProperty
} = require('./propertyController');

const router = express.Router();

router.post('/', authenticateToken, requireRole('owner'), createProperty);
router.get('/mine', authenticateToken, requireRole('owner'), getMyProperties);
router.get('/:id', authenticateToken, requireRole('owner'), getProperty);
router.put('/:id', authenticateToken, requireRole('owner'), updateProperty);
router.delete('/:id', authenticateToken, requireRole('owner'), deleteProperty);

module.exports = router;
