import { useState } from 'react';
import { useComplaints } from '../../contexts/ComplaintContext';

const BASE_URL = 'https://civicflow-production.up.railway.app/api';
const getToken = () => localStorage.getItem('civicflow_token');

export default function AllList({ goToDetail }) {
  const { complaints, fetchComplaints } = useComplaints();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [classifyingId, setClassifyingId] = useState(null);

  const filteredComplaints = complaints.filter(c => {
    if (searchText && !c.title.includes(searchText) && !c.id.toString().includes(searchText)) {
      return false;
    }
    if (statusFilter !== '전체') {
      const statusMap = {
        '접수완료': 'SUBMITTED',
        '배정완료': 'ASSIGNED',
        '처리중': 'PROCESSING',
        '처리완료': 'COMPLETED',
        '반려': 'REJECTED',
      };
      if (c.status !== statusMap[statusFilter]) return false;
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

  const handleAiClassify = async (e, complaintId) => {
    e.stopPropagation();
    setClassifyingId(complaintId);
    try {
      const res = await fetch(`${BASE_URL}/complaints/${complaintId}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (res.ok) {
        await fetchComplaints();
        alert('AI 분류 완료!');
      } else {
        alert('AI 분류 실패');
      }
    } catch (e) {
      alert('서버 연결 실패');
    } finally {
      setClassifyingId(null);
    }
  };

  return (
    <div className="s-page active">
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-.5px' }}>전체 민원 관리</div>
      <div style={{ fontSize: 13, color: '#778090', marginBottom: 20 }}>부서 전체 민원을 조회하고 AI 분류를 실행할 수 있습니다.</div>

      <div className="s-search-bar">
        <span className="sb-label">상태</span>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>전체</option>
          <option>접수완료</option>
          <option>배정완료</option>
          <option>처리중</option>
          <option>처리완료</option>
          <option>반려</option>
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
          <span>전체 민원 목록 <span className="ti-count">({filteredComplaints.length}건)</span></span>
        </div>
        <table className="s-tbl">
          <thead>
            <tr>
              <th style={{ width: 80 }}>번호</th>
              <th>민원 제목</th>
              <th style={{ width: 90 }}>AI 분류</th>
              <th style={{ width: 110 }}>담당 부서</th>
              <th style={{ width: 110 }}>접수일</th>
              <th style={{ width: 90 }}>담당자</th>
              <th style={{ width: 80 }}>상태</th>
              <th style={{ width: 90 }}>AI 분류</th>
              <th style={{ width: 60 }}>상세</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filteredComplaints.map(c => {
                const { label, cls } = getStatusInfo(c.status);
                return (
                  <tr key={c.id} onClick={() => goToDetail && goToDetail(c.id)} style={{ cursor: 'pointer' }}>
                    <td className="tnum">{c.id}</td>
                    <td>{c.title}</td>
                    <td>
                      <span className="s-cat-badge" style={{ background: c.ai_category ? '#e9f1fc' : '#f3f4f6', color: c.ai_category ? '#1555a4' : '#9ca3af' }}>
                        {c.ai_category || '미분류'}
                      </span>
                    </td>
                    <td>{c.ai_department || '-'}</td>
                    <td>{c.created_at?.split('T')[0]}</td>
                    <td>{c.assigned_username || '-'}</td>
                    <td><span className={`sbadge ${cls}`}>{label}</span></td>
                    <td>
                      <button
                        onClick={(e) => handleAiClassify(e, c.id)}
                        disabled={classifyingId === c.id}
                        style={{ padding: '4px 8px', background: '#1555a4', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {classifyingId === c.id ? '분류중...' : c.ai_category ? '재분류' : '분류하기'}
                      </button>
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
  );
}