const { Location, Department, Asset, ItemType } = require('../models');
const { Op, fn, col } = require('sequelize');

// @desc    Get all locations
// @route   GET /api/locations
// @access  Private
const getLocations = async (req, res) => {
    try {
        const { search, main_group, location_type, department_id, grade_level } = req.query;

        const where = {};
        
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { code: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (main_group) {
            where.main_group = main_group;
        }

        if (location_type) {
            where.location_type = location_type;
        }

        if (department_id) {
            where.department_id = department_id;
        }

        if (grade_level) {
            where.grade_level = grade_level;
        }

        const locations = await Location.findAll({
            where,
            order: [['main_group', 'ASC'], ['name', 'ASC']],
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'code', 'name']
                }
            ]
        });

        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get locations grouped by main group
// @route   GET /api/locations/grouped
// @access  Private
const getLocationsGrouped = async (req, res) => {
    try {
        const locations = await Location.findAll({
            order: [['main_group', 'ASC'], ['location_type', 'ASC'], ['name', 'ASC']],
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'code', 'name']
                }
            ]
        });

        // Group by main_group
        const grouped = {
            sekolah: locations.filter(l => l.main_group === 'sekolah'),
            jurusan: locations.filter(l => l.main_group === 'jurusan'),
            kelas: locations.filter(l => l.main_group === 'kelas')
        };

        // Further group jurusan and kelas by department
        const groupByDepartment = (locs) => {
            const result = {};
            locs.forEach(loc => {
                const deptCode = loc.department?.code || 'no-dept';
                if (!result[deptCode]) {
                    result[deptCode] = {
                        department: loc.department,
                        labs: [],
                        classes: []
                    };
                }
                if (loc.location_type === 'lab') {
                    result[deptCode].labs.push(loc);
                } else if (loc.location_type === 'kelas') {
                    result[deptCode].classes.push(loc);
                }
            });
            return result;
        };

        res.json({
            success: true,
            data: {
                sekolah: grouped.sekolah,
                jurusan: groupByDepartment(grouped.jurusan),
                kelas: groupByDepartment(grouped.kelas)
            }
        });
    } catch (error) {
        console.error('Get locations grouped error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get single location with assets
// @route   GET /api/locations/:id
// @access  Private
const getLocation = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id, {
            include: [
                {
                    model: Department,
                    as: 'department'
                },
                {
                    model: Asset,
                    as: 'assets',
                    include: [{
                        model: ItemType,
                        as: 'itemType'
                    }]
                }
            ]
        });

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Calculate asset summary
        let totalGood = 0, totalFair = 0, totalDamaged = 0;
        location.assets.forEach(asset => {
            totalGood += asset.quantity_good || 0;
            totalFair += asset.quantity_fair || 0;
            totalDamaged += asset.quantity_damaged || 0;
        });

        res.json({
            success: true,
            data: {
                ...location.toJSON(),
                assetSummary: {
                    totalGood,
                    totalFair,
                    totalDamaged,
                    total: totalGood + totalFair + totalDamaged
                }
            }
        });
    } catch (error) {
        console.error('Get location error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Create location
// @route   POST /api/locations
// @access  Private
const createLocation = async (req, res) => {
    try {
        const {
            name,
            main_group,
            location_type,
            department_id,
            grade_level,
            sequence_number,
            code,
            description,
            capacity
        } = req.body;

        // Validate department if provided
        if (department_id) {
            const department = await Department.findByPk(department_id);
            if (!department) {
                return res.status(400).json({
                    success: false,
                    message: 'Department not found'
                });
            }
        }

        // Auto-generate code if not provided
        let locationCode = code;
        if (!locationCode) {
            const prefix = location_type === 'lab' ? 'LAB' : location_type === 'kelas' ? 'KLS' : 'RNG';
            const count = await Location.count({ where: { location_type } });
            locationCode = `${prefix}-${String(count + 1).padStart(3, '0')}`;
        }

        const location = await Location.create({
            name,
            main_group,
            location_type,
            department_id,
            grade_level,
            sequence_number,
            code: locationCode,
            description,
            capacity
        });

        await location.reload({
            include: [{
                model: Department,
                as: 'department'
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Location created successfully',
            data: location
        });
    } catch (error) {
        console.error('Create location error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private
const updateLocation = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        const {
            name,
            main_group,
            location_type,
            department_id,
            grade_level,
            sequence_number,
            code,
            description,
            capacity
        } = req.body;

        await location.update({
            name,
            main_group,
            location_type,
            department_id,
            grade_level,
            sequence_number,
            code,
            description,
            capacity
        });

        await location.reload({
            include: [{
                model: Department,
                as: 'department'
            }]
        });

        res.json({
            success: true,
            message: 'Location updated successfully',
            data: location
        });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private
const deleteLocation = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Check if location has assets
        const assetCount = await Asset.count({ where: { location_id: location.id } });
        if (assetCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete location. ${assetCount} asset(s) are in this location.`
            });
        }

        await location.destroy();

        res.json({
            success: true,
            message: 'Location deleted successfully'
        });
    } catch (error) {
        console.error('Delete location error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Bulk create locations for a department
// @route   POST /api/locations/bulk
// @access  Private
const bulkCreateLocations = async (req, res) => {
    try {
        const { department_id, create_labs, create_classes } = req.body;

        const department = await Department.findByPk(department_id);
        if (!department) {
            return res.status(400).json({
                success: false,
                message: 'Department not found'
            });
        }

        const createdLocations = [];

        // Create labs
        if (create_labs) {
            for (let i = 1; i <= department.total_labs; i++) {
                const lab = await Location.create({
                    name: `Lab ${department.code} ${i}`,
                    main_group: 'jurusan',
                    location_type: 'lab',
                    department_id: department.id,
                    sequence_number: i,
                    code: `LAB-${department.code}-${i}`
                });
                createdLocations.push(lab);
            }
        }

        // Create classes for each grade level
        if (create_classes) {
            const grades = ['X', 'XI', 'XII'];
            for (const grade of grades) {
                for (let i = 1; i <= department.total_classes_per_grade; i++) {
                    const kelas = await Location.create({
                        name: `${grade} ${department.code} ${i}`,
                        main_group: 'kelas',
                        location_type: 'kelas',
                        department_id: department.id,
                        grade_level: grade,
                        sequence_number: i,
                        code: `KLS-${grade}-${department.code}-${i}`
                    });
                    createdLocations.push(kelas);
                }
            }
        }

        res.status(201).json({
            success: true,
            message: `Created ${createdLocations.length} locations for ${department.name}`,
            data: createdLocations
        });
    } catch (error) {
        console.error('Bulk create locations error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

module.exports = {
    getLocations,
    getLocationsGrouped,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    bulkCreateLocations
};
