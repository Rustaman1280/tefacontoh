const { ItemType, Asset } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all item types
// @route   GET /api/item-types
// @access  Private
const getItemTypes = async (req, res) => {
    try {
        const { search, item_category } = req.query;

        const where = {};
        
        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        if (item_category) {
            where.item_category = item_category;
        }

        const itemTypes = await ItemType.findAll({
            where,
            order: [['item_category', 'ASC'], ['name', 'ASC']]
        });

        res.json({
            success: true,
            data: itemTypes
        });
    } catch (error) {
        console.error('Get item types error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get item types grouped by category
// @route   GET /api/item-types/grouped
// @access  Private
const getItemTypesGrouped = async (req, res) => {
    try {
        const itemTypes = await ItemType.findAll({
            order: [['name', 'ASC']]
        });

        const grouped = {
            jurusan: itemTypes.filter(it => it.item_category === 'jurusan'),
            kelas: itemTypes.filter(it => it.item_category === 'kelas'),
            umum: itemTypes.filter(it => it.item_category === 'umum')
        };

        res.json({
            success: true,
            data: grouped
        });
    } catch (error) {
        console.error('Get item types grouped error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get single item type
// @route   GET /api/item-types/:id
// @access  Private
const getItemType = async (req, res) => {
    try {
        const itemType = await ItemType.findByPk(req.params.id, {
            include: [{
                model: Asset,
                as: 'assets'
            }]
        });

        if (!itemType) {
            return res.status(404).json({
                success: false,
                message: 'Item type not found'
            });
        }

        res.json({
            success: true,
            data: itemType
        });
    } catch (error) {
        console.error('Get item type error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Create item type
// @route   POST /api/item-types
// @access  Private
const createItemType = async (req, res) => {
    try {
        const { name, item_category, description, icon } = req.body;

        const itemType = await ItemType.create({
            name,
            item_category,
            description,
            icon
        });

        res.status(201).json({
            success: true,
            message: 'Item type created successfully',
            data: itemType
        });
    } catch (error) {
        console.error('Create item type error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update item type
// @route   PUT /api/item-types/:id
// @access  Private
const updateItemType = async (req, res) => {
    try {
        const itemType = await ItemType.findByPk(req.params.id);

        if (!itemType) {
            return res.status(404).json({
                success: false,
                message: 'Item type not found'
            });
        }

        const { name, item_category, description, icon } = req.body;

        await itemType.update({
            name,
            item_category,
            description,
            icon
        });

        res.json({
            success: true,
            message: 'Item type updated successfully',
            data: itemType
        });
    } catch (error) {
        console.error('Update item type error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Delete item type
// @route   DELETE /api/item-types/:id
// @access  Private
const deleteItemType = async (req, res) => {
    try {
        const itemType = await ItemType.findByPk(req.params.id);

        if (!itemType) {
            return res.status(404).json({
                success: false,
                message: 'Item type not found'
            });
        }

        // Check if item type has assets
        const assetCount = await Asset.count({ where: { item_type_id: itemType.id } });
        if (assetCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete item type. ${assetCount} asset(s) are using this item type.`
            });
        }

        await itemType.destroy();

        res.json({
            success: true,
            message: 'Item type deleted successfully'
        });
    } catch (error) {
        console.error('Delete item type error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

module.exports = {
    getItemTypes,
    getItemTypesGrouped,
    getItemType,
    createItemType,
    updateItemType,
    deleteItemType
};
