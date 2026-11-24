import { useState, useEffect } from 'react';
import { useComplaints } from '../../contexts/ComplaintContext';
import StaffModal from '../../components/staff/StaffModal';

export default function Detail({ setPage, showToast, complaintId }) {
  const { complaints, updateComplaintStatus, completeComplaint, departments, fetchDepartments, confirmDepartment } = useComplaints();
  const [modal, setModal] = useState(null);
  const [content, setContent] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [deptId, setDeptId] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const complaint = complaints.find(c => c.id === complaintId);

  // 부서 목록 불러오기
  useEffect(() => {
    if (departments.length === 0) fetchDepartments();
  }, []);

  // 기본 선택값: 확정 부서 → 없으면 AI 추천 부서
  useEffect(() => {
    if (!complaint) return;
    const aiDept = departments.find(d => d.dept_name === complaint.ai_department);
    setDeptId(complaint.department_id ? String(complaint.department_id) : (aiDept ? String(aiDept.id) : ''));
  }, [complaint?.id, complaint?.department_id, departments]);

  const selectedDept = departments.find(d => String(d.id) === deptId);
  const isClosed = ['COMPLETED', 'REJECTED'].includes(complaint?.status);

  // 담당 부서 확정 실행
  const confirmDept = async () => {
    if (!complaint || !deptId) return;
    setIsConfirming(true);
    const result = await confirmDepartment(complaint.id, Number(deptId));
    setIsConfirming(false);
    close();
    showToast(result.success ? `담당 부서가 ${result.data?.department_name || ''}(으)로 확정되었습니다.` : result.message);
  };

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

  const handleStatusChange = async () => {
    if (!nextStatus || !complaint) return;
    await updateComplaintStatus(complaint.id, nextStatus);
    showToast('상태가 변경되었습니다.');
    setPage('list');
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
        </div>

        <div className="s-detail-right">
          <div className="s-detail-card">
            <h3>처리 정보</h3>
            {[
              ['처리 상태', getStatusLabel(complaint.status)],
              ['확정 담당 부서', complaint.department_name || '미배정'],
              ['AI 분류', complaint.ai_category || '미분류'],
              ['AI 판단 근거', complaint.ai_reason || '-'],
            ].map(([l, v]) => (
              <div key={l} className="s-detail-row">
                <span className="dr-label">{l}</span>
                <span className="dr-val">{v}</span>
              </div>
            ))}
          </div>
          <div className="s-detail-card">
            <h3>담당 부서 확정</h3>
            <div className="s-detail-row">
              <span className="dr-label">AI 추천 부서</span>
              <span className="dr-val">{complaint.ai_department || '-'}</span>
            </div>
            <select
              className="s-process-select"
              value={deptId}
              onChange={e => setDeptId(e.target.value)}
              disabled={isClosed}
            >
              <option value="">담당 부서 선택</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.dept_name}{d.dept_name === complaint.ai_department ? ' (AI 추천)' : ''}
                </option>
              ))}
            </select>
            <div className="s-process-actions">
              <button
                className="s-btn-done"
                onClick={() => setModal('dept')}
                disabled={!deptId || isClosed || isConfirming || String(complaint.department_id) === deptId}
              >
                {complaint.department_id ? '담당 부서 변경' : '담당 부서 확정'}
              </button>
            </div>
            {isClosed && <div className="s-upload-hint">처리가 끝난 민원은 담당 부서를 변경할 수 없습니다.</div>}
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

      {modal === 'dept' && (
        <StaffModal title="담당 부서 확정" onClose={close} footer={<><button className="sf-btn-cancel" onClick={close}>취소</button><button className="sf-btn-ok" onClick={confirmDept} disabled={isConfirming}>확인</button></>}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🏢</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
              담당 부서를 '{selectedDept?.dept_name}'(으)로 확정하시겠습니까?
            </div>
            <div style={{ fontSize: 13, color: '#778090' }}>
              AI 추천 부서: {complaint.ai_department || '없음'}
              {complaint.ai_department && selectedDept && complaint.ai_department !== selectedDept.dept_name ? ' → 다른 부서로 변경' : ''}
            </div>
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