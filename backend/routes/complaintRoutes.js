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

// Groq 민원 내용 자동 생성
router.post('/generate-content', auth, async (req, res) => {
  const { description } = req.body;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{
          role: 'user',
          content: `다음 민원 설명을 바탕으로 공식 민원 내용을 작성해주세요.

설명: ${description}

반드시 JSON 형식으로만 답하세요:
{"category":"도로/교통 또는 환경/청소 또는 시설물 또는 안전/재난 또는 기타","title":"민원 제목","content":"공식 민원 내용 (2-3문장)","location":"설명에서 추출한 위치 (없으면 빈 문자열)"}`
        }],
        temperature: 0.3
      })
    });
    const data = await response.json();
    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: '생성 실패', error: e.message });
  }
});

// 상세 조회 (전체)
router.get('/:id', auth, getComplaintById);

module.exports = router;