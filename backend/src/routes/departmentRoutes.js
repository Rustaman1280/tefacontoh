const express = require('express');
const router = express.Router();
const {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentSummary
} = require('../controllers/departmentController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.route('/')
    .get(getDepartments)
    .post(createDepartment);

router.route('/:id')
    .get(getDepartment)
    .put(updateDepartment)
    .delete(deleteDepartment);

router.get('/:id/summary', getDepartmentSummary);

module.exports = router;
