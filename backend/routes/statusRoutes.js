const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { updateStatus, getHistory } = require('../controllers/statusController');

// 상태 변경 (담당자/관리자만)
router.patch('/:id/status', auth, checkRole(['OFFICER', 'ADMIN']), updateStatus);

// 처리 이력 조회 (전체)
router.get('/:id/history', auth, getHistory);

module.exports = router;