const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { upload } = require('../middlewares/upload');
const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById
} = require('../controllers/complaintController');

// 민원 접수 (시민만) - 이미지 업로드 포함
router.post('/', auth, checkRole(['CITIZEN']), upload.array('images', 5), createComplaint);

// 전체 목록 (담당자/관리자만)
router.get('/', auth, checkRole(['OFFICER', 'ADMIN']), getAllComplaints);

// 내 민원 (시민만)
router.get('/mine', auth, checkRole(['CITIZEN']), getMyComplaints);

// 상세 조회 (전체)
router.get('/:id', auth, getComplaintById);

module.exports = router;