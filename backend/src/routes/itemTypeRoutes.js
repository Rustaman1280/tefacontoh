const express = require('express');
const router = express.Router();
const {
    getItemTypes,
    getItemTypesGrouped,
    getItemType,
    createItemType,
    updateItemType,
    deleteItemType
} = require('../controllers/itemTypeController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.route('/')
    .get(getItemTypes)
    .post(createItemType);

router.get('/grouped', getItemTypesGrouped);

router.route('/:id')
    .get(getItemType)
    .put(updateItemType)
    .delete(deleteItemType);

module.exports = router;
