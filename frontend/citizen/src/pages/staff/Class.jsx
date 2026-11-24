import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useComplaints } from '../../contexts/ComplaintContext';

export default function Class() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const [categoryFilter, setCategoryFilter] = useState('전체');

  const aiClassifiedComplaints = complaints.filter(c => c.ai_category);

  const filteredComplaints = aiClassifiedComplaints.filter(c => {
    if (categoryFilter !== '전체' && c.ai_category !== categoryFilter) return false;
    return true;
  });

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
    <div className="s-page active">
      <div className="s-toolbar">
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.5px', marginBottom: 4 }}>AI 분류 결과</div>
          <div style={{ fontSize: 13, color: '#778090' }}>AI가 자동 분류한 민원 현황과 분류 신뢰도를 확인할 수 있습니다.</div>
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
          <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 700, marginBottom: '8px' }}>불법주정차</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706' }}>
            {aiClassifiedComplaints.filter(c => c.ai_category === '불법주정차').length}<span style={{ fontSize: '14px', marginLeft: '4px' }}>건</span>
          </div>
        </div>
        <div style={{ background: '#fee', border: '1px solid #fcc', borderRadius: '10px', padding: '18px 20px' }}>
          <div style={{ fontSize: '12px', color: '#e23b45', fontWeight: 700, marginBottom: '8px' }}>기타</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#e23b45' }}>
            {aiClassifiedComplaints.filter(c => !['도로파손','불법주정차','쓰레기투기','소음','가로등고장'].includes(c.ai_category)).length}<span style={{ fontSize: '14px', marginLeft: '4px' }}>건</span>
          </div>
        </div>
      </div>

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
                  {aiClassifiedComplaints.length === 0
                    ? 'AI가 분류한 민원이 없습니다.'
                    : '필터 조건에 맞는 민원이 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredComplaints.map(c => {
                const { label, cls } = getStatusInfo(c.status);
                return (
                  <tr key={c.id} style={{ cursor: 'pointer' }}>
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

      <div style={{ background: '#f0f5ff', borderRadius: '10px', padding: '16px 20px', marginTop: '20px', fontSize: '13px', color: '#1555a4', lineHeight: 1.6 }}>
        💡 <strong>AI 분류 신뢰도란?</strong><br />
        AI가 민원을 자동 분류할 때의 확신도를 나타냅니다. 신뢰도가 낮은 민원은 재분류가 필요할 수 있습니다.
      </div>
    </div>
  );
}