import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useComplaints } from '../contexts/ComplaintContext';
import { AI_API_BASE_URL as AI_API_URL } from '../config/api';

// 백엔드 민원 분류 체계 (backend/constants/complaintCategories.js 와 동일)
// 분야 번호(category_id)는 백엔드가 DB categories 테이블에서 이름으로 조회하므로 여기서는 이름만 사용
const CATEGORY_OPTIONS = [
  { category: '도로파손', department: '도로관리과' },
  { category: '불법주정차', department: '교통지도과' },
  { category: '쓰레기투기', department: '환경미화과' },
  { category: '소음', department: '생활민원과' },
  { category: '가로등고장', department: '시설관리과' },
  { category: '기타', department: '민원실' },
];

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none'
};

export default function AIPhoto() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addComplaint } = useComplaints();
  const fileInputRef = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [analyzeError, setAnalyzeError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);

  // 수정 가능한 필드
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');

  // 입력값 및 분석 결과 초기화
  const resetForm = () => {
    setAiResult(null);
    setAnalyzeError('');
    setCategory('');
    setDepartment('');
    setTitle('');
    setContent('');
    setLocation('');
  };

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
      resetForm();
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

  // Gemini AI 이미지 분석 요청 (백엔드 경유, API 키는 서버에서만 사용)
  const handleAnalyze = async () => {
    if (!uploadedImage) {
      alert('사진을 먼저 업로드해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError('');

    try {
      const res = await fetch(`${AI_API_URL}/ai/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: uploadedImage, mimeType: uploadedFile?.type })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.data) {
        throw new Error(body.message || 'AI 분석에 실패했습니다.');
      }

      const result = body.data;
      setAiResult(result);
      setCategory(result.category || '');
      setDepartment(result.department || '');
      setTitle(result.title || '');
      setContent(result.content || '');
      setLocation(result.locationHint || '');
    } catch (err) {
      setAnalyzeError(
        err instanceof TypeError
          ? 'AI 분석 서버에 연결할 수 없습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요.'
          : err.message
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 이미지 삭제
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    resetForm();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 처음부터 다시 작성
  const handleRestart = () => {
    handleRemoveImage();
    setSubmittedId(null);
  };

  // 민원 접수 (기존 민원 접수 API 재사용)
  const handleSubmit = async () => {
    // 로그인 체크 (헤더의 로그인 모달 사용 → 작성 내용 유지)
    if (!isAuthenticated) {
      alert('민원 접수는 로그인 후 가능합니다.\n화면 상단의 [로그인]을 눌러 로그인한 뒤 다시 접수해 주세요.\n(작성한 내용은 그대로 유지됩니다.)');
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
    if (!window.confirm(`아래 내용으로 민원을 접수하시겠습니까?\n\n분야: ${category}\n제목: ${title}\n위치: ${location}`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await addComplaint({
        title: title.trim(),
        content: content.trim(),
        location: location.trim(),
        category_name: category,
        // AI 원본 추천값 (최종 담당 부서는 민원 담당자가 확정)
        ai_category: aiResult?.category || null,
        ai_department: aiResult?.department || null,
        ai_reason: aiResult?.detectedIssue ? `사진 AI 분석: ${aiResult.detectedIssue}` : null
      });
      if (!data?.id) {
        throw new Error(data?.message || '민원 접수에 실패했습니다.');
      }
      setSubmittedId(data.id);
      window.scrollTo(0, 0);
    } catch (err) {
      alert(`${err.message}\n잠시 후 다시 시도해 주세요.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 접수 완료 화면
  if (submittedId) {
    return (
      <div className="inner-page">
        <div className="wrap">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>홈</span>
            <span className="sep">›</span>
            <span>AI 민원 자동 작성</span>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '56px 28px', textAlign: 'center', marginTop: '28px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1555a4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, margin: '0 auto 20px' }}>✓</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#172238', marginBottom: '10px' }}>민원이 정상적으로 접수되었습니다</div>
            <div style={{ fontSize: '14px', color: '#778090', lineHeight: 1.8, marginBottom: '24px' }}>
              접수번호 <strong style={{ color: '#1555a4' }}>{submittedId}</strong><br />
              담당 부서 검토 후 처리 결과를 안내해 드립니다.
            </div>
            <div style={{ display: 'inline-block', textAlign: 'left', background: '#f7f9fc', borderRadius: '8px', padding: '16px 22px', fontSize: '13px', color: '#374151', lineHeight: 1.9, marginBottom: '28px' }}>
              <div><strong>민원 분야</strong> · {category}</div>
              <div><strong>AI 추천 담당 부서</strong> · {department || '-'}</div>
              <div><strong>민원 제목</strong> · {title}</div>
              <div><strong>발생 위치</strong> · {location}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/result')} style={{ background: '#1555a4', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>내 민원 처리현황 보기</button>
              <button onClick={handleRestart} style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', padding: '13px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>새 민원 작성</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: aiResult ? '#1555a4' : '#e2e6ec', color: aiResult ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>3</div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: aiResult ? '#1555a4' : '#9ca3af' }}>내용 확인 및 접수</span>
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
                  <>🤖 {analyzeError ? 'AI 분석 다시 시도' : 'AI 분석 시작'}</>
                )}
              </button>
            )}

            {/* 분석 실패 안내 */}
            {analyzeError && !isAnalyzing && (
              <div style={{ marginTop: '12px', background: '#fdecec', borderRadius: '7px', padding: '12px 14px', fontSize: '12px', color: '#b42318', lineHeight: 1.6 }}>
                ⚠️ {analyzeError}
              </div>
            )}
          </div>

          {/* 오른쪽: AI 분석 결과 및 민원 작성 */}
          <div style={{ background: '#fff', border: '1px solid #e2e6ec', borderRadius: '10px', padding: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#172238', marginBottom: '8px' }}>
              2. AI 분석 결과
            </div>
            <p style={{ fontSize: '13px', color: '#778090', margin: '0 0 16px' }}>
              AI가 분석한 결과를 확인하고 수정할 수 있습니다.
            </p>

            {!aiResult && !isAnalyzing && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#b0b8c4', fontSize: '13px' }}>
                사진을 업로드하고 AI 분석을 시작해주세요.
              </div>
            )}

            {isAnalyzing && (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#778090', fontSize: '13px' }}>
                <span style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #1555a4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: '12px' }}></span>
                <div>AI가 사진 속 문제 상황을 분석하고 있습니다...</div>
              </div>
            )}

            {aiResult && (
              <div>
                {/* AI 감지 결과 */}
                <div style={{ background: '#f0f5ff', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#1555a4', fontWeight: 700, marginBottom: '4px' }}>AI 감지 결과</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#172238' }}>{aiResult.detectedIssue}</div>
                  {typeof aiResult.confidence === 'number' && (
                    <div style={{ fontSize: '12px', color: '#778090', marginTop: '4px' }}>
                      분석 신뢰도: {(aiResult.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>

                {/* 분석이 어렵거나 추가 정보가 필요한 경우 */}
                {(!aiResult.analyzable || aiResult.needMoreInfo) && (
                  <div style={{ background: '#fef3c7', borderRadius: '7px', padding: '12px 14px', fontSize: '12px', color: '#92400e', marginBottom: '16px', lineHeight: 1.6 }}>
                    ℹ️ {aiResult.needMoreInfo || '사진만으로 문제 상황을 정확히 판단하기 어렵습니다. 아래 내용을 직접 보완해 주세요.'}
                  </div>
                )}

                {/* 민원 분야 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#374151' }}>
                    민원 분야 <span style={{ color: '#e23b45' }}>*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">선택하세요</option>
                    {CATEGORY_OPTIONS.map(c => (
                      <option key={c.category} value={c.category}>{c.category}</option>
                    ))}
                  </select>
                </div>

                {/* 추천 담당 부서 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#374151' }}>
                    AI 추천 담당 부서
                  </label>
                  <input
                    type="text"
                    value={department || '-'}
                    readOnly
                    style={{ ...inputStyle, background: '#f7f9fc', color: '#374151' }}
                  />
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>AI 추천 부서는 접수 시 함께 전달되며, 최종 담당 부서는 민원 담당자가 검토 후 확정합니다.</div>
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
                    style={inputStyle}
                  />
                  {!aiResult.locationHint && (
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>사진만으로 위치를 확인할 수 없어 직접 입력이 필요합니다.</div>
                  )}
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
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: 'none',
                    borderRadius: '8px',
                    background: isSubmitting ? '#9ca3af' : '#172e5c',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? '접수 중...' : '민원 접수하기'}
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isSubmitting}
                  style={{
                    width: '100%',
                    marginTop: '8px',
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
                  AI 다시 분석하기
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
