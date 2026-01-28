const express = require('express');
const router = express.Router();
const { getStats, getDepartmentSummary, getLocationSummary } = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/stats', getStats);
router.get('/department-summary', getDepartmentSummary);
router.get('/location-summary', getLocationSummary);

module.exports = router;
