const { Asset, Category, User, TransactionLog, Location, ItemType, Department } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private
const getAssets = async (req, res) => {
    try {
        const {
            search,
            category,
            condition,
            main_group,
            location_id,
            item_type_id,
            department_id,
            page = 1,
            limit = 10,
            sortBy = 'created_at',
            order = 'DESC'
        } = req.query;

        const where = {};
        const locationWhere = {};

        // Search by name or description
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Filter by category
        if (category) {
            where.category_id = category;
        }

        // Filter by condition
        if (condition) {
            where.condition = condition;
        }

        // Filter by location
        if (location_id) {
            where.location_id = location_id;
        }

        // Filter by item type
        if (item_type_id) {
            where.item_type_id = item_type_id;
        }

        // Filter by main group (through location)
        if (main_group) {
            locationWhere.main_group = main_group;
        }

        // Filter by department (through location)
        if (department_id) {
            locationWhere.department_id = department_id;
        }

        const offset = (page - 1) * limit;

        const { count, rows: assets } = await Asset.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sortBy, order.toUpperCase()]],
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Location,
                    as: 'locationDetail',
                    where: Object.keys(locationWhere).length > 0 ? locationWhere : undefined,
                    required: Object.keys(locationWhere).length > 0,
                    include: [{
                        model: Department,
                        as: 'department',
                        attributes: ['id', 'code', 'name']
                    }]
                },
                {
                    model: ItemType,
                    as: 'itemType',
                    attributes: ['id', 'name', 'item_category']
                }
            ]
        });

        res.json({
            success: true,
            data: assets,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get assets error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get single asset
// @route   GET /api/assets/:id
// @access  Private
const getAsset = async (req, res) => {
    try {
        const asset = await Asset.findByPk(req.params.id, {
            include: [
                {
                    model: Category,
                    as: 'category'
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Location,
                    as: 'locationDetail',
                    include: [{
                        model: Department,
                        as: 'department'
                    }]
                },
                {
                    model: ItemType,
                    as: 'itemType'
                },
                {
                    model: TransactionLog,
                    as: 'logs',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }],
                    order: [['created_at', 'DESC']],
                    limit: 10
                }
            ]
        });

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        res.json({
            success: true,
            data: asset
        });
    } catch (error) {
        console.error('Get asset error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Create asset
// @route   POST /api/assets
// @access  Private
const createAsset = async (req, res) => {
    try {
        const {
            name,
            description,
            category_id,
            item_type_id,
            location_id,
            quantity_good,
            quantity_fair,
            quantity_damaged,
            quantity,
            condition,
            location,
            inventory_code,
            purchase_date,
            purchase_price,
            image_url,
            notes
        } = req.body;

        // Validate category exists (if provided)
        if (category_id) {
            const category = await Category.findByPk(category_id);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Category not found'
                });
            }
        }

        // Validate item type exists (if provided)
        if (item_type_id) {
            const itemType = await ItemType.findByPk(item_type_id);
            if (!itemType) {
                return res.status(400).json({
                    success: false,
                    message: 'Item type not found'
                });
            }
        }

        // Validate location exists (if provided)
        if (location_id) {
            const loc = await Location.findByPk(location_id);
            if (!loc) {
                return res.status(400).json({
                    success: false,
                    message: 'Location not found'
                });
            }
        }

        const asset = await Asset.create({
            name,
            description,
            category_id,
            item_type_id,
            location_id,
            quantity_good: quantity_good || 0,
            quantity_fair: quantity_fair || 0,
            quantity_damaged: quantity_damaged || 0,
            quantity: quantity || 1,
            condition: condition || 'bagus',
            location,
            inventory_code,
            purchase_date,
            purchase_price,
            image_url,
            notes,
            created_by: req.user.id
        });

        // Create transaction log
        await TransactionLog.create({
            asset_id: asset.id,
            user_id: req.user.id,
            action: 'create',
            changes: { created: asset.toJSON() }
        });

        // Reload with associations
        await asset.reload({
            include: [
                { model: Category, as: 'category' },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
                { model: Location, as: 'locationDetail' },
                { model: ItemType, as: 'itemType' }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Asset created successfully',
            data: asset
        });
    } catch (error) {
        console.error('Create asset error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private
const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findByPk(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        const oldData = asset.toJSON();

        const {
            name,
            description,
            category_id,
            item_type_id,
            location_id,
            quantity_good,
            quantity_fair,
            quantity_damaged,
            quantity,
            condition,
            location,
            inventory_code,
            purchase_date,
            purchase_price,
            image_url,
            notes
        } = req.body;

        // If category_id is provided, validate it exists
        if (category_id) {
            const category = await Category.findByPk(category_id);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Category not found'
                });
            }
        }

        // Validate item type if provided
        if (item_type_id) {
            const itemType = await ItemType.findByPk(item_type_id);
            if (!itemType) {
                return res.status(400).json({
                    success: false,
                    message: 'Item type not found'
                });
            }
        }

        // Validate location if provided
        if (location_id) {
            const loc = await Location.findByPk(location_id);
            if (!loc) {
                return res.status(400).json({
                    success: false,
                    message: 'Location not found'
                });
            }
        }

        await asset.update({
            name,
            description,
            category_id,
            item_type_id,
            location_id,
            quantity_good,
            quantity_fair,
            quantity_damaged,
            quantity,
            condition,
            location,
            inventory_code,
            purchase_date,
            purchase_price,
            image_url,
            notes
        });

        // Create transaction log
        await TransactionLog.create({
            asset_id: asset.id,
            user_id: req.user.id,
            action: 'update',
            changes: {
                before: oldData,
                after: asset.toJSON()
            }
        });

        // Reload with associations
        await asset.reload({
            include: [
                { model: Category, as: 'category' },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
                { model: Location, as: 'locationDetail' },
                { model: ItemType, as: 'itemType' }
            ]
        });

        res.json({
            success: true,
            message: 'Asset updated successfully',
            data: asset
        });
    } catch (error) {
        console.error('Update asset error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private
const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findByPk(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        const assetData = asset.toJSON();

        // Create transaction log before deletion
        await TransactionLog.create({
            asset_id: asset.id,
            user_id: req.user.id,
            action: 'delete',
            changes: { deleted: assetData }
        });

        await asset.destroy();

        res.json({
            success: true,
            message: 'Asset deleted successfully'
        });
    } catch (error) {
        console.error('Delete asset error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get asset transaction logs
// @route   GET /api/assets/:id/logs
// @access  Private
const getAssetLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: logs } = await TransactionLog.findAndCountAll({
            where: { asset_id: req.params.id },
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });

        res.json({
            success: true,
            data: logs,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get asset logs error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

module.exports = {
    getAssets,
    getAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    getAssetLogs
};
