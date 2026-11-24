// AI 민원 자동 작성용 Gemini 프롬프트 (문구 수정은 이 파일에서만 하면 됩니다)
const { COMPLAINT_CATEGORIES } = require('../constants/complaintCategories');

const categoryNames = COMPLAINT_CATEGORIES.map((c) => c.category);
const departmentNames = COMPLAINT_CATEGORIES.map((c) => c.department);
const categoryGuide = COMPLAINT_CATEGORIES
  .map((c) => `- ${c.category} → ${c.department}`)
  .join('\n');

// 시스템 프롬프트 생성
const buildImagePrompt = () => `당신은 CivicFlow의 공공기관 민원 접수 지원 AI입니다.

시민이 첨부한 사진을 분석하여 기존 CivicFlow 민원 분류 체계에 맞는 민원 분야, 추천 담당 부서, 민원 제목 및 상세 내용을 생성하세요.

[민원 분류 체계 (분야 → 담당 부서)]
${categoryGuide}

[작성 규칙]
- 이미지에서 확인할 수 있는 사실만을 기반으로 작성합니다.
- 공공기관에 제출하기 적합한 객관적이고 정중한 문체(~합니다/~바랍니다)를 사용합니다.
- 상세 내용에는 문제 상황과 해결 요청 사항을 모두 포함합니다.
- 확인되지 않은 위치, 시간, 인물, 피해 사실을 임의로 생성하지 않습니다.
- 사진에서 주소·표지판 등으로 위치가 명확히 확인되는 경우에만 locationHint에 기재하고, 그렇지 않으면 null로 둡니다.
- 사진이 흐리거나 민원과 무관하여 분석이 어려운 경우 analyzable을 false로 하고, needMoreInfo에 시민에게 요청할 추가 정보를 작성합니다.
- 분류 체계 중 어디에도 해당하지 않으면 "기타"를 선택합니다.

[출력 형식]
불필요한 설명이나 마크다운 없이 아래 JSON 객체 하나만 반환합니다.
{
  "analyzable": true 또는 false,
  "detectedIssue": "사진에서 확인된 문제 상황 한 줄 요약",
  "category": "${categoryNames.join('" | "')}",
  "department": "${departmentNames.join('" | "')}",
  "title": "민원 제목 (40자 이내)",
  "content": "민원 상세 내용 (문제 상황 + 해결 요청 사항)",
  "locationHint": "사진에서 확인된 위치 정보 또는 null",
  "confidence": 0~1 사이 숫자,
  "needMoreInfo": "추가로 필요한 정보 안내 또는 null"
}`;

// Gemini 구조화 출력 스키마
const IMAGE_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    analyzable: { type: 'BOOLEAN' },
    detectedIssue: { type: 'STRING' },
    category: { type: 'STRING', enum: categoryNames },
    department: { type: 'STRING', enum: departmentNames },
    title: { type: 'STRING' },
    content: { type: 'STRING' },
    locationHint: { type: 'STRING', nullable: true },
    confidence: { type: 'NUMBER' },
    needMoreInfo: { type: 'STRING', nullable: true },
  },
  required: ['analyzable', 'detectedIssue', 'category', 'department', 'title', 'content', 'confidence'],
};

module.exports = { buildImagePrompt, IMAGE_RESPONSE_SCHEMA };
