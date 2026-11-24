const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const {
  getStatsByCategory,
  getStatsByStatus,
  getStatsByPeriod,
  getStatsByDepartment,
  getSummary
} = require('../controllers/statsController');

// 통계 (관리자만)
router.get('/category', auth, checkRole(['ADMIN']), getStatsByCategory);
router.get('/status', auth, checkRole(['ADMIN']), getStatsByStatus);
router.get('/period', auth, checkRole(['ADMIN']), getStatsByPeriod);
router.get('/department', auth, checkRole(['ADMIN']), getStatsByDepartment);
router.get('/summary', auth, checkRole(['ADMIN']), getSummary);

module.exports = router;