import { useAuth } from '../../contexts/AuthContext';
import { useComplaints } from '../../contexts/ComplaintContext';

export default function Stats() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const isManager = user?.role === 'manager';

  const myComplaints = complaints;

  const stats = {
    total: myComplaints.length,
    completed: myComplaints.filter(c => c.status === 'COMPLETED').length,
    inProgress: myComplaints.filter(c => c.status === 'PROCESSING').length,
    waiting: myComplaints.filter(c => c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length,
  };

  const categoryStats = {};
  myComplaints.forEach(c => {
    const cat = c.ai_category || '미분류';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, completed: 0 };
    }
    categoryStats[cat].count++;
    if (c.status === 'COMPLETED') {
      categoryStats[cat].completed++;
    }
  });

  const categoryArray = Object.entries(categoryStats).map(([name, data]) => ({
    name,
    count: data.count,
    percentage: stats.total > 0 ? Math.round((data.count / stats.total) * 100) : 0
  }));

  const colors = ['#4a9eff', '#22c55e', '#f59e0b', '#8b5cf6', '#e23b45', '#6b7280'];
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const monthlyData = [
    { month: '5월' }, { month: '6월' }, { month: '7월' },
    { month: '8월' }, { month: '9월' }, { month: '10월' },
  ];

  return (
    <div className="s-page active">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.5px', marginBottom: 4 }}>
            {isManager ? '부서 통계·분석' : '내 업무 통계'}
          </div>
          <div style={{ fontSize: 13, color: '#778090', marginBottom: 20 }}>
            {isManager
              ? '부서 전체 민원 처리 현황과 담당자별 실적을 확인할 수 있습니다.'
              : '내가 처리한 민원 현황과 업무 실적을 확인할 수 있습니다.'}
          </div>
        </div>
        <div className="s-stats-date">
          <input type="date" defaultValue="2026-11-01" />
          <span style={{ color: '#d1d5db' }}>~</span>
          <input type="date" defaultValue="2026-11-23" />
        </div>
      </div>

      <div className="s-stat-row" style={{ marginBottom: 20 }}>
        <div className="s-stat c1">
          <div className="st-label">{isManager ? '부서 전체 민원' : '내 담당 민원'}</div>
          <div><span className="st-val">{stats.total}</span><span className="st-unit">건</span></div>
          <div className="st-chg up">{isManager ? '이번 달 접수' : '배정 완료'}</div>
        </div>
        <div className="s-stat c2">
          <div className="st-label">처리 완료</div>
          <div><span className="st-val">{stats.completed}</span><span className="st-unit">건</span></div>
          <div className="st-chg up">처리율 {completionRate}%</div>
        </div>
        <div className="s-stat c3">
          <div className="st-label">처리 중</div>
          <div><span className="st-val">{stats.inProgress}</span><span className="st-unit">건</span></div>
          <div className="st-chg up">진행 중</div>
        </div>
        <div className="s-stat c4">
          <div className="st-label">대기 중</div>
          <div><span className="st-val">{stats.waiting}</span><span className="st-unit">건</span></div>
          <div className="st-chg dn">처리 필요</div>
        </div>
      </div>

      <div className="s-stats-two">
        <div className="s-card">
          <div className="s-card-title">
            {isManager ? '부서 분야별 민원 현황' : '내 담당 분야별 현황'}
          </div>
          {stats.total === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#b0b8c4', fontSize: '13px' }}>
              접수된 민원이 없습니다.
            </div>
          ) : (
            <div className="s-donut-wrap">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                {categoryArray.map((cat, idx) => (
                  <div key={cat.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{cat.name}</span>
                      <span style={{ fontSize: '12px', color: '#778090' }}>{cat.count}건 ({cat.percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e6ec', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${cat.percentage}%`, height: '100%', background: colors[idx % colors.length], borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="s-card">
          <div className="s-card-title">
            월별 민원 추이
            <span style={{ fontSize: 12, fontWeight: 400, color: '#9ca3af' }}>&nbsp;── 접수 &nbsp;── 처리</span>
          </div>
          <svg width="100%" height="130" viewBox="0 0 320 120" preserveAspectRatio="none">
            <line x1="0" y1="100" x2="320" y2="100" stroke="#e2e6ec" strokeWidth="1"/>
            <line x1="0" y1="70" x2="320" y2="70" stroke="#e2e6ec" strokeWidth="1" strokeDasharray="4"/>
            <line x1="0" y1="40" x2="320" y2="40" stroke="#e2e6ec" strokeWidth="1" strokeDasharray="4"/>
            <line x1="0" y1="10" x2="320" y2="10" stroke="#e2e6ec" strokeWidth="1" strokeDasharray="4"/>
            <polyline points="10,80 63,70 116,60 170,50 223,40 276,25 320,15" fill="none" stroke="#4a9eff" strokeWidth="2.5" strokeLinejoin="round"/>
            <polyline points="10,90 63,82 116,72 170,62 223,55 276,38 320,28" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5 2"/>
            {monthlyData.map((m, i) => (
              <text key={m.month} x={10 + i * 51} y="114" fontSize="9" fill="#9ca3af">{m.month}</text>
            ))}
          </svg>
        </div>
      </div>

      <div style={{ background: '#f7f8fa', borderRadius: '10px', padding: '16px 20px', marginTop: '20px', fontSize: '13px', color: '#778090' }}>
        💡 <strong>{isManager ? '부서 통계 분석:' : '내 업무 통계:'}</strong>
        {isManager
          ? ' 전체 담당자의 민원 처리 현황을 종합한 데이터입니다.'
          : ' 나에게 배정된 민원의 처리 현황입니다. 처리율을 높이기 위해 대기 중인 민원을 우선 처리해보세요.'}
      </div>
    </div>
  );
}