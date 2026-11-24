import { useState } from 'react';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';

export default function ComplaintDetail({ complaint, onBack }) {
  const { user } = useAuth();
  const { updateComplaintStatus, updateComplaintAnswer, completeComplaint } = useComplaints();
  const [answer, setAnswer] = useState(complaint.answer || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!complaint) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#778090' }}>
        민원을 선택해주세요.
      </div>
    );
  }

  const handleSaveAnswer = () => {
    if (!answer.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }
    setIsSaving(true);
    updateComplaintAnswer(complaint.id, answer);
    setTimeout(() => {
      setIsSaving(false);
      alert('답변이 임시 저장되었습니다.');
    }, 500);
  };

  const handleComplete = () => {
    if (!answer.trim()) {
      alert('답변을 작성해야 처리 완료할 수 있습니다.');
      return;
    }
    if (window.confirm('민원 처리를 완료하시겠습니까?')) {
      completeComplaint(complaint.id, answer);
      alert('민원 처리가 완료되었습니다.');
      if (onBack) onBack();
    }
  };

  const handleStatusChange = (newStatus, label) => {
    if (window.confirm(`처리 상태를 "${label}"(으)로 변경하시겠습니까?`)) {
      updateComplaintStatus(complaint.id, newStatus, label);
      alert('처리 상태가 변경되었습니다.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#f59e0b';
      case 'assigned': return '#3b82f6';
      case 'inProgress': return '#1555a4';
      case 'completed': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '16px', height: '100%' }}>
      {/* 왼쪽: 민원 정보 */}
      <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            ← 목록으로
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{complaint.title}</h2>
            <span style={{
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 700,
              background: `${getStatusColor(complaint.status)}20`,
              color: getStatusColor(complaint.status)
            }}>
              {complaint.statusLabel}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#778090' }}>민원번호: {complaint.id}</div>
        </div>

        {/* 신청자 정보 */}
        <div style={{ background: '#f7f8fa', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#172238' }}>신청자 정보</div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', fontSize: '13px' }}>
            <div style={{ color: '#778090' }}>신청자</div>
            <div style={{ color: '#172238', fontWeight: 600 }}>{complaint.applicant}</div>
            <div style={{ color: '#778090' }}>연락처</div>
            <div style={{ color: '#172238' }}>{complaint.phone}</div>
            <div style={{ color: '#778090' }}>주소</div>
            <div style={{ color: '#172238' }}>{complaint.address}</div>
          </div>
        </div>

        {/* 민원 정보 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#172238' }}>민원 내용</div>
          <div style={{ background: '#f7f8fa', borderRadius: '8px', padding: '16px', fontSize: '14px', lineHeight: 1.7, color: '#374151' }}>
            {complaint.content}
          </div>
        </div>

        {/* AI 분류 결과 */}
        <div style={{ background: '#e9f1fc', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#1555a4' }}>
            AI 자동 분류 결과
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', fontSize: '13px' }}>
            <div style={{ color: '#1555a4' }}>카테고리</div>
            <div style={{ color: '#172238', fontWeight: 600 }}>{complaint.category}</div>
            <div style={{ color: '#1555a4' }}>세부 분류</div>
            <div style={{ color: '#172238' }}>{complaint.aiCategory}</div>
            <div style={{ color: '#1555a4' }}>신뢰도</div>
            <div style={{ color: '#172238' }}>{(complaint.aiConfidence * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* 처리 이력 */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#172238' }}>처리 이력</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {complaint.history.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '13px', padding: '8px', background: '#f7f8fa', borderRadius: '6px' }}>
                <div style={{ color: '#778090', minWidth: '130px' }}>{h.date}</div>
                <div style={{ color: '#172238' }}>{h.action}</div>
                <div style={{ color: '#778090', marginLeft: 'auto' }}>by {h.user}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽: 민원 처리 */}
      <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '24px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px', color: '#172238' }}>민원 처리</h3>

        {/* 처리 상태 변경 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#374151' }}>처리 상태</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { status: 'inProgress', label: '처리중' },
              { status: 'completed', label: '처리완료' },
            ].map(({ status, label }) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status, label)}
                disabled={complaint.status === status}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: complaint.status === status ? '#1555a4' : '#fff',
                  color: complaint.status === status ? '#fff' : '#374151',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: complaint.status === status ? 'default' : 'pointer',
                  opacity: complaint.status === status ? 1 : 0.8
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 답변 작성 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#374151' }}>
            답변 작성 <span style={{ color: '#e23b45' }}>*</span>
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="민원에 대한 답변을 작성해주세요."
            disabled={complaint.status === 'completed'}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              lineHeight: 1.6,
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
          <div style={{ fontSize: '12px', color: '#778090', marginTop: '4px' }}>
            {answer.length} / 1000자
          </div>
        </div>

        {/* 버튼 */}
        {complaint.status !== 'completed' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSaveAnswer}
              disabled={isSaving}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #1555a4',
                background: '#fff',
                color: '#1555a4',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isSaving ? '저장 중...' : '임시 저장'}
            </button>
            <button
              onClick={handleComplete}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                background: '#1555a4',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              처리 완료
            </button>
          </div>
        )}

        {complaint.status === 'completed' && (
          <div style={{
            padding: '12px',
            borderRadius: '6px',
            background: '#e6f4ea',
            color: '#22c55e',
            fontSize: '13px',
            fontWeight: 700,
            textAlign: 'center'
          }}>
            ✓ 처리 완료된 민원입니다
          </div>
        )}
      </div>
    </div>
  );
}
