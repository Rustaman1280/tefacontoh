const { Asset, Category, User, TransactionLog, Department, Location, ItemType } = require('../models');
const { sequelize } = require('../config/database');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
    try {
        // Total assets
        const totalAssets = await Asset.count();

        // Total categories
        const totalCategories = await Category.count();

        // Total users
        const totalUsers = await User.count();

        // Total departments
        const totalDepartments = await Department.count();

        // Total locations
        const totalLocations = await Location.count();

        // Locations by type
        const locationsByType = await Location.findAll({
            attributes: [
                'main_group',
                'location_type',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['main_group', 'location_type'],
            raw: true
        });

        // Assets by condition (new structure with quantity breakdown)
        const conditionStats = {
            bagus: { count: 0, quantity: 0 },
            kurang_layak: { count: 0, quantity: 0 },
            rusak: { count: 0, quantity: 0 },
            hilang: { count: 0, quantity: 0 }
        };

        // Get sum of quantities by condition type
        const totalGood = await Asset.sum('quantity_good') || 0;
        const totalFair = await Asset.sum('quantity_fair') || 0;
        const totalDamaged = await Asset.sum('quantity_damaged') || 0;

        conditionStats.bagus.quantity = totalGood;
        conditionStats.kurang_layak.quantity = totalFair;
        conditionStats.rusak.quantity = totalDamaged;

        // Assets by category
        const assetsByCategory = await Asset.findAll({
            attributes: [
                'category_id',
                [sequelize.fn('COUNT', sequelize.col('Asset.id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
            ],
            include: [{
                model: Category,
                as: 'category',
                attributes: ['name']
            }],
            group: ['category_id', 'category.id', 'category.name'],
            raw: true,
            nest: true
        });

        // Assets by main group (sekolah, jurusan, kelas)
        const assetsByMainGroup = await Asset.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('Asset.id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('Asset.quantity')), 'totalQuantity'],
                [sequelize.fn('SUM', sequelize.col('Asset.quantity_good')), 'totalGood'],
                [sequelize.fn('SUM', sequelize.col('Asset.quantity_fair')), 'totalFair'],
                [sequelize.fn('SUM', sequelize.col('Asset.quantity_damaged')), 'totalDamaged']
            ],
            include: [{
                model: Location,
                as: 'locationDetail',
                attributes: ['main_group'],
                required: true
            }],
            group: ['locationDetail.main_group', 'locationDetail.id'],
            raw: true,
            nest: true
        });

        // Group the results by main_group
        const mainGroupStats = {
            sekolah: { count: 0, totalQuantity: 0, totalGood: 0, totalFair: 0, totalDamaged: 0 },
            jurusan: { count: 0, totalQuantity: 0, totalGood: 0, totalFair: 0, totalDamaged: 0 },
            kelas: { count: 0, totalQuantity: 0, totalGood: 0, totalFair: 0, totalDamaged: 0 }
        };

        assetsByMainGroup.forEach(item => {
            const group = item.locationDetail?.main_group;
            if (group && mainGroupStats[group]) {
                mainGroupStats[group].count += parseInt(item.count) || 0;
                mainGroupStats[group].totalQuantity += parseInt(item.totalQuantity) || 0;
                mainGroupStats[group].totalGood += parseInt(item.totalGood) || 0;
                mainGroupStats[group].totalFair += parseInt(item.totalFair) || 0;
                mainGroupStats[group].totalDamaged += parseInt(item.totalDamaged) || 0;
            }
        });

        // Assets by department - using raw query for proper grouping
        const assetsByDepartmentRaw = await sequelize.query(`
            SELECT 
                d.id as department_id,
                d.code as department_code,
                d.name as department_name,
                COUNT(a.id) as count,
                COALESCE(SUM(a.quantity), 0) as total_quantity,
                COALESCE(SUM(a.quantity_good), 0) as total_good,
                COALESCE(SUM(a.quantity_fair), 0) as total_fair,
                COALESCE(SUM(a.quantity_damaged), 0) as total_damaged
            FROM assets a
            INNER JOIN locations l ON a.location_id = l.id
            INNER JOIN departments d ON l.department_id = d.id
            GROUP BY d.id, d.code, d.name
            ORDER BY d.code
        `, { type: sequelize.QueryTypes.SELECT });

        const assetsByDepartment = assetsByDepartmentRaw.map(item => ({
            departmentId: item.department_id,
            departmentCode: item.department_code,
            departmentName: item.department_name,
            count: parseInt(item.count) || 0,
            totalQuantity: parseInt(item.total_quantity) || 0,
            totalGood: parseInt(item.total_good) || 0,
            totalFair: parseInt(item.total_fair) || 0,
            totalDamaged: parseInt(item.total_damaged) || 0
        }));

        // Recent transactions
        const recentTransactions = await TransactionLog.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Asset,
                    as: 'asset',
                    attributes: ['id', 'name']
                }
            ]
        });

        // Total asset value
        const totalValue = await Asset.sum('purchase_price') || 0;

        // Total quantity
        const totalQuantity = await Asset.sum('quantity') || 0;

        res.json({
            success: true,
            data: {
                totalAssets,
                totalCategories,
                totalUsers,
                totalDepartments,
                totalLocations,
                totalQuantity,
                totalValue: parseFloat(totalValue),
                conditionStats,
                quantitySummary: {
                    totalGood,
                    totalFair,
                    totalDamaged,
                    total: totalGood + totalFair + totalDamaged
                },
                locationsByType,
                mainGroupStats,
                assetsByCategory: assetsByCategory.map(item => ({
                    categoryId: item.category_id,
                    categoryName: item.category?.name || 'Unknown',
                    count: parseInt(item.count),
                    totalQuantity: parseInt(item.totalQuantity) || 0
                })),
                assetsByDepartment,
                recentTransactions
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get inventory summary by department
// @route   GET /api/dashboard/department-summary
// @access  Private
const getDepartmentSummary = async (req, res) => {
    try {
        const departments = await Department.findAll({
            order: [['code', 'ASC']],
            include: [{
                model: Location,
                as: 'locations',
                include: [{
                    model: Asset,
                    as: 'assets',
                    attributes: ['id', 'name', 'quantity', 'quantity_good', 'quantity_fair', 'quantity_damaged']
                }]
            }]
        });

        const summary = departments.map(dept => {
            const labs = dept.locations.filter(l => l.location_type === 'lab');
            const classes = dept.locations.filter(l => l.location_type === 'kelas');

            const calculateStats = (locations) => {
                let totalAssets = 0, totalGood = 0, totalFair = 0, totalDamaged = 0;
                locations.forEach(loc => {
                    loc.assets.forEach(asset => {
                        totalAssets++;
                        totalGood += asset.quantity_good || 0;
                        totalFair += asset.quantity_fair || 0;
                        totalDamaged += asset.quantity_damaged || 0;
                    });
                });
                return { totalAssets, totalGood, totalFair, totalDamaged };
            };

            return {
                department: {
                    id: dept.id,
                    code: dept.code,
                    name: dept.name,
                    total_classes_per_grade: dept.total_classes_per_grade,
                    total_labs: dept.total_labs
                },
                labs: {
                    count: labs.length,
                    stats: calculateStats(labs)
                },
                classes: {
                    count: classes.length,
                    stats: calculateStats(classes)
                }
            };
        });

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Get department summary error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get inventory summary by location type
// @route   GET /api/dashboard/location-summary
// @access  Private
const getLocationSummary = async (req, res) => {
    try {
        const { main_group } = req.query;

        const where = {};
        if (main_group) {
            where.main_group = main_group;
        }

        const locations = await Location.findAll({
            where,
            order: [['main_group', 'ASC'], ['name', 'ASC']],
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'code', 'name']
                },
                {
                    model: Asset,
                    as: 'assets',
                    attributes: ['id', 'name', 'quantity', 'quantity_good', 'quantity_fair', 'quantity_damaged'],
                    include: [{
                        model: ItemType,
                        as: 'itemType',
                        attributes: ['id', 'name', 'item_category']
                    }]
                }
            ]
        });

        const summary = locations.map(loc => ({
            location: {
                id: loc.id,
                name: loc.name,
                code: loc.code,
                main_group: loc.main_group,
                location_type: loc.location_type,
                grade_level: loc.grade_level,
                department: loc.department
            },
            assetCount: loc.assets.length,
            totalGood: loc.assets.reduce((sum, a) => sum + (a.quantity_good || 0), 0),
            totalFair: loc.assets.reduce((sum, a) => sum + (a.quantity_fair || 0), 0),
            totalDamaged: loc.assets.reduce((sum, a) => sum + (a.quantity_damaged || 0), 0),
            assets: loc.assets
        }));

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Get location summary error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

module.exports = { 
    getStats,
    getDepartmentSummary,
    getLocationSummary
};
