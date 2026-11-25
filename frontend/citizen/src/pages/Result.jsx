import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = 'https://civicflow-production.up.railway.app/api';

export default function Result() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

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
          <span onClick={() => setSelected(null)} style={{ cursor: selected ? 'pointer' : 'default' }}>민원결과조회</span>
          {selected && <><span className="sep">›</span><span>상세보기</span></>}
        </div>

        {selected ? (
          <>
            <h1 className="pg-title">민원 상세정보</h1>
            <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '12px', padding: '30px', marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#778090', marginBottom: '4px' }}>민원번호</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{selected.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#778090', marginBottom: '4px' }}>처리상태</div>
                  <span className={`status-badge ${getStatusLabel(selected.status).cls}`}>{getStatusLabel(selected.status).label}</span>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#778090', marginBottom: '4px' }}>신청일</div>
                  <div style={{ fontSize: '14px' }}>{selected.created_at?.split('T')[0]}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#778090', marginBottom: '4px' }}>발생 위치</div>
                  <div style={{ fontSize: '14px' }}>{selected.location || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#778090', marginBottom: '4px' }}>AI 분류</div>
                  <div style={{ fontSize: '14px' }}>{selected.ai_category || '미분류'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#778090', marginBottom: '4px' }}>담당 부서</div>
                  <div style={{ fontSize: '14px' }}>{selected.ai_department || '-'}</div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#778090', marginBottom: '8px' }}>민원 제목</div>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>{selected.title}</div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#778090', marginBottom: '8px' }}>민원 내용</div>
                <div style={{ fontSize: '14px', lineHeight: 1.7, padding: '16px', background: '#f7f8fa', borderRadius: '8px' }}>{selected.content}</div>
              </div>

              {selected.images && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#778090', marginBottom: '8px' }}>첨부 이미지</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {selected.images.split(',').map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`첨부이미지 ${i + 1}`}
                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e6ec' }}
                        onClick={() => window.open(url, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {selected.answer_content && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#778090', marginBottom: '8px' }}>담당자 답변</div>
                  <div style={{ fontSize: '14px', lineHeight: 1.7, padding: '16px', background: '#e6f4ea', borderRadius: '8px', color: '#1a7a3c', borderLeft: '4px solid #22c55e' }}>
                    {selected.answer_content}
                  </div>
                  {selected.answer_created_at && (
                    <div style={{ fontSize: '11px', color: '#778090', marginTop: '6px' }}>
                      답변일: {selected.answer_created_at?.split('T')[0]}
                    </div>
                  )}
                </div>
              )}

              {selected.ai_reason && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#778090', marginBottom: '8px' }}>AI 분류 이유</div>
                  <div style={{ fontSize: '14px', lineHeight: 1.7, padding: '16px', background: '#f0f5ff', borderRadius: '8px', color: '#1555a4' }}>{selected.ai_reason}</div>
                </div>
              )}

              <button
                onClick={() => setSelected(null)}
                style={{ background: '#1555a4', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                목록으로
              </button>
            </div>
          </>
        ) : (
          <>
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
                      <th style={{ width: 80 }}>답변</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((row) => {
                      const { label, cls } = getStatusLabel(row.status);
                      return (
                        <tr key={row.id} onClick={() => setSelected(row)} style={{ cursor: 'pointer' }}>
                          <td className="num">{row.id}</td>
                          <td>{row.title}</td>
                          <td>{row.created_at?.split('T')[0]}</td>
                          <td><span className={`status-badge ${cls}`}>{label}</span></td>
                          <td style={{ textAlign: 'center' }}>
                            {row.answer_content ? (
                              <span style={{ fontSize: '11px', background: '#e6f4ea', color: '#22c55e', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>답변완료</span>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}