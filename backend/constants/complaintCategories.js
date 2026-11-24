// CivicFlow 민원 분류 체계 (분야 → 추천 담당 부서), AI 프롬프트와 AI 추천값 검증에 사용
// 실제 DB id는 고정하지 않고 services/referenceService.js 에서 이름으로 조회합니다.
const COMPLAINT_CATEGORIES = [
  { category: '도로파손', department: '도로관리과' },
  { category: '불법주정차', department: '교통지도과' },
  { category: '쓰레기투기', department: '환경미화과' },
  { category: '소음', department: '생활민원과' },
  { category: '가로등고장', department: '시설관리과' },
  { category: '기타', department: '민원실' },
];

// 분류명으로 분류 정보 조회 (없으면 '기타')
const findCategory = (name) =>
  COMPLAINT_CATEGORIES.find((c) => c.category === name) ||
  COMPLAINT_CATEGORIES[COMPLAINT_CATEGORIES.length - 1];

module.exports = { COMPLAINT_CATEGORIES, findCategory };
