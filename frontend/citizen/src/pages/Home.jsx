import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user?.role === 'staff') navigate('/staff');
    else if (user?.role === 'manager') navigate('/manager');
  }, [user]);

  useEffect(() => {
    if (location.state?.openLogin) {
      setShowLogin(true);
    }
  }, [location]);

  return (
    <main>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <section className="hero">
          <div className="wrap hero-inner">
            <div className="hero-copy">
              <h1>일상의 불편,<br />CivicFlow로 전달하세요.</h1>
              <p>시민의 의견을 AI로 분석하고 담당 부서의 처리를 지원합니다.</p>
            </div>
            <div className="quick">
              <div onClick={() => navigate('/apply')}>
                <div className="quick-text">
                  <strong>빠른 민원신청</strong>
                  <small>간편하게 민원을 신청하세요.</small>
                </div>
                <span className="quick-arrow">›</span>
              </div>
              <div onClick={() => navigate('/report')}>
                <div className="quick-text">
                  <strong>생활불편 신고</strong>
                  <small>도로·시설 등 불편사항을 신고하세요.</small>
                </div>
                <span className="quick-arrow">›</span>
              </div>
            </div>
          </div>
        </section>

      <section className="section">
        <div className="wrap">
          <div className="categories">
            <div className="section-heading">
              <h2>생활민원 분야</h2>
              <p>원하시는 분야를 선택하시면<br />관련 서비스를 빠르게 찾을 수 있습니다.</p>
            </div>
            {['교통·도로', '환경·청소', '시설·안전', '주거·도시', '복지·건강', '기타 생활민원'].map(c => (
              <div key={c} className="category" onClick={() => navigate('/apply')}>{c}</div>
            ))}
          </div>

          <div className="panels">
            <div className="panel">
              <h3>공지사항</h3>
              {[['CivicFlow 서비스 이용 안내', '11.10'], ['AI 민원 분류 기능 안내', '11.07'], ['민원 처리 단계 안내', '11.03']].map(([t, d]) => (
                <div key={t} className="line" style={{ cursor: 'pointer' }} onClick={() => navigate('/info')}>
                  <span>{t}</span><span>{d}</span>
                </div>
              ))}
            </div>
            <div className="panel">
              <h3>자주 찾는 서비스</h3>
              <div className="line" style={{ cursor: 'pointer' }} onClick={() => navigate('/result')}><span>내 민원처리 진행상황 조회</span><span>›</span></div>
              <div className="line" style={{ cursor: 'pointer' }} onClick={() => navigate('/apply')}><span>민원 접수 안내</span><span>›</span></div>
              <div className="line" style={{ cursor: 'pointer' }} onClick={() => navigate('/info')}><span>이용 안내 및 자주 묻는 질문</span><span>›</span></div>
            </div>
            <div className="panel panel-ai">
              <h3>AI 민원 자동 작성 서비스</h3>
              <p>사진 한 장으로 민원 작성부터 신청까지!<br />AI가 사진을 분석해 민원 제목과 내용을 자동으로 작성해 드립니다.</p>
              <span className="round" onClick={() => navigate('/ai-photo')}>AI 민원 작성하기</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section muted">
        <div className="wrap">
          <div className="title-row">
            <div>
              <span className="eyebrow">SMART CIVIL SERVICE</span>
              <h2>더 편리해진 민원 서비스</h2>
              <p>민원 접수부터 처리 현황까지, 필요한 정보를 한곳에서 확인하세요.</p>
            </div>
          </div>
          <div className="feature-grid">
            <article className="feature"><span className="number">01 / 민원 접수</span><h3>복잡한 절차 없이<br />간편하게 신청</h3><p>생활 속 불편사항을 분야에 맞게 접수하고 관련 내용을 한눈에 확인할 수 있습니다.</p></article>
            <article className="feature"><span className="number">02 / 처리 현황</span><h3>내 민원 진행상황</h3><p>접수부터 담당 부서 배정, 처리 완료까지 진행 단계를 쉽게 확인합니다.</p></article>
            <article className="feature"><span className="number">03 / AI 지원</span><h3>더 빠른 민원 분석</h3><p>민원 내용과 사진을 분석해 유형 분류 및 담당자 답변 작성을 지원합니다.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="title-row">
            <div>
              <span className="eyebrow">HOW IT WORKS</span>
              <h2>민원 처리 절차 안내</h2>
              <p>신청한 민원이 어떤 과정으로 처리되는지 확인해 보세요.</p>
            </div>
          </div>
          <div className="steps">
            {[['01', '민원 작성', '불편사항과 발생 위치, 필요한 내용을 작성합니다.'],
              ['02', '접수 및 분류', 'AI가 신고 내용을 분석해 민원 유형 분류를 지원합니다.'],
              ['03', '담당 부서 처리', '담당 부서에 배정된 민원을 담당자가 검토하고 처리합니다.'],
              ['04', '처리 결과 안내', '민원 처리 결과와 답변을 확인할 수 있습니다.']].map(([n, t, p]) => (
              <div key={n} className="step">
                <div className="circle">{n}</div>
                <h3>{t}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap faq-wrap">
          <div className="section-heading">
            <span className="eyebrow">HELP CENTER</span>
            <h2>자주 묻는 질문</h2>
            <p>서비스 이용 시 궁금한 내용을<br />확인할 수 있습니다.</p>
          </div>
          <div>
            {['민원은 어떻게 신청하나요?', '신청한 민원의 처리 상태는 어디서 확인하나요?', '접수한 민원의 내용을 수정할 수 있나요?', '민원 처리 결과는 어떻게 안내되나요?'].map(q => (
              <div key={q} className="line" style={{ cursor: 'pointer' }} onClick={() => navigate('/info')}>
                <span>{q}</span><span>+</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="bottom-banner">
            <div>
              <h2>생활 속 불편함, 이제 편리하게 전달하세요.</h2>
              <p>민원 신청부터 처리 결과 확인까지 이어지는 통합 서비스</p>
            </div>
            <span className="pill" onClick={() => navigate('/apply')}>민원 서비스 둘러보기 →</span>
          </div>
        </div>
      </section>
    </main>
  );
}