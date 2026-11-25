import { useState, useEffect } from 'react';
import { useComplaints } from '../../contexts/ComplaintContext';

const BASE_URL = 'https://civicflow-production.up.railway.app/api';
const getToken = () => localStorage.getItem('civicflow_token');

export default function Team() {
  const { complaints } = useComplaints();
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/users`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        const officers = data.filter(u => u.role === 'OFFICER');
        setStaff(officers);
      }
    } catch (e) {
      console.error('담당자 조회 실패:', e);
    }
  };

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

  const staffStats = staff.map(s => {
    const staffComplaints = complaints.filter(c => c.assigned_to === s.id); 
    const completed = staffComplaints.filter(c => c.status === 'COMPLETED').length;
    const inProgress = staffComplaints.filter(c => c.status === 'PROCESSING').length;
    const rate = staffComplaints.length > 0 ? Math.round((completed / staffComplaints.length) * 100) : 0;

    return {
      ...s,
      total: staffComplaints.length,
      completed,
      inProgress,
      rate,
      complaints: staffComplaints
    };
  });

  return (
    <div className="s-page active">
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-.5px' }}>담당자 관리</div>
      <div style={{ fontSize: 13, color: '#778090', marginBottom: 20 }}>담당자별 업무 현황과 처리 실적을 확인할 수 있습니다.</div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedStaff ? '1fr 400px' : '1fr', gap: '16px' }}>
        <div>
          <div className="s-tbl-wrap">
            <div className="s-tbl-info">
              <span>담당자 목록 <span className="ti-count">({staff.length}명)</span></span>
            </div>
            <table className="s-tbl">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>이름</th>
                  <th style={{ width: 160 }}>이메일</th>
                  <th style={{ width: 80 }}>배정</th>
                  <th style={{ width: 80 }}>처리중</th>
                  <th style={{ width: 80 }}>완료</th>
                  <th style={{ width: 100 }}>처리율</th>
                  <th style={{ width: 60 }}>상세</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      담당자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  staffStats.map((s, idx) => {
                    const colors = ['#4a9eff', '#22c55e', '#f59e0b', '#8b5cf6'];
                    const color = colors[idx % colors.length];
                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedStaff(s)}
                        style={{ cursor: 'pointer', background: selectedStaff?.id === s.id ? '#f0f5ff' : 'transparent' }}
                      >
                        <td style={{ fontWeight: 600 }}>{s.username}</td>
                        <td>{s.email}</td>
                        <td>{s.total}</td>
                        <td>{s.inProgress}</td>
                        <td>{s.completed}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', background: '#e2e6ec', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${s.rate}%`, background: color, borderRadius: '3px' }}></div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>{s.rate}%</span>
                          </div>
                        </td>
                        <td className="tarr">보기 ›</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedStaff && (
          <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>담당자 상세</h3>
              <button onClick={() => setSelectedStaff(null)} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>닫기</button>
            </div>
            <div style={{ background: '#f7f8fa', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{selectedStaff.username}</div>
              <div style={{ fontSize: '13px', color: '#374151' }}>
                <div><strong>이메일:</strong> {selectedStaff.email}</div>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>업무 통계</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '12px', background: '#e8f4ff', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#1555a4', marginBottom: '4px' }}>전체</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#1555a4' }}>{selectedStaff.total}건</div>
                </div>
                <div style={{ padding: '12px', background: '#fff8e1', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#d97706', marginBottom: '4px' }}>처리중</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706' }}>{selectedStaff.inProgress}건</div>
                </div>
                <div style={{ padding: '12px', background: '#e6f4ea', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#22c55e', marginBottom: '4px' }}>완료</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#22c55e' }}>{selectedStaff.completed}건</div>
                </div>
                <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>처리율</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#6b7280' }}>{selectedStaff.rate}%</div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>최근 민원</div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {selectedStaff.complaints.slice(0, 5).map(c => {
                  const { label, cls } = getStatusInfo(c.status);
                  return (
                    <div key={c.id} style={{ padding: '8px', background: '#f7f8fa', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{c.title}</div>
                      <div style={{ color: '#778090' }}>
                        <span className={`sbadge ${cls}`}>{label}</span>
                        <span style={{ marginLeft: '8px' }}>{c.created_at?.split('T')[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}