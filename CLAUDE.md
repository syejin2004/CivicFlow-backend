# CivicFlow 프로젝트 코딩 규칙

## 프로젝트 개요
공공기관용 민원·생활불편 접수 분석 및 답변 지원 시스템

## 팀원 역할
- 서예진 (syejin2004): 백엔드 (Express API, Gemini AI 연동)
- 박소연 (minseo0825): DB 설계, AI 검증
- 권민서: 프론트엔드 (React)

## 기술 스택
- Frontend: React, Recharts
- Backend: Node.js, Express
- DB: MySQL (XAMPP)
- AI: Google Gemini API
- 인증: JWT

## 코딩 규칙

### 변수명
- 카멜케이스 사용: complaintId, userId
- 상수는 대문자: JWT_SECRET, DB_HOST

### 파일명
- 카멜케이스 사용: authController.js
- 라우터: authRoutes.js
- 컨트롤러: authController.js

### 주석
- 함수 위에 한줄 설명 필수
- 한국어로 작성

### API 응답 형식
```json
{
  "message": "성공 또는 실패 메시지",
  "data": {}
}
```

### 커밋 메시지 규칙
- feat: 새 기능 추가
- fix: 버그 수정
- docs: 문서 수정
- refactor: 코드 리팩토링

예시)
feat: F-01 민원 접수 API 구현
fix: 로그인 토큰 오류 수정

## DB 규칙
- 테이블명: 소문자 스네이크케이스 (process_history)
- 컬럼명: 소문자 스네이크케이스 (created_at)
- PK: id (BIGINT)
- 날짜: created_at (TIMESTAMP)

## Git 규칙
- main: 최종 완성본만
- 기능별로 커밋
- .env 파일은 절대 올리지 않기