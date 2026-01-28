const express = require('express');
const router = express.Router();
const {
    getAssets,
    getAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    getAssetLogs
} = require('../controllers/assetController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.route('/')
    .get(getAssets)
    .post(createAsset);

router.route('/:id')
    .get(getAsset)
    .put(updateAsset)
    .delete(deleteAsset);

router.get('/:id/logs', getAssetLogs);

module.exports = router;
