import { useAuth } from '../../contexts/AuthContext';
import { useComplaints } from '../../contexts/ComplaintContext';

export default function Dash({ setPage }) {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const isManager = user?.role === 'manager';

  const myComplaints = complaints;

  const stats = {
    total: myComplaints.length,
    new: myComplaints.filter(c => c.status === 'SUBMITTED').length,
    assigned: myComplaints.filter(c => c.status === 'ASSIGNED').length,
    inProgress: myComplaints.filter(c => c.status === 'PROCESSING').length,
    completed: myComplaints.filter(c => c.status === 'COMPLETED').length,
  };

  const monthlyData = [
    { month: '5월', received: 42, completed: 38 },
    { month: '6월', received: 55, completed: 50 },
    { month: '7월', received: 48, completed: 45 },
    { month: '8월', received: 62, completed: 58 },
    { month: '9월', received: 58, completed: 54 },
    { month: '10월', received: 65, completed: 60 },
  ];

  const recentComplaints = myComplaints.slice(0, 5);

  const getStatusInfo = (status) => {
    const map = {
      SUBMITTED: { label: '접수완료', cls: 'wait' },
      ASSIGNED: { label: '배정완료', cls: 'wait' },
      PROCESSING: { label: '처리중', cls: 'proc' },
      COMPLETED: { label: '처리완료', cls: 'done' },
      REJECTED: { label: '반려', cls: 'done' },
    };
    return map[status] || { label: status, cls: '' };
  };

  return (
    <div>
      <div className="s-dash-title">
        {isManager ? '부서 관리자 대시보드' : '민원 담당자 대시보드'}
      </div>
      <div className="s-dash-sub">
        <span>민원 처리 현황과 주요 업무를 확인할 수 있습니다.</span>
        <div className="dt-right">
          {user?.name} {isManager ? '부서 관리자' : '민원 담당자'}님<br />
          오늘도 수고 많으십니다.
        </div>
      </div>

      <div className="s-stat-row">
        <div className="s-stat c1">
          <div className="st-label">전체 민원</div>
          <div><span className="st-val">{stats.total}</span><span className="st-unit">건</span></div>
        </div>
        <div className="s-stat c2">
          <div className="st-label">처리 완료</div>
          <div><span className="st-val">{stats.completed}</span><span className="st-unit">건</span></div>
        </div>
        <div className="s-stat c3">
          <div className="st-label">처리 중</div>
          <div><span className="st-val">{stats.inProgress}</span><span className="st-unit">건</span></div>
        </div>
        <div className="s-stat c4">
          <div className="st-label">접수 대기</div>
          <div><span className="st-val">{stats.new}</span><span className="st-unit">건</span></div>
        </div>
      </div>

      <div className="s-two-col">
        <div className="s-card">
          <div className="s-card-title">월별 민원 추이</div>
          <div className="s-bar-chart">
            {monthlyData.map((m) => {
              const maxVal = Math.max(...monthlyData.map(d => Math.max(d.received, d.completed)));
              const receivedHeight = Math.round((m.received / maxVal) * 100);
              const completedHeight = Math.round((m.completed / maxVal) * 100);
              return (
                <div key={m.month} className="s-bar-col">
                  <div className="s-bar" style={{ height: `${receivedHeight}%` }}></div>
                  <div className="s-bar hi" style={{ height: `${completedHeight}%` }}></div>
                  <div className="s-bar-label">{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {isManager && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="s-card" style={{ padding: '16px 18px' }}>
              <div className="s-card-title" style={{ marginBottom: '10px' }}>주요 알림 <a>더보기 ›</a></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#e23b45', fontWeight: 600 }}>! 처리 지연 민원 {stats.new}건 발생</span>
                  <span style={{ color: '#9ca3af' }}>10분 전</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#374151' }}>신규 민원 {stats.new}건 배정 필요</span>
                  <span style={{ color: '#9ca3af' }}>30분 전</span>
                </div>
              </div>
            </div>
            <div className="s-card" style={{ padding: '16px 18px' }}>
              <div className="s-card-title" style={{ marginBottom: '10px' }}>빠른 업무</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  onClick={() => setPage('assign')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', border: '1px solid #e2e6ec', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  <span>민원 배정하기</span><span style={{ color: '#9ca3af' }}>›</span>
                </div>
                <div
                  onClick={() => setPage('team')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', border: '1px solid #e2e6ec', borderRadius: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  <span>담당자 업무 현황 보기</span><span style={{ color: '#9ca3af' }}>›</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div className="s-card">
          <div className="s-card-title">최근 민원 현황 <a onClick={() => setPage('all-list')} style={{ cursor: 'pointer' }}>전체보기 ›</a></div>
          <table className="s-mini-tbl">
            <thead>
              <tr>
                <th>번호</th>
                <th>민원 내용</th>
                <th>유형</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                    민원이 없습니다.
                  </td>
                </tr>
              ) : (
                recentComplaints.map((c) => {
                  const { label, cls } = getStatusInfo(c.status);
                  return (
                    <tr key={c.id} onClick={() => setPage('list')} style={{ cursor: 'pointer' }}>
                      <td className="tnum">{c.id}</td>
                      <td>{c.title?.length > 20 ? c.title.substring(0, 20) + '...' : c.title}</td>
                      <td><span style={{ fontSize: '11px', color: '#1555a4', fontWeight: 700 }}>{c.ai_category || '미분류'}</span></td>
                      <td><span className={`sbadge ${cls}`}>{label}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}