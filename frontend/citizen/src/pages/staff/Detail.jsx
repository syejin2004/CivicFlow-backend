import { useState } from 'react';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';
import StaffModal from '../../components/staff/StaffModal';

const BASE_URL = 'https://civicflow-production.up.railway.app/api';
const getToken = () => localStorage.getItem('civicflow_token');

export default function Detail({ setPage, showToast, complaintId }) {
  const { complaints, updateComplaintStatus, completeComplaint, fetchComplaints } = useComplaints();
  const { user } = useAuth();
  const [modal, setModal] = useState(null);
  const [content, setContent] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [classifying, setClassifying] = useState(false);

  const complaint = complaints.find(c => c.id === complaintId);

  const close = () => setModal(null);

  const confirmSave = async () => {
    close();
    showToast('임시저장되었습니다.');
  };

  const confirmDone = async () => {
    if (!complaint) return;
    await completeComplaint(complaint.id, content);
    close();
    showToast('처리완료로 변경되었습니다.');
    setPage('list');
  };

  const handleAiClassify = async () => {
    if (!complaint) return;
    setClassifying(true);
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
        await fetchComplaints();
        showToast('AI 분류가 완료되었습니다!');
      } else {
        showToast(data.message || 'AI 분류 실패');
      }
    } catch (e) {
      showToast('AI 분류 실패');
    } finally {
      setClassifying(false);
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      SUBMITTED: '접수완료',
      ASSIGNED: '배정완료',
      PROCESSING: '처리중',
      COMPLETED: '처리완료',
      REJECTED: '반려',
    };
    return map[status] || status;
  };

  if (!complaint) {
    return (
      <div className="s-page active">
        <div className="s-back-link" onClick={() => setPage('list')}>← 목록으로</div>
        <p style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>민원 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="s-page active">
      <div className="s-back-link" onClick={() => setPage('list')}>← 목록으로</div>
      <div className="s-detail-title-row">
        <h2>{complaint.title}</h2>
        <span className="s-cat-badge">{complaint.ai_category || '미분류'}</span>
        <span className="sbadge rev">{getStatusLabel(complaint.status)}</span>
      </div>
      <p style={{ fontSize: 13, color: '#778090', margin: '0 0 20px' }}>민원번호 {complaint.id}</p>

      <div className="s-detail-wrap">
        <div className="s-detail-left">
          <div className="s-detail-card">
            <h3>민원 정보</h3>
            {[
              ['민원번호', complaint.id],
              ['접수일', complaint.created_at?.split('T')[0]],
              ['신청자', complaint.username || '-'],
              ['위치', complaint.location || '-'],
            ].map(([l, v]) => (
              <div key={l} className="s-detail-row">
                <span className="dr-label">{l}</span>
                <span className="dr-val">{v}</span>
              </div>
            ))}
          </div>

          <div className="s-detail-card">
            <h3>민원 내용</h3>
            <p className="s-detail-content">{complaint.content}</p>
          </div>

          {complaint.images && (
            <div className="s-detail-card">
              <h3>첨부 이미지</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {complaint.images.split(',').map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`첨부이미지 ${i + 1}`}
                    style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e6ec' }}
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="s-detail-right">
          <div className="s-detail-card">
            <h3>처리 정보</h3>
            {[
              ['처리 상태', getStatusLabel(complaint.status)],
              ['담당 부서', complaint.ai_department || '-'],
              ['AI 분류', complaint.ai_category || '미분류'],
            ].map(([l, v]) => (
              <div key={l} className="s-detail-row">
                <span className="dr-label">{l}</span>
                <span className="dr-val">{v}</span>
              </div>
            ))}
            {complaint.ai_reason && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#f0f5ff', borderRadius: '6px', fontSize: '12px', color: '#1555a4', lineHeight: 1.6 }}>
                💡 {complaint.ai_reason}
              </div>
            )}
            {user?.role === 'manager' && (
              <button
                onClick={handleAiClassify}
                disabled={classifying}
                style={{ marginTop: '12px', width: '100%', padding: '8px', background: complaint.ai_category ? '#778090' : '#1555a4', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                {classifying ? 'AI 분류 중...' : complaint.ai_category ? 'AI 재분류하기' : 'AI 분류하기'}
              </button>
            )}
          </div>
          <div className="s-detail-card">
            <h3>처리 내용</h3>
            <select
              className="s-process-select"
              value={nextStatus}
              onChange={e => setNextStatus(e.target.value)}
            >
              <option value="">처리 상태 선택</option>
              <option value="ASSIGNED">배정완료</option>
              <option value="PROCESSING">처리중</option>
              <option value="COMPLETED">처리완료</option>
              <option value="REJECTED">반려</option>
            </select>
            <textarea
              className="s-process-textarea"
              placeholder="처리 내용을 입력하세요."
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ display: 'block', width: '100%' }}
            />
            <div className="s-upload-hint">파일은 최대 10개까지 첨부 가능합니다.</div>
            <div className="s-process-actions">
              <button className="s-btn-save" onClick={() => setModal('save')}>임시저장</button>
              <button className="s-btn-done" onClick={() => setModal('done')}>처리완료</button>
            </div>
          </div>
        </div>
      </div>

      {modal === 'save' && (
        <StaffModal title="임시저장" onClose={close} footer={<><button className="sf-btn-cancel" onClick={close}>취소</button><button className="sf-btn-ok" onClick={confirmSave}>확인</button></>}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💾</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>작성 내용을 임시저장하시겠습니까?</div>
          </div>
        </StaffModal>
      )}

      {modal === 'done' && (
        <StaffModal title="처리완료 확인" onClose={close} footer={<><button className="sf-btn-cancel" onClick={close}>취소</button><button className="sf-btn-ok" onClick={confirmDone}>확인</button></>}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>처리완료로 변경하시겠습니까?</div>
          </div>
        </StaffModal>
      )}
    </div>
  );
}