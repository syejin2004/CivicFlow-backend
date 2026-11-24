import { useState } from 'react';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';
import ComplaintDetail from './ComplaintDetail';

export default function Inbox() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // 내 민원만 필터링
  const myComplaints = complaints.filter(c => c.assigneeId === user?.id);

  const stats = {
    total: myComplaints.length,
    assigned: myComplaints.filter(c => c.status === 'assigned').length,
    inProgress: myComplaints.filter(c => c.status === 'inProgress').length,
    completed: myComplaints.filter(c => c.status === 'completed').length,
  };

  if (selectedComplaint) {
    return <ComplaintDetail complaint={selectedComplaint} onBack={() => setSelectedComplaint(null)} />;
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-.5px', margin: 0 }}>민원 접수 목록</h1>
      </div>
      <p style={{ fontSize: '13px', color: '#778090', margin: '0 0 20px' }}>
        접수된 민원을 확인하고, 분류·배정·처리·답변을 진행할 수 있습니다.
      </p>

      {/* 통계 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', color: '#778090', fontWeight: 700, marginBottom: '8px' }}>전체 민원</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#172238' }}>{stats.total}<span style={{ fontSize: '14px', color: '#778090', marginLeft: '2px' }}>건</span></div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', color: '#778090', fontWeight: 700, marginBottom: '8px' }}>배정완료</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6' }}>{stats.assigned}<span style={{ fontSize: '14px', color: '#778090', marginLeft: '2px' }}>건</span></div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', color: '#778090', fontWeight: 700, marginBottom: '8px' }}>처리중</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1555a4' }}>{stats.inProgress}<span style={{ fontSize: '14px', color: '#778090', marginLeft: '2px' }}>건</span></div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', color: '#778090', fontWeight: 700, marginBottom: '8px' }}>완료</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#22c55e' }}>{stats.completed}<span style={{ fontSize: '14px', color: '#778090', marginLeft: '2px' }}>건</span></div>
        </div>
      </div>

      {/* 민원 목록 */}
      <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>담당 민원 목록</h3>
        <table style={{ width: '100%', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e6ec' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>번호</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>제목</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>접수일</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>처리기한</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {myComplaints.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#778090' }}>
                  배정된 민원이 없습니다.
                </td>
              </tr>
            ) : (
              myComplaints.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid #f0f2f5', cursor: 'pointer' }}
                  onClick={() => setSelectedComplaint(item)}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8fa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px' }}>{item.id}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: '12px' }}>{item.receivedDate}</td>
                  <td style={{ padding: '12px' }}>{item.deadline}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: item.status === 'completed' ? '#e6f4ea' : item.status === 'inProgress' ? '#e8f4ff' : '#fef3c7',
                      color: item.status === 'completed' ? '#22c55e' : item.status === 'inProgress' ? '#1555a4' : '#d97706'
                    }}>
                      {item.statusLabel}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
