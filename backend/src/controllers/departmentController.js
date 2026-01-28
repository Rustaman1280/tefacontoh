const { Department, Location, Asset } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res) => {
    try {
        const { search } = req.query;

        const where = {};
        if (search) {
            where[Op.or] = [
                { code: { [Op.iLike]: `%${search}%` } },
                { name: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const departments = await Department.findAll({
            where,
            order: [['code', 'ASC']],
            include: [{
                model: Location,
                as: 'locations',
                attributes: ['id', 'name', 'location_type']
            }]
        });

        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get single department with all locations and assets
// @route   GET /api/departments/:id
// @access  Private
const getDepartment = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id, {
            include: [{
                model: Location,
                as: 'locations',
                include: [{
                    model: Asset,
                    as: 'assets'
                }]
            }]
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error('Get department error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private
const createDepartment = async (req, res) => {
    try {
        const { code, name, total_classes_per_grade, total_labs, description } = req.body;

        const department = await Department.create({
            code,
            name,
            total_classes_per_grade: total_classes_per_grade || 1,
            total_labs: total_labs || 0,
            description
        });

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department
        });
    } catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private
const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const { code, name, total_classes_per_grade, total_labs, description } = req.body;

        await department.update({
            code,
            name,
            total_classes_per_grade,
            total_labs,
            description
        });

        res.json({
            success: true,
            message: 'Department updated successfully',
            data: department
        });
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private
const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check if department has locations
        const locationCount = await Location.count({ where: { department_id: department.id } });
        if (locationCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete department. ${locationCount} location(s) are linked to this department.`
            });
        }

        await department.destroy();

        res.json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get department summary (labs and classes count with assets)
// @route   GET /api/departments/:id/summary
// @access  Private
const getDepartmentSummary = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Get labs
        const labs = await Location.findAll({
            where: {
                department_id: department.id,
                location_type: 'lab'
            },
            include: [{
                model: Asset,
                as: 'assets'
            }]
        });

        // Get classes
        const classes = await Location.findAll({
            where: {
                department_id: department.id,
                location_type: 'kelas'
            },
            include: [{
                model: Asset,
                as: 'assets'
            }]
        });

        // Calculate asset summary
        const calculateAssetSummary = (locations) => {
            let totalGood = 0, totalFair = 0, totalDamaged = 0;
            locations.forEach(loc => {
                loc.assets.forEach(asset => {
                    totalGood += asset.quantity_good || 0;
                    totalFair += asset.quantity_fair || 0;
                    totalDamaged += asset.quantity_damaged || 0;
                });
            });
            return { totalGood, totalFair, totalDamaged, total: totalGood + totalFair + totalDamaged };
        };

        res.json({
            success: true,
            data: {
                department,
                labs: {
                    count: labs.length,
                    locations: labs,
                    assetSummary: calculateAssetSummary(labs)
                },
                classes: {
                    count: classes.length,
                    locations: classes,
                    assetSummary: calculateAssetSummary(classes)
                }
            }
        });
    } catch (error) {
        console.error('Get department summary error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

module.exports = {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentSummary
};
