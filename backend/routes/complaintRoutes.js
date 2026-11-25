const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { upload, cloudinary, analyzeImage, classifyByTags } = require('../middlewares/upload');
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

// 임시 이미지 업로드 (AI 분석용)
router.post('/temp-upload', auth, upload.single('images'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '파일 없음' });
    res.json({ url: req.file.path });
  } catch (e) {
    res.status(500).json({ message: '업로드 실패' });
  }
});

// 이미지 AI 분석
router.post('/analyze-image', auth, async (req, res) => {
  const { imageUrl } = req.body;
  try {
    const tags = await analyzeImage(imageUrl);
    const result = classifyByTags(tags);
    res.json({ tags, ...result });
  } catch (e) {
    res.status(500).json({ message: '분석 실패', error: e.message });
  }
});

// 상세 조회 (전체)
router.get('/:id', auth, getComplaintById);

module.exports = router;