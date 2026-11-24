import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useComplaints } from '../contexts/ComplaintContext';

export default function AIPhoto() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addComplaint } = useComplaints();
  const fileInputRef = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // 수정 가능한 필드
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');

  const categories = ['도로/교통', '시설물', '환경/청소', '안전/재난', '주거/도시', '복지/건강', '기타'];

  // 파일 검증
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

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

  // 파일 업로드 처리
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

  // 드래그앤드롭
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // AI 분석 시작
  const handleAnalyze = () => {
    if (!uploadedImage) {
      alert('사진을 먼저 업로드해주세요.');
      return;
    }

    setIsAnalyzing(true);

    // Mock AI 분석 (2초 후 결과 표시)
    setTimeout(() => {
      const mockResult = {
        detectedObject: '도로 파손',
        category: '도로/교통',
        title: '도로 포트홀 보수 요청',
        content: '해당 도로에 포트홀이 발생하여 차량 및 보행자의 안전사고가 우려됩니다. 현장 확인 후 보수 조치를 요청드립니다.',
        confidence: 0.92,
        isMock: true
      };

      setAiResult(mockResult);
      setCategory(mockResult.category);
      setTitle(mockResult.title);
      setContent(mockResult.content);
      setIsAnalyzing(false);
    }, 2000);
  };

  // 이미지 삭제
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setAiResult(null);
    setCategory('');
    setTitle('');
    setContent('');
    setLocation('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 민원 접수
  const handleSubmit = () => {
    // 로그인 체크
    if (!isAuthenticated) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        // 현재 작성 내용을 localStorage에 임시 저장
        localStorage.setItem('civicflow_draft', JSON.stringify({
          category,
          title,
          content,
          location,
          image: uploadedImage
        }));
        navigate('/', { state: { returnTo: '/ai-photo' } });
      }
      return;
    }

    // 필수 항목 체크
    if (!category) {
      alert('민원 유형을 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      alert('민원 제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('민원 내용을 입력해주세요.');
      return;
    }
    if (!location.trim()) {
      alert('발생 위치를 입력해주세요.');
      return;
    }

    // 최종 확인
    if (!window.confirm('민원을 접수하시겠습니까?')) {
      return;
    }

    // 민원 접수 (Mock)
    const newComplaint = {
      id: Date.now(),
      title,
      content,
      category,
      location,
      image: uploadedImage,
      status: 'new',
      statusLabel: '접수완료',
      createdAt: new Date().toISOString().split('T')[0],
      citizenId: user?.id,
      citizenName: user?.name,
      aiGenerated: aiResult ? true : false,
      aiConfidence: aiResult?.confidence || null
    };

    // ComplaintContext에 추가 (실제로는 백엔드 API 호출)
    if (addComplaint) {
      addComplaint(newComplaint);
    }

    // 임시 저장 삭제
    localStorage.removeItem('civicflow_draft');

    alert('민원이 접수되었습니다.\n접수번호: ' + newComplaint.id);
    navigate('/result');
  };

  // 임시 저장된 내용 복원
  useState(() => {
    const draft = localStorage.getItem('civicflow_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setCategory(data.category || '');
        setTitle(data.title || '');
        setContent(data.content || '');
        setLocation(data.location || '');
        setUploadedImage(data.image || null);
      } catch (e) {
        console.error('Failed to restore draft', e);
      }
    }
  }, []);

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
          현장 사진을 업로드하고 AI 분석을 통해 민원 내용을 자동으로 작성할 수 있습니다.
        </p>

        {/* 단계 표시 */}
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

        {/* 본문 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* 왼쪽: 사진 업로드 */}
          <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#172238', marginBottom: '8px' }}>1. 사진 업로드</div>
            <p style={{ fontSize: '13px', color: '#778090', margin: '0 0 16px' }}>민원으로 접수할 현장 사진을 업로드해 주세요.</p>

            {!uploadedImage ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  border: `2px dashed ${isDragging ? '#1555a4' : '#c8d2de'}`,
                  borderRadius: '10px',
                  padding: '48px 20px',
                  cursor: 'pointer',
                  transition: 'all .15s',
                  background: isDragging ? '#f0f5ff' : 'transparent'
                }}
              >
                <div style={{ fontSize: '36px' }}>📷</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>
                  사진 파일을 선택하거나 여기에 끌어다 놓으세요
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  JPG, PNG, WEBP (최대 10MB)
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>업로드한 사진</div>
                <div style={{ position: 'relative' }}>
                  <img src={uploadedImage} alt="업로드된 사진" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e6ec' }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,.7)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#374151'
                  }}
                >
                  다른 사진 선택
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />

            {/* AI 분석 버튼 */}
            {uploadedImage && !aiResult && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  background: isAnalyzing ? '#9ca3af' : '#1555a4',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isAnalyzing ? (
                  <>
                    <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>
                    AI가 분석하는 중...
                  </>
                ) : (
                  <>🤖 AI 분석 시작</>
                )}
              </button>
            )}
          </div>

          {/* 오른쪽: AI 분석 결과 및 민원 작성 */}
          <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#172238', marginBottom: '8px' }}>
              2. AI 분석 결과 {aiResult?.isMock && <span style={{ fontSize: '11px', fontWeight: 600, color: '#d97706', background: '#fef3c7', padding: '2px 8px', borderRadius: '10px', marginLeft: '6px' }}>시연용 예시</span>}
            </div>
            <p style={{ fontSize: '13px', color: '#778090', margin: '0 0 16px' }}>
              AI가 분석한 결과를 확인하고 수정할 수 있습니다.
            </p>

            {!aiResult && !isAnalyzing && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#b0b8c4', fontSize: '13px' }}>
                사진을 업로드하고 AI 분석을 시작해주세요.
              </div>
            )}

            {aiResult && (
              <div>
                {/* AI 감지 결과 */}
                <div style={{ background: '#f0f5ff', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#1555a4', fontWeight: 700, marginBottom: '4px' }}>AI 감지 결과</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#172238' }}>{aiResult.detectedObject}</div>
                  {aiResult.confidence && (
                    <div style={{ fontSize: '12px', color: '#778090', marginTop: '4px' }}>
                      분석 신뢰도: {(aiResult.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>

                {/* 민원 유형 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#374151' }}>
                    민원 유형 <span style={{ color: '#e23b45' }}>*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  >
                    <option value="">선택하세요</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 민원 제목 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#374151' }}>
                    민원 제목 <span style={{ color: '#e23b45' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="민원 제목을 입력하세요"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 발생 위치 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#374151' }}>
                    발생 위치 <span style={{ color: '#e23b45' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="예: 인천시 연수구 송도동 123-45"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 민원 내용 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#374151' }}>
                    민원 내용 <span style={{ color: '#e23b45' }}>*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="민원 내용을 입력하세요"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '100px',
                      lineHeight: 1.6
                    }}
                  />
                </div>

                {/* 안내 메시지 */}
                <div style={{ background: '#fef3c7', borderRadius: '7px', padding: '12px 14px', fontSize: '12px', color: '#92400e', marginBottom: '16px', lineHeight: 1.6 }}>
                  ⚠️ AI가 생성한 내용은 참고용 초안입니다. 반드시 확인 후 수정하여 접수해주세요.
                </div>

                {/* 접수 버튼 */}
                <button
                  onClick={handleSubmit}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#172e5c',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  민원 접수하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
