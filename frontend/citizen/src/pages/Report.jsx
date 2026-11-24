import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Report() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const selectReportType = (e) => {
    document.querySelectorAll('.report-type-btn').forEach(btn => btn.classList.remove('selected'));
    e.currentTarget.classList.add('selected');
  };

  // 로그인하지 않은 경우 로그인 안내 화면
  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#172238', letterSpacing: '-.5px' }}>로그인이 필요한 서비스입니다</div>
        <div style={{ fontSize: '14px', color: '#778090', lineHeight: 1.8 }}>생활불편 신고는 회원만 이용할 수 있습니다.<br />로그인 후 이용해 주세요.</div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={() => navigate('/', { state: { openLogin: true } })} style={{ background: '#1555a4', color: '#fff', border: 'none', padding: '13px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>로그인</button>
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer', marginTop: '4px', fontFamily: 'inherit' }}>← 홈으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="inner-page">
      <div className="wrap">
        <div className="breadcrumb">
          <span onClick={() => navigate('/')}>홈</span>
          <span className="sep">›</span>
          <span>생활불편 신고</span>
        </div>
        <h1 className="pg-title">생활불편 신고</h1>
        <p className="pg-desc">도로, 시설, 안전 등 일상 속 불편사항을 간편하게 신고할 수 있습니다.</p>

        <div className="report-type-grid" style={{ marginTop: '28px' }}>
          <div className="report-type-btn selected" onClick={selectReportType}>
            <span className="rt-name">도로·교통</span>
            <span className="rt-sub">도로, 신호, 주정차 등</span>
          </div>
          <div className="report-type-btn" onClick={selectReportType}>
            <span className="rt-name">시설물</span>
            <span className="rt-sub">가로수, 벤치 등</span>
          </div>
          <div className="report-type-btn" onClick={selectReportType}>
            <span className="rt-name">환경·청소</span>
            <span className="rt-sub">쓰레기, 무단투기 등</span>
          </div>
          <div className="report-type-btn" onClick={selectReportType}>
            <span className="rt-name">안전·재난</span>
            <span className="rt-sub">위험요소, 시설 파손 등</span>
          </div>
          <div className="report-type-btn" onClick={selectReportType}>
            <span className="rt-name">기타</span>
            <span className="rt-sub">그 외 불편사항</span>
          </div>
        </div>

        <div className="cf-form-wrap">
          <div className="cf-form-section">
            <div className="cf-form-section-title">신고 내용</div>
            <div className="cf-form-row">
              <div className="cf-form-group">
                <label>신고 제목 <span className="req">*</span></label>
                <input type="text" placeholder="신고 내용을 간단히 입력하세요." />
              </div>
            </div>
            <div className="cf-form-row">
              <div className="cf-form-group">
                <label>신고 내용 <span className="req">*</span></label>
                <textarea placeholder="상세 내용을 입력해 주세요."></textarea>
              </div>
            </div>
            <div className="cf-form-row">
              <div className="cf-form-group">
                <label>발생 위치 <span className="req">*</span></label>
                <input type="text" placeholder="예) 서울시 강남구 테헤란로 123 앞" />
              </div>
            </div>
          </div>

          <div className="cf-form-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>사진 첨부</span>
              <div className="cf-upload-row" style={{ padding: 0 }}>
                <button className="cf-upload-btn">사진 첨부</button>
                <span className="cf-upload-hint">최대 5개, 현장 사진을 첨부하면 더 빠른 처리가 가능합니다.</span>
              </div>
            </div>
          </div>

          <div className="cf-form-actions">
            <button className="cf-btn-secondary" onClick={() => navigate('/')}>취소</button>
            <button className="cf-btn-primary">신고 접수하기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
