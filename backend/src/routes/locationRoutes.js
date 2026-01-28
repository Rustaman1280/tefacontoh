const express = require('express');
const router = express.Router();
const {
    getLocations,
    getLocationsGrouped,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    bulkCreateLocations
} = require('../controllers/locationController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.route('/')
    .get(getLocations)
    .post(createLocation);

router.get('/grouped', getLocationsGrouped);
router.post('/bulk', bulkCreateLocations);

router.route('/:id')
    .get(getLocation)
    .put(updateLocation)
    .delete(deleteLocation);

module.exports = router;
