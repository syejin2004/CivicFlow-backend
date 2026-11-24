import { useState } from 'react';
import { useComplaints } from '../../contexts/ComplaintContext';
import ComplaintDetail from './ComplaintDetail';

export default function AllList() {
  const { complaints } = useComplaints();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [assigneeFilter, setAssigneeFilter] = useState('전체');

  // 필터 적용
  const filteredComplaints = complaints.filter(c => {
    if (searchText && !c.title.includes(searchText) && !c.id.toString().includes(searchText)) {
      return false;
    }
    if (statusFilter !== '전체' && c.statusLabel !== statusFilter) {
      return false;
    }
    if (assigneeFilter !== '전체' && c.assignee !== assigneeFilter) {
      return false;
    }
    return true;
  });

  // 담당자 목록
  const assignees = [...new Set(complaints.map(c => c.assignee).filter(Boolean))];

  if (selectedComplaint) {
    return (
      <ComplaintDetail
        complaint={selectedComplaint}
        onBack={() => setSelectedComplaint(null)}
      />
    );
  }

  return (
    <div className="s-page active">
      <div style={{ fontSize:20, fontWeight:800, marginBottom:4, letterSpacing:'-.5px' }}>전체 민원 관리</div>
      <div style={{ fontSize:13, color:'#778090', marginBottom:20 }}>부서 전체 민원을 조회하고 관리할 수 있습니다.</div>

      {/* 검색 필터 */}
      <div className="s-search-bar">
        <span className="sb-label">상태</span>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>전체</option>
          <option>배정완료</option>
          <option>처리중</option>
          <option>처리완료</option>
        </select>
        <span className="sb-label">담당자</span>
        <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
          <option>전체</option>
          {assignees.map(a => <option key={a}>{a}</option>)}
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

      {/* 민원 목록 */}
      <div className="s-tbl-wrap">
        <div className="s-tbl-info">
          <span>전체 민원 목록 <span className="ti-count">({filteredComplaints.length}건)</span></span>
        </div>
        <table className="s-tbl">
          <thead>
            <tr>
              <th style={{ width:80 }}>번호</th>
              <th>민원 제목</th>
              <th style={{ width:90 }}>분류</th>
              <th style={{ width:110 }}>접수일</th>
              <th style={{ width:80 }}>담당자</th>
              <th style={{ width:80 }}>상태</th>
              <th style={{ width:60 }}>상세</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filteredComplaints.map(c => (
                <tr key={c.id} onClick={() => setSelectedComplaint(c)} style={{ cursor:'pointer' }}>
                  <td className="tnum">{c.id}</td>
                  <td>{c.title}</td>
                  <td><span className="s-cat-badge">{c.category}</span></td>
                  <td>{c.createdAt}</td>
                  <td>{c.assignee || '-'}</td>
                  <td>
                    <span className={`sbadge ${c.status === 'completed' ? 'done' : c.status === 'inProgress' ? 'proc' : 'wait'}`}>
                      {c.statusLabel}
                    </span>
                  </td>
                  <td className="tarr">보기 ›</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
