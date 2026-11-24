import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = 'https://civicflow-production.up.railway.app/api';

export default function Result() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchMyComplaints();
  }, [user]);

  const fetchMyComplaints = async () => {
    try {
      const token = localStorage.getItem('civicflow_token');
      const res = await fetch(`${BASE_URL}/complaints/mine`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (e) {
      console.error('민원 조회 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      SUBMITTED: { label: '접수완료', cls: 'waiting' },
      ASSIGNED: { label: '배정완료', cls: 'processing' },
      PROCESSING: { label: '처리중', cls: 'processing' },
      COMPLETED: { label: '처리완료', cls: 'done' },
      REJECTED: { label: '반려', cls: 'done' },
    };
    return map[status] || { label: status, cls: '' };
  };

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#172238' }}>로그인이 필요한 서비스입니다</div>
        <div style={{ fontSize: '14px', color: '#778090', lineHeight: 1.8 }}>민원결과조회는 회원만 이용할 수 있습니다.<br />로그인 후 이용해 주세요.</div>
        <button onClick={() => navigate('/', { state: { openLogin: true } })} style={{ background: '#1555a4', color: '#fff', border: 'none', padding: '13px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>로그인</button>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}>← 홈으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="inner-page">
      <div className="wrap">
        <div className="breadcrumb">
          <span onClick={() => navigate('/')}>홈</span>
          <span className="sep">›</span>
          <span>민원결과조회</span>
        </div>
        <h1 className="pg-title">민원결과조회</h1>
        <p className="pg-desc">신청하신 민원의 처리 진행상황을 확인할 수 있습니다.</p>

        <div className="result-table-wrap" style={{ marginTop: 28 }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px' }}>로딩중...</p>
          ) : complaints.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#778090' }}>접수된 민원이 없습니다.</p>
          ) : (
            <table className="result-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>번호</th>
                  <th>민원제목</th>
                  <th style={{ width: 110 }}>신청일</th>
                  <th style={{ width: 100 }}>처리상태</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((row) => {
                  const { label, cls } = getStatusLabel(row.status);
                  return (
                    <tr key={row.id}>
                      <td className="num">{row.id}</td>
                      <td>{row.title}</td>
                      <td>{row.created_at?.split('T')[0]}</td>
                      <td><span className={`status-badge ${cls}`}>{label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}