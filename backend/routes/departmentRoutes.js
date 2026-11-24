const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { getDepartments } = require('../controllers/departmentController');

// 부서 목록 (담당자/관리자만)
router.get('/', auth, checkRole(['OFFICER', 'ADMIN']), getDepartments);

module.exports = router;
