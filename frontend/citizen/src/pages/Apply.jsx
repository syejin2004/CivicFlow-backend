import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = 'https://civicflow-production.up.railway.app/api';

export default function Apply() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const searchAddress = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        setLocation(data.roadAddress || data.jibunAddress);
      }
    }).open();
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) {
      alert('최대 5개까지 첨부 가능합니다.');
      return;
    }
    setFiles(selected);
  };

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
      const token = localStorage.getItem('civicflow_token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('location', location.trim() || '미입력');
      formData.append('category_id', 1);
      files.forEach(file => formData.append('images', file));

      const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert('민원이 접수되었습니다!');
        navigate('/');
      } else {
        const data = await res.json();
        alert(data.message || '민원 접수 실패');
      }
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
            <div className="cf-form-row">
              <div className="cf-form-group">
                <label>발생 위치</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="주소 검색 버튼을 클릭하세요."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ flex: 1 }}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={searchAddress}
                    style={{ padding: '10px 16px', background: '#1555a4', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    주소 검색
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="cf-form-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>첨부파일</span>
              <div className="cf-upload-row" style={{ padding: 0 }}>
                <label style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  파일 첨부
                  <input
                    type="file"
                    multiple
                    accept="image/jpg,image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <span className="cf-upload-hint">최대 5개, jpg, png, pdf 가능</span>
              </div>
            </div>
            {files.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {files.map((f, i) => (
                  <div key={i} style={{ fontSize: '12px', background: '#e9f1fc', color: '#1555a4', padding: '4px 10px', borderRadius: '20px' }}>
                    {f.name}
                  </div>
                ))}
              </div>
            )}
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