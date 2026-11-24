import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useComplaints } from '../contexts/ComplaintContext';

export default function Apply() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addComplaint } = useComplaints();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#172238' }}>로그인이 필요한 서비스입니다</div>
        <div style={{ fontSize: '14px', color: '#778090', lineHeight: 1.8 }}>민원신청은 회원만 이용할 수 있습니다.<br />로그인 후 이용해 주세요.</div>
        <button onClick={() => navigate('/', { state: { openLogin: true } })} style={{ background: '#1555a4', color: '#fff', border: 'none', padding: '13px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>로그인</button>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}>← 홈으로 돌아가기</button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await addComplaint({
        title,
        content,
        location: '미입력',
        category_id: 1
      });
      alert('민원이 접수되었습니다!');
      navigate('/');
    } catch (e) {
      alert('민원 접수 실패. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inner-page">
      <div className="wrap">
        <div className="breadcrumb">
          <span onClick={() => navigate('/')}>홈</span>
          <span className="sep">›</span>
          <span>민원신청</span>
        </div>
        <h1 className="pg-title">민원신청</h1>
        <p className="pg-desc">일상생활 속 불편과 개선이 필요한 사항을 신청할 수 있습니다.</p>

        <div className="apply-steps" style={{ marginTop: '28px' }}>
          <div className="apply-step active">
            <div className="a-num">1</div>
            <div className="a-label">신청서 작성</div>
          </div>
          <div className="apply-step-line"></div>
          <div className="apply-step">
            <div className="a-num">2</div>
            <div className="a-label">내용 확인</div>
          </div>
          <div className="apply-step-line"></div>
          <div className="apply-step">
            <div className="a-num">3</div>
            <div className="a-label">신청 완료</div>
          </div>
        </div>

        <div className="cf-form-wrap" style={{ marginTop: '28px' }}>
          <div className="cf-form-section">
            <div className="cf-form-section-title">민원 정보 입력</div>
            <div className="cf-form-row">
              <div className="cf-form-group">
                <label>민원 제목 <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="민원 제목을 입력하세요."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
            <div className="cf-form-row">
              <div className="cf-form-group">
                <label>민원 내용 <span className="req">*</span></label>
                <textarea
                  placeholder="자세한 내용을 입력해 주세요."
                  style={{ minHeight: '140px' }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="cf-form-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>첨부파일</span>
              <div className="cf-upload-row" style={{ padding: 0 }}>
                <button className="cf-upload-btn">파일 첨부</button>
                <span className="cf-upload-hint">최대 5개, 총 20MB까지 가능 (jpg, png, pdf 등)</span>
              </div>
            </div>
          </div>

          <div className="cf-form-actions">
            <button className="cf-btn-secondary" onClick={() => navigate('/')}>취소</button>
            <button className="cf-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? '접수중...' : '다음 단계'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}