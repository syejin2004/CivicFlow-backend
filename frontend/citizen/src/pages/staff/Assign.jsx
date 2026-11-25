import { useState, useEffect } from 'react';
import { useComplaints } from '../../contexts/ComplaintContext';

const BASE_URL = 'https://civicflow-production.up.railway.app/api';
const getToken = () => localStorage.getItem('civicflow_token');

export default function Assign() {
  const { complaints, fetchComplaints } = useComplaints();
  const [staff, setStaff] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');

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
        setStaff(data.filter(u => u.role === 'OFFICER'));
      }
    } catch (e) {
      console.error('담당자 조회 실패:', e);
    }
  };

  const unassignedComplaints = complaints.filter(c => c.status === 'SUBMITTED');

  const handleAssign = async () => {
    if (!selectedComplaint || !selectedStaff) {
      alert('민원과 담당자를 선택해주세요.');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/complaints/${selectedComplaint.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          next_status: 'ASSIGNED',
          assigned_to: parseInt(selectedStaff),
          memo: '담당자 배정'
        })
      });
      if (res.ok) {
        const staffMember = staff.find(s => s.id === parseInt(selectedStaff));
        alert(`${staffMember?.username}에게 배정되었습니다.`);
        await fetchComplaints();
        setSelectedComplaint(null);
        setSelectedStaff('');
      } else {
        const data = await res.json();
        alert(data.message || '배정 실패');
      }
    } catch (e) {
      alert('서버 연결 실패');
    }
  };

  return (
    <div className="s-page active">
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-.5px' }}>민원 배정 관리</div>
      <div style={{ fontSize: 13, color: '#778090', marginBottom: 20 }}>미배정 민원을 담당자에게 배정할 수 있습니다.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '16px' }}>
        <div className="s-tbl-wrap">
          <div className="s-tbl-info">
            <span>미배정 민원 <span className="ti-count">({unassignedComplaints.length}건)</span></span>
          </div>
          <table className="s-tbl">
            <thead>
              <tr>
                <th style={{ width: 80 }}>번호</th>
                <th>민원 제목</th>
                <th style={{ width: 100 }}>AI 분류</th>
                <th style={{ width: 90 }}>접수일</th>
                <th style={{ width: 60 }}>선택</th>
              </tr>
            </thead>
            <tbody>
              {unassignedComplaints.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    미배정 민원이 없습니다.
                  </td>
                </tr>
              ) : (
                unassignedComplaints.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    style={{ cursor: 'pointer', background: selectedComplaint?.id === c.id ? '#f0f5ff' : 'transparent' }}
                  >
                    <td className="tnum">{c.id}</td>
                    <td>{c.title}</td>
                    <td><span className="s-cat-badge">{c.ai_category || '미분류'}</span></td>
                    <td>{c.created_at?.split('T')[0]}</td>
                    <td className="tarr">선택 ›</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px' }}>민원 배정</h3>

          {selectedComplaint ? (
            <>
              <div style={{ background: '#f7f8fa', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>선택된 민원</div>
                <div style={{ fontSize: '13px', color: '#374151' }}>
                  <div><strong>번호:</strong> {selectedComplaint.id}</div>
                  <div><strong>제목:</strong> {selectedComplaint.title}</div>
                  <div><strong>AI 분류:</strong> {selectedComplaint.ai_category || '미분류'}</div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  담당자 선택 <span style={{ color: '#e23b45' }}>*</span>
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}
                >
                  <option value="">담당자를 선택하세요</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.username} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ background: '#e9f1fc', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#1555a4' }}>
                  담당자별 업무량
                </div>
                {staff.map(s => {
                  const assignedCount = complaints.filter(c => c.assigned_to === s.id).length;
                  return (
                    <div key={s.id} style={{ fontSize: '12px', marginBottom: '4px', color: '#374151' }}>
                      {s.username}: {assignedCount}건
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleAssign}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', background: '#1555a4', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
              >
                배정하기
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '13px' }}>
              왼쪽에서 민원을 선택해주세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}