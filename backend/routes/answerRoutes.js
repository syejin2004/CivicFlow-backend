const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { generateDraft, confirmAnswer, getAnswer } = require('../controllers/answerController');

// AI 답변 초안 생성 (담당자/관리자)
router.post('/:id/answer/draft', auth, checkRole(['OFFICER', 'ADMIN']), generateDraft);

// 최종 답변 확정 (담당자/관리자)
router.post('/:id/answer/final', auth, checkRole(['OFFICER', 'ADMIN']), confirmAnswer);

// 답변 조회 (전체)
router.get('/:id/answer', auth, getAnswer);

module.exports = router;