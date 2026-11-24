import { useState } from 'react';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';

export default function List({ setPage, goToDetail }) {
  const { complaints } = useComplaints();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');

  const filteredComplaints = complaints.filter(c => {
    if (searchText && !c.title.includes(searchText) && !c.id.toString().includes(searchText)) {
      return false;
    }
    if (categoryFilter !== '전체' && c.ai_category !== categoryFilter) {
      return false;
    }
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
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-.5px' }}>민원 조회</div>
      <div style={{ fontSize: 13, color: '#778090', marginBottom: 20 }}>전체 민원을 검색하고 처리 현황을 확인할 수 있습니다.</div>

      <div className="s-search-bar">
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
        <input
          type="text"
          placeholder="민원 제목 또는 번호를 입력하세요."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="s-search-btn">검색</button>
      </div>

      <div className="s-tbl-wrap">
        <div className="s-tbl-info">
          <span>민원 목록 <span className="ti-count">({filteredComplaints.length}건)</span></span>
        </div>
        <table className="s-tbl">
          <thead>
            <tr>
              <th style={{ width: 80 }}>번호</th>
              <th>민원 제목</th>
              <th style={{ width: 110 }}>접수일</th>
              <th style={{ width: 90 }}>분류</th>
              <th style={{ width: 80 }}>상태</th>
              <th style={{ width: 60 }}>상세</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  민원이 없습니다.
                </td>
              </tr>
            ) : (
              filteredComplaints.map(c => {
                const { label, cls } = getStatusInfo(c.status);
                return (
                  <tr key={c.id} onClick={() => goToDetail(c.id)} style={{ cursor: 'pointer' }}>
                    <td className="tnum">{c.id}</td>
                    <td>{c.title}</td>
                    <td>{c.created_at?.split('T')[0]}</td>
                    <td><span className="s-cat-badge">{c.ai_category || '미분류'}</span></td>
                    <td><span className={`sbadge ${cls}`}>{label}</span></td>
                    <td className="tarr">보기 ›</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}