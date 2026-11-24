import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user, logout } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
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
          >
            <span>{n.label}</span>
          </div>
        ))}
      </nav>

      {/* 유저 정보 팝업 */}
      {showPopup && (
        <div style={{
          position: 'absolute', bottom: '80px', left: '12px', right: '12px',
          background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px',
          padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{user?.name}</div>
          <div style={{ fontSize: '12px', color: '#778090', marginBottom: '4px' }}>{user?.email}</div>
          <div style={{ fontSize: '12px', color: '#778090', marginBottom: '12px' }}>
            {user?.role === 'manager' ? '부서 관리자' : '민원 담당자'}
          </div>
          <div style={{ borderTop: '1px solid #e2e6ec', paddingTop: '10px' }}>
            <div
              onClick={() => { setShowPopup(false); logout(); }}
              style={{ fontSize: '13px', color: '#e23b45', fontWeight: 600, cursor: 'pointer', padding: '4px 0' }}
            >
              로그아웃
            </div>
          </div>
        </div>
      )}

      <div
        className="staff-user"
        onClick={() => setShowPopup(v => !v)}
        style={{ cursor: 'pointer' }}
      >
        <div className="su-av">{user?.name?.charAt(0)}</div>
        <div>
          <div className="su-name">{user?.name}</div>
          <div className="su-role">{user?.role === 'manager' ? '부서 관리자' : '민원 담당자'}</div>
        </div>
      </div>
    </div>
  );
}