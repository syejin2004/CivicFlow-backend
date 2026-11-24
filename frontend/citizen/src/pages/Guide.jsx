import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PANELS = [
  { id: 'intro',   label: '서비스 소개' },
  { id: 'feat',    label: '주요 기능' },
  { id: 'process', label: '이용 절차' },
  { id: 'faq',     label: 'FAQ' },
]

const STEPS = [
  { n: '01. 로그인',   h: '로그인',   p: '회원가입 후 로그인' },
  { n: '02. 민원신청', h: '민원신청', p: '민원 내용 작성 및 제출' },
  { n: '03. 진행조회', h: '진행조회', p: '처리상태 실시간 확인' },
  { n: '04. 처리완료', h: '처리완료', p: '결과 확인 및 안내' },
]

const FEATURES = [
  { h: '간편한 민원 접수', p: '온라인으로 쉽게 신청' },
  { h: 'AI 자동 분류',    p: '민원 내용을 분석해 부서 분류' },
  { h: '신속한 처리 지원', p: '담당 부서 연계 및 진행 관리' },
  { h: '처리 결과 알림',  p: '처리 단계별 알림 발송' },
]

export default function Guide() {
  const navigate = useNavigate()
  const [active, setActive] = useState('intro')

  return (
    <div className="inner-page">
      <div className="wrap">
        <div className="breadcrumb">
          <span onClick={() => navigate('/')}>홈</span>
          <span className="sep">›</span>
          <span>서비스 안내</span>
        </div>
        <h1 className="pg-title">서비스 안내</h1>
        <p className="pg-desc">CivicFlow에서 제공하는 주요 서비스를 소개합니다.</p>

        <div className="sp-layout">
          <div className="sp-sidebar">
            {PANELS.map(p => (
              <div
                key={p.id}
                className={`sp-item${active === p.id ? ' active' : ''}`}
                onClick={() => setActive(p.id)}
              >
                {p.label}
              </div>
            ))}
          </div>

          <div className="sp-content">
            {active === 'intro' && (
              <>
                <div className="sp-title">CivicFlow 서비스 소개</div>
                <p className="sp-desc">CivicFlow는 시민의 민원과 생활불편 신고를 쉽고 빠르게 접수하고, AI 기반 자동 분류를 통해 담당 부서의 신속한 처리를 지원하는 공공 민원 서비스입니다.</p>
                <div className="sp-feat-grid">
                  {FEATURES.map(f => (
                    <div key={f.h} className="sp-feat"><h4>{f.h}</h4><p>{f.p}</p></div>
                  ))}
                </div>
              </>
            )}

            {active === 'feat' && (
              <>
                <div className="sp-title">주요 기능</div>
                <div className="sp-feat-grid">
                  <div className="sp-feat"><h4>민원 접수</h4><p>생활 속 불편사항을 분야별로 접수하고 담당 부서에 자동 전달됩니다.</p></div>
                  <div className="sp-feat"><h4>처리 현황 조회</h4><p>접수된 민원의 처리 단계를 실시간으로 확인할 수 있습니다.</p></div>
                  <div className="sp-feat"><h4>AI 분류 지원</h4><p>신고 내용과 사진을 AI가 분석해 담당 부서를 자동 배정합니다.</p></div>
                  <div className="sp-feat"><h4>처리 결과 알림</h4><p>민원 처리 단계별 변경 시 등록된 연락처로 알림을 발송합니다.</p></div>
                </div>
              </>
            )}

            {active === 'process' && (
              <>
                <div className="sp-title">이용 절차</div>
                <div className="sp-step-row">
                  {STEPS.map((s, i) => (
                    <div key={s.n} className="sp-step">
                      <div className="ssn">{s.n}</div>
                      <h4>{s.h}</h4>
                      <p>{s.p}</p>
                      {i < STEPS.length - 1 && <div className="ssa">›</div>}
                    </div>
                  ))}
                </div>
                <div className="sp-notice"><ul><li>처리 기간은 담당 부서의 검토에 따라 달라질 수 있습니다.</li></ul></div>
              </>
            )}

            {active === 'faq' && (
              <>
                <div className="sp-title">자주 묻는 질문</div>
                <div className="faq-list">
                  {[
                    ['민원은 어떻게 신청하나요?', "상단 메뉴의 '민원신청'을 클릭하여 제목·내용을 입력하고 제출하면 접수가 완료됩니다."],
                    ['처리 현황은 어디서 확인하나요?', "'민원결과조회' 메뉴에서 신청일 범위 또는 민원 제목으로 검색하여 확인할 수 있습니다."],
                    ['AI 분류는 어떻게 작동하나요?', '입력하신 민원 내용과 첨부 사진을 AI가 분석하여 적합한 담당 부서를 자동으로 배정합니다.'],
                  ].map(([q, a]) => (
                    <details key={q} className="faq-item">
                      <summary>{q}</summary>
                      <div className="faq-answer">{a}</div>
                    </details>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
