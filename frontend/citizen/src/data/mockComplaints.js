// Mock 민원 데이터
export const MOCK_COMPLAINTS = [
  {
    id: 'C-2026-1278',
    title: '도로 포트홀 보수 요청',
    content: '출퇴근 길에 이용하는 도로에 포트홀이 발생하여 차량 통행에 위험이 있습니다. 빠른 조치 부탁드립니다.',
    category: '도로·교통',
    aiCategory: '도로 파손',
    aiConfidence: 0.94,
    status: 'assigned', // new, assigned, inProgress, completed
    statusLabel: '배정완료',
    assignee: '김민지',
    assigneeId: 'staff1',
    applicant: '홍길동',
    phone: '010-1234-5678',
    address: '인천시 남동구 구월동 1234',
    receivedDate: '2026-11-21',
    deadline: '2026-11-28',
    completedDate: null,
    attachments: ['도로파손1.jpg', '도로파손2.jpg'],
    answer: null,
    history: [
      { date: '2026-11-21 09:30', action: '민원 접수', user: '시스템' },
      { date: '2026-11-21 10:15', action: 'AI 자동 분류 완료', user: '시스템' },
      { date: '2026-11-21 10:30', action: '김민지 담당자 배정', user: '이부장' },
    ]
  },
  {
    id: 'C-2026-1277',
    title: '공원 가로등 고장 신고',
    content: '집 앞 공원의 가로등이 고장나서 밤에 너무 어둡습니다. 수리 부탁드립니다.',
    category: '시설·안전',
    aiCategory: '가로등 고장',
    aiConfidence: 0.89,
    status: 'inProgress',
    statusLabel: '처리중',
    assignee: '김민지',
    assigneeId: 'staff1',
    applicant: '이영희',
    phone: '010-2345-6789',
    address: '인천시 연수구 송도동 567',
    receivedDate: '2026-11-20',
    deadline: '2026-11-27',
    completedDate: null,
    attachments: ['가로등.jpg'],
    answer: '현장 확인 중입니다. 오늘 중 수리 완료 예정입니다.',
    history: [
      { date: '2026-11-20 14:20', action: '민원 접수', user: '시스템' },
      { date: '2026-11-20 14:25', action: 'AI 자동 분류 완료', user: '시스템' },
      { date: '2026-11-20 15:00', action: '김민지 담당자 배정', user: '이부장' },
      { date: '2026-11-21 09:00', action: '처리 시작', user: '김민지' },
    ]
  },
  {
    id: 'C-2026-1276',
    title: '불법 주정차 단속 요청',
    content: '아파트 앞 소화전 근처에 항상 불법 주정차 차량이 있어 위험합니다.',
    category: '도로·교통',
    aiCategory: '불법 주정차',
    aiConfidence: 0.92,
    status: 'completed',
    statusLabel: '처리완료',
    assignee: '박철수',
    assigneeId: 'staff2',
    applicant: '김철수',
    phone: '010-3456-7890',
    address: '인천시 부평구 부평동 890',
    receivedDate: '2026-11-19',
    deadline: '2026-11-26',
    completedDate: '2026-11-21',
    attachments: ['주정차.jpg'],
    answer: '해당 지역 순찰을 강화하고 불법 주정차 단속을 실시하였습니다. 지속적으로 관리하겠습니다.',
    history: [
      { date: '2026-11-19 11:00', action: '민원 접수', user: '시스템' },
      { date: '2026-11-19 11:05', action: 'AI 자동 분류 완료', user: '시스템' },
      { date: '2026-11-19 14:00', action: '박철수 담당자 배정', user: '이부장' },
      { date: '2026-11-20 10:00', action: '처리 시작', user: '박철수' },
      { date: '2026-11-21 16:00', action: '처리 완료', user: '박철수' },
    ]
  },
  {
    id: 'C-2026-1275',
    title: '인도 보도블록 파손 수리',
    content: '학교 앞 인도의 보도블록이 파손되어 학생들이 다칠 위험이 있습니다.',
    category: '도로·교통',
    aiCategory: '보도 파손',
    aiConfidence: 0.88,
    status: 'new',
    statusLabel: '접수',
    assignee: null,
    assigneeId: null,
    applicant: '박순이',
    phone: '010-4567-8901',
    address: '인천시 계양구 계산동 123',
    receivedDate: '2026-11-21',
    deadline: '2026-11-28',
    completedDate: null,
    attachments: ['보도블록.jpg'],
    answer: null,
    history: [
      { date: '2026-11-21 13:45', action: '민원 접수', user: '시스템' },
      { date: '2026-11-21 13:50', action: 'AI 자동 분류 완료', user: '시스템' },
    ]
  },
  {
    id: 'C-2026-1274',
    title: '공원 벤치 교체 필요',
    content: '공원 벤치가 너무 낡아서 앉기 불편합니다. 교체 부탁드립니다.',
    category: '시설·안전',
    aiCategory: '공원 시설',
    aiConfidence: 0.85,
    status: 'assigned',
    statusLabel: '배정완료',
    assignee: '이영희',
    assigneeId: 'staff3',
    applicant: '최민수',
    phone: '010-5678-9012',
    address: '인천시 서구 석남동 456',
    receivedDate: '2026-11-20',
    deadline: '2026-11-27',
    completedDate: null,
    attachments: [],
    answer: null,
    history: [
      { date: '2026-11-20 16:30', action: '민원 접수', user: '시스템' },
      { date: '2026-11-20 16:35', action: 'AI 자동 분류 완료', user: '시스템' },
      { date: '2026-11-21 09:00', action: '이영희 담당자 배정', user: '이부장' },
    ]
  },
];

// 담당자 목록
export const MOCK_STAFF = [
  { id: 'staff1', name: '김민지', department: '도로관리과', email: 'staff1@incheon.go.kr' },
  { id: 'staff2', name: '박철수', department: '도로관리과', email: 'staff2@incheon.go.kr' },
  { id: 'staff3', name: '이영희', department: '도로관리과', email: 'staff3@incheon.go.kr' },
];

// 담당자별 통계
export const getStaffStats = (staffId) => {
  const complaints = MOCK_COMPLAINTS.filter(c => c.assigneeId === staffId);
  return {
    total: complaints.length,
    inProgress: complaints.filter(c => c.status === 'inProgress').length,
    completed: complaints.filter(c => c.status === 'completed').length,
    assigned: complaints.filter(c => c.status === 'assigned').length,
  };
};

// 부서 전체 통계
export const getDepartmentStats = () => {
  return {
    total: MOCK_COMPLAINTS.length,
    new: MOCK_COMPLAINTS.filter(c => c.status === 'new').length,
    assigned: MOCK_COMPLAINTS.filter(c => c.status === 'assigned').length,
    inProgress: MOCK_COMPLAINTS.filter(c => c.status === 'inProgress').length,
    completed: MOCK_COMPLAINTS.filter(c => c.status === 'completed').length,
  };
};
