const { buildImagePrompt, IMAGE_RESPONSE_SCHEMA } = require('../prompts/complaintImagePrompt');
const { findCategory } = require('../constants/complaintCategories');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

// data URL 또는 순수 base64 문자열을 { mimeType, base64 } 로 분리
const parseImage = (image, mimeType) => {
  const match = /^data:([^;]+);base64,(.+)$/.exec(image);
  if (match) return { mimeType: match[1], base64: match[2] };
  return { mimeType, base64: image };
};

// Gemini에 이미지와 프롬프트를 보내 민원 초안 JSON을 받아옴
const callGeminiWithImage = async (mimeType, base64) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: buildImagePrompt() },
            { inline_data: { mime_type: mimeType, data: base64 } },
          ],
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: IMAGE_RESPONSE_SCHEMA,
        },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini 요청 실패 (${response.status})`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('');
  if (!text) throw new Error('Gemini 응답이 비어 있습니다.');

  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

// 사진 기반 AI 민원 초안 생성
const analyzeComplaintImage = async (req, res) => {
  const { image, mimeType: rawMimeType } = req.body || {};

  if (!process.env.GEMINI_KEY) {
    return res.status(500).json({ message: '서버에 Gemini API 키가 설정되어 있지 않습니다.', data: null });
  }
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ message: '분석할 이미지를 첨부해 주세요.', data: null });
  }

  const { mimeType, base64 } = parseImage(image, rawMimeType);
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return res.status(400).json({ message: 'JPG, PNG, WEBP 이미지만 분석할 수 있습니다.', data: null });
  }
  if (Buffer.byteLength(base64, 'base64') > MAX_IMAGE_BYTES) {
    return res.status(400).json({ message: '이미지 크기는 10MB 이하여야 합니다.', data: null });
  }

  try {
    const result = await callGeminiWithImage(mimeType, base64);
    const matched = findCategory(result.category);

    res.json({
      message: 'AI 이미지 분석 완료',
      data: {
        analyzable: result.analyzable !== false,
        detectedIssue: result.detectedIssue || '',
        category: matched.category,
        department: matched.department,
        title: result.title || '',
        content: result.content || '',
        locationHint: result.locationHint || null,
        confidence: typeof result.confidence === 'number' ? result.confidence : null,
        needMoreInfo: result.needMoreInfo || null,
        model: GEMINI_MODEL,
      },
    });
  } catch (err) {
    console.error('AI 이미지 분석 실패:', err.message);
    res.status(502).json({ message: 'AI 이미지 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.', data: null });
  }
};

module.exports = { analyzeComplaintImage };
