import { useAuth } from '../../contexts/AuthContext';

// 민원 담당자 메뉴
const STAFF_NAV = [
  { id:'dash',    label:'대시보드' },
  { id:'list',    label:'내 민원 조회' },
  { id:'detail',  label:'민원 처리' },
  { id:'class',   label:'AI 분류 결과' },
  { id:'stats',   label:'내 업무 통계' },
  { id:'notice',  label:'공지사항' },
  { id:'chat',    label:'팀 채팅' },
  { id:'setting', label:'설정' },
]

// 부서 관리자 메뉴
const MANAGER_NAV = [
  { id:'dash',       label:'대시보드' },
  { id:'all-list',   label:'전체 민원 관리' },
  { id:'assign',     label:'민원 배정 관리' },
  { id:'team',       label:'담당자 관리' },
  { id:'stats',      label:'부서 통계·분석' },
  { id:'notice',     label:'공지사항' },
  { id:'chat',       label:'팀 채팅' },
  { id:'setting',    label:'설정' },
]

export default function StaffSidebar({ page, setPage }) {
  const { user } = useAuth();
  const NAV = user?.role === 'manager' ? MANAGER_NAV : STAFF_NAV;
  return (
    <div className="staff-sidebar">
      <div className="staff-sidebar-logo">
        <div className="s-logo"><i></i>CivicFlow</div>
        <div className="s-sub">공공 민원 통합 관리 시스템</div>
      </div>
      <nav className="staff-nav">
        {NAV.map(n => (
          <div
            key={n.id}
            className={`sn-item${page===n.id?' active':''}`}
            onClick={() => setPage(n.id)}
            style={n.badge ? {display:'flex',justifyContent:'space-between',alignItems:'center'} : {}}
          >
            <span>{n.label}</span>
          </div>
        ))}
      </nav>
      <div className="staff-user">
        <div className="su-av">김</div>
        <div>
          <div className="su-name">김민지</div>
          <div className="su-role">도로관리과 (인천시청)</div>
        </div>
      </div>
    </div>
  )
}
