// 백엔드 API 주소 (기본값: Railway 운영 서버, 로컬 테스트 시 .env.local 의 VITE_API_URL 로 변경)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://civicflow-production.up.railway.app/api';

// AI 이미지 분석 API 주소 (따로 지정하지 않으면 API_BASE_URL 사용)
export const AI_API_BASE_URL = import.meta.env.VITE_AI_API_URL || API_BASE_URL;
