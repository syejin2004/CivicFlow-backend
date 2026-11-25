import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = 'https://civicflow-production.up.railway.app/api';

export default function AIPhoto() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState('');

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');

  const categories = ['도로/교통', '시설물', '환경/청소', '안전/재난', '주거/도시', '복지/건강', '기타'];

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;
    if (!validTypes.includes(file.type)) {
      alert('JPG, PNG, WEBP 파일만 업로드 가능합니다.');
      return false;
    }
    if (file.size > maxSize) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return false;
    }
    return true;
  };

  const handleFileSelect = (file) => {
    if (!validateFile(file)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setUploadedFile(file);
      setAiResult(null);
      setCategory('');
      setTitle('');
      setContent('');
      setLocation('');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) {
      alert('사진을 먼저 업로드해주세요.');
      return;
    }
    if (!description.trim()) {
      alert('간단한 설명을 입력해주세요.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('civicflow_token');
      const res = await fetch(`${BASE_URL}/complaints/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description })
      });

      if (res.ok) {
        const result = await res.json();
        setAiResult(result);
        setCategory(result.category);
        setTitle(result.title);
        setContent(result.content);
        if (result.location) setLocation(result.location);
      } else {
        throw new Error('생성 실패');
      }
    } catch (e) {
      alert('AI 생성 실패. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setAiResult(null);
    setDescription('');
    setCategory('');
    setTitle('');
    setContent('');
    setLocation('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/', { state: { openLogin: true } });
      }
      return;
    }
    if (!category) { alert('민원 유형을 선택해주세요.'); return; }
    if (!title.trim()) { alert('민원 제목을 입력해주세요.'); return; }
    if (!content.trim()) { alert('민원 내용을 입력해주세요.'); return; }
    if (!location.trim()) { alert('발생 위치를 입력해주세요.'); return; }
    if (!window.confirm('민원을 접수하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('civicflow_token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('location', location);
      formData.append('category_id', 1);
      if (uploadedFile) formData.append('images', uploadedFile);

      const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert('민원이 접수되었습니다!');
        navigate('/result');
      } else {
        alert('민원 접수 실패');
      }
    } catch (e) {
      alert('서버 연결 실패');
    }
  };

  return (
    <div className="inner-page">
      <div className="wrap">
        <div className="breadcrumb">
          <span onClick={() => navigate('/')}>홈</span>
          <span className="sep">›</span>
          <span>AI 민원 자동 작성</span>
        </div>
        <h1 className="pg-title">AI 민원 자동 작성</h1>
        <p className="pg-desc" style={{ marginBottom: '28px' }}>
          현장 사진과 간단한 설명을 입력하면 AI가 민원 내용을 자동으로 작성해 드립니다.
        </p>

        <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '18px 28px', marginBottom: '28px', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: uploadedImage ? '#1555a4' : '#e2e6ec', color: uploadedImage ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>1</div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: uploadedImage ? '#1555a4' : '#9ca3af' }}>사진 업로드</span>
          </div>
          <div style={{ flex: 1, height: '2px', background: '#e2e6ec', margin: '0 8px' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: aiResult ? '#1555a4' : '#e2e6ec', color: aiResult ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>2</div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: aiResult ? '#1555a4' : '#9ca3af' }}>AI 분석</span>
          </div>
          <div style={{ flex: 1, height: '2px', background: '#e2e6ec', margin: '0 8px' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e2e6ec', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>3</div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#9ca3af' }}>내용 확인 및 접수</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#172238', marginBottom: '8px' }}>1. 사진 업로드</div>
            <p style={{ fontSize: '13px', color: '#778090', margin: '0 0 16px' }}>민원 현장 사진을 업로드하고 간단한 설명을 입력해주세요.</p>

            {!uploadedImage ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', border: `2px dashed ${isDragging ? '#1555a4' : '#c8d2de'}`, borderRadius: '10px', padding: '48px 20px', cursor: 'pointer', background: isDragging ? '#f0f5ff' : 'transparent' }}
              >
                <div style={{ fontSize: '36px' }}>📷</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>사진 파일을 선택하거나 여기에 끌어다 놓으세요</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>JPG, PNG, WEBP (최대 10MB)</div>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative' }}>
                  <img src={uploadedImage} alt="업로드된 사진" style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e6ec' }} />
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }} style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,0,0,.7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
                <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', marginTop: '8px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>다른 사진 선택</button>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileInputChange} />

            {uploadedImage && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#374151' }}>
                  간단한 설명 <span style={{ color: '#e23b45' }}>*</span>
                  <span style={{ fontSize: '11px', color: '#778090', fontWeight: 400, marginLeft: '6px' }}>위치 포함하면 자동 입력됩니다</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 서울시 강남구 테헤란로에 도로 구멍이 생겼어요"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  style={{ width: '100%', marginTop: '12px', padding: '14px', border: 'none', borderRadius: '8px', background: isAnalyzing ? '#9ca3af' : '#1555a4', color: '#fff', fontSize: '14px', fontWeight: 800, cursor: isAnalyzing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isAnalyzing ? (
                    <><span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>AI가 작성하는 중...</>
                  ) : <>AI 민원 내용 자동 작성</>}
                </button>
              </div>
            )}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#172238', marginBottom: '8px' }}>2. AI 작성 결과</div>
            <p style={{ fontSize: '13px', color: '#778090', margin: '0 0 16px' }}>AI가 작성한 내용을 확인하고 수정할 수 있습니다.</p>

            {!aiResult && !isAnalyzing && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#b0b8c4', fontSize: '13px' }}>
                사진을 업로드하고 설명을 입력한 후<br />AI 자동 작성 버튼을 눌러주세요.
              </div>
            )}

            {aiResult && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#374151' }}>민원 유형 <span style={{ color: '#e23b45' }}>*</span></label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}>
                    <option value="">선택하세요</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#374151' }}>민원 제목 <span style={{ color: '#e23b45' }}>*</span></label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#374151' }}>발생 위치 <span style={{ color: '#e23b45' }}>*</span></label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="예: 서울시 강남구 테헤란로 123" style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#374151' }}>민원 내용 <span style={{ color: '#e23b45' }}>*</span></label>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '100px', lineHeight: 1.6 }} />
                </div>

                <div style={{ background: '#fef3c7', borderRadius: '7px', padding: '12px 14px', fontSize: '12px', color: '#92400e', marginBottom: '16px', lineHeight: 1.6 }}>
                  ⚠️ AI가 생성한 내용은 참고용 초안입니다. 반드시 확인 후 수정하여 접수해주세요.
                </div>

                <button onClick={handleSubmit} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '8px', background: '#172e5c', color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                  민원 접수하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}