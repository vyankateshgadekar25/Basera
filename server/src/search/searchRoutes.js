const express = require('express');
const { searchProperties, getPropertyPublic } = require('./searchController');

const router = express.Router();

router.get('/', searchProperties);
router.get('/property/:id', getPropertyPublic);

module.exports = router;
