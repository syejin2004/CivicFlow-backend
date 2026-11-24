const express = require('express');
const router = express.Router();
const { analyzeComplaintImage } = require('../controllers/aiController');

// 사진 기반 AI 민원 초안 생성 (로그인 전에도 분석 가능, 접수 시 로그인 필요)
router.post('/analyze-image', analyzeComplaintImage);

module.exports = router;
