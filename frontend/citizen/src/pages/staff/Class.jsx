import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useComplaints } from '../../contexts/ComplaintContext';

const BASE_URL = 'https://civicflow-production.up.railway.app/api';
const getToken = () => localStorage.getItem('civicflow_token');

export default function Class() {
  const { user } = useAuth();
  const { complaints, fetchComplaints } = useComplaints();
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const [classifyResult, setClassifyResult] = useState(null);

  const aiClassifiedComplaints = complaints.filter(c => c.ai_category);

  const filteredComplaints = aiClassifiedComplaints.filter(c => {
    if (categoryFilter !== '전체' && c.ai_category !== categoryFilter) return false;
    return true;
  });

  const unclassifiedComplaints = complaints.filter(c => !c.ai_category);

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

  const handleClassify = async (complaint) => {
    setSelectedComplaint(complaint);
    setClassifying(true);
    setClassifyResult(null);
    try {
      const res = await fetch(`${BASE_URL}/complaints/${complaint.id}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setClassifyResult(data);
        await fetchComplaints();
      } else {
        setClassifyResult({ error: data.message || 'AI 분류 실패' });
      }
    } catch (e) {
      setClassifyResult({ error: '서버 연결 실패' });
    } finally {
      setClassifying(false);
    }
  };

  return (
    <div className="s-page active">
      <div className="s-toolbar">
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.5px', marginBottom: 4 }}>AI 분류 결과</div>
          <div style={{ fontSize: 13, color: '#778090' }}>AI가 자동 분류한 민원 현황을 확인하고 미분류 민원을 직접 분류할 수 있습니다.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', color: '#778090', fontWeight: 700, marginBottom: '8px' }}>AI 분류 민원</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#172238' }}>
            {aiClassifiedComplaints.length}<span style={{ fontSize: '14px', color: '#778090', marginLeft: '4px' }}>건</span>
          </div>
        </div>
        <div style={{ background: '#e6f4ea', border: '1px solid #c6e6cd', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 700, marginBottom: '8px' }}>도로파손</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#22c55e' }}>
            {aiClassifiedComplaints.filter(c => c.ai_category === '도로파손').length}<span style={{ fontSize: '14px', marginLeft: '4px' }}>건</span>
          </div>
        </div>
        <div style={{ background: '#fff8e1', border: '1px solid #ffd966', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 700, marginBottom: '8px' }}>미분류</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706' }}>
            {unclassifiedComplaints.length}<span style={{ fontSize: '14px', marginLeft: '4px' }}>건</span>
          </div>
        </div>
        <div style={{ background: '#fee', border: '1px solid #fcc', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', color: '#e23b45', fontWeight: 700, marginBottom: '8px' }}>기타</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#e23b45' }}>
            {aiClassifiedComplaints.filter(c => !['도로파손','불법주정차','쓰레기투기','소음','가로등고장'].includes(c.ai_category)).length}<span style={{ fontSize: '14px', marginLeft: '4px' }}>건</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedComplaint ? '1fr 380px' : '1fr', gap: '16px' }}>
        <div>
          {/* 미분류 민원 목록 */}
          {unclassifiedComplaints.length > 0 && (
            <div className="s-tbl-wrap" style={{ marginBottom: '16px' }}>
              <div className="s-tbl-info">
                <span style={{ color: '#e23b45' }}>미분류 민원 <span className="ti-count">({unclassifiedComplaints.length}건)</span></span>
                <span style={{ fontSize: '12px', color: '#778090', marginLeft: '8px' }}>AI 분류 버튼을 클릭하세요</span>
              </div>
              <table className="s-tbl">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>번호</th>
                    <th>민원 제목</th>
                    <th style={{ width: 90 }}>접수일</th>
                    <th style={{ width: 80 }}>상태</th>
                    <th style={{ width: 90 }}>AI 분류</th>
                  </tr>
                </thead>
                <tbody>
                  {unclassifiedComplaints.map(c => {
                    const { label, cls } = getStatusInfo(c.status);
                    return (
                      <tr key={c.id} style={{ background: selectedComplaint?.id === c.id ? '#f0f5ff' : 'transparent' }}>
                        <td className="tnum">{c.id}</td>
                        <td>{c.title}</td>
                        <td>{c.created_at?.split('T')[0]}</td>
                        <td><span className={`sbadge ${cls}`}>{label}</span></td>
                        <td>
                          <button
                            onClick={() => handleClassify(c)}
                            style={{ padding: '4px 10px', background: '#1555a4', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            분류하기
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 분류된 민원 목록 */}
          <div className="s-search-bar" style={{ marginBottom: '16px' }}>
            <span className="sb-label">분류</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option>전체</option>
              <option>도로파손</option>
              <option>불법주정차</option>
              <option>쓰레기투기</option>
              <option>소음</option>
              <option>가로등고장</option>
              <option>기타</option>
            </select>
          </div>

          <div className="s-tbl-wrap">
            <div className="s-tbl-info">
              <span>AI 분류 민원 목록 <span className="ti-count">({filteredComplaints.length}건)</span></span>
            </div>
            <table className="s-tbl">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>번호</th>
                  <th>민원 제목</th>
                  <th style={{ width: 110 }}>AI 분류</th>
                  <th style={{ width: 110 }}>담당 부서</th>
                  <th style={{ width: 90 }}>접수일</th>
                  <th style={{ width: 80 }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      {aiClassifiedComplaints.length === 0 ? 'AI가 분류한 민원이 없습니다.' : '필터 조건에 맞는 민원이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map(c => {
                    const { label, cls } = getStatusInfo(c.status);
                    return (
                      <tr key={c.id} onClick={() => setSelectedComplaint(c)} style={{ cursor: 'pointer', background: selectedComplaint?.id === c.id ? '#f0f5ff' : 'transparent' }}>
                        <td className="tnum">{c.id}</td>
                        <td>{c.title}</td>
                        <td>
                          <span className="s-cat-badge" style={{ background: '#e9f1fc', color: '#1555a4' }}>
                            {c.ai_category}
                          </span>
                        </td>
                        <td>{c.ai_department || '-'}</td>
                        <td>{c.created_at?.split('T')[0]}</td>
                        <td><span className={`sbadge ${cls}`}>{label}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 오른쪽 패널: AI 분류 결과 */}
        {selectedComplaint && (
          <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>AI 분류 상세</div>
              <button onClick={() => { setSelectedComplaint(null); setClassifyResult(null); }} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>닫기</button>
            </div>

            <div style={{ background: '#f7f8fa', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#778090', marginBottom: '4px' }}>민원 번호 {selectedComplaint.id}</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{selectedComplaint.title}</div>
              <div style={{ fontSize: '12px', color: '#778090', marginTop: '6px', lineHeight: 1.6 }}>{selectedComplaint.content}</div>
            </div>

            {classifying && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#1555a4' }}>
                AI 분류 중...
              </div>
            )}

            {classifyResult && !classifyResult.error && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: '#22c55e' }}>분류 완료!</div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#778090', marginBottom: '4px' }}>AI 분류</div>
                  <span className="s-cat-badge" style={{ background: '#e9f1fc', color: '#1555a4' }}>
                    {classifyResult.ai_category || selectedComplaint.ai_category}
                  </span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#778090', marginBottom: '4px' }}>담당 부서</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{classifyResult.ai_department || selectedComplaint.ai_department || '-'}</div>
                </div>
                {(classifyResult.ai_reason || selectedComplaint.ai_reason) && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#778090', marginBottom: '4px' }}>분류 이유</div>
                    <div style={{ fontSize: '12px', lineHeight: 1.6, padding: '10px', background: '#f0f5ff', borderRadius: '6px', color: '#1555a4' }}>
                      {classifyResult.ai_reason || selectedComplaint.ai_reason}
                    </div>
                  </div>
                )}
              </div>
            )}

            {classifyResult?.error && (
              <div style={{ padding: '12px', background: '#fee', borderRadius: '8px', color: '#c00', fontSize: '13px' }}>
                {classifyResult.error}
              </div>
            )}

            {!classifying && !classifyResult && selectedComplaint.ai_category && (
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#778090', marginBottom: '4px' }}>AI 분류</div>
                  <span className="s-cat-badge" style={{ background: '#e9f1fc', color: '#1555a4' }}>{selectedComplaint.ai_category}</span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#778090', marginBottom: '4px' }}>담당 부서</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedComplaint.ai_department || '-'}</div>
                </div>
                {selectedComplaint.ai_reason && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#778090', marginBottom: '4px' }}>분류 이유</div>
                    <div style={{ fontSize: '12px', lineHeight: 1.6, padding: '10px', background: '#f0f5ff', borderRadius: '6px', color: '#1555a4' }}>
                      {selectedComplaint.ai_reason}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleClassify(selectedComplaint)}
                  style={{ marginTop: '12px', width: '100%', padding: '10px', background: '#1555a4', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  재분류하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ background: '#f0f5ff', borderRadius: '10px', padding: '16px 20px', marginTop: '20px', fontSize: '13px', color: '#1555a4', lineHeight: 1.6 }}>
        💡 <strong>AI 분류란?</strong><br />
        민원 내용을 AI가 분석하여 분류와 담당 부서를 자동으로 추천합니다. 미분류 민원은 분류하기 버튼을 눌러 분류할 수 있습니다.
      </div>
    </div>
  );
}