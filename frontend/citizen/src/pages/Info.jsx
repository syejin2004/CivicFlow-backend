import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PANELS = [
  { id: 'guide',   label: '이용 가이드' },
  { id: 'member',  label: '회원안내' },
  { id: 'caution', label: '유의사항' },
  { id: 'contact', label: '문의하기' },
]

const STEPS = [
  { n: '01. 로그인',   h: '로그인',   p: '회원가입 후 로그인' },
  { n: '02. 민원신청', h: '민원신청', p: '민원 내용 작성 및 제출' },
  { n: '03. 진행조회', h: '진행조회', p: '처리상태 실시간 확인' },
  { n: '04. 처리완료', h: '처리완료', p: '결과 확인 및 안내' },
]

export default function Info() {
  const navigate = useNavigate()
  const [active, setActive] = useState('guide')

  return (
    <div className="inner-page">
      <div className="wrap">
        <div className="breadcrumb">
          <span onClick={() => navigate('/')}>홈</span>
          <span className="sep">›</span>
          <span>이용안내</span>
        </div>
        <h1 className="pg-title">이용안내</h1>
        <p className="pg-desc">CivicFlow 서비스 이용 방법과 유의사항을 확인하세요.</p>

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
            {active === 'guide' && (
              <>
                <div className="sp-title">이용 가이드</div>
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
                <div className="sp-notice">
                  <ul>
                    <li>처리 기간은 담당 부서의 검토에 따라 달라질 수 있습니다.</li>
                    <li>허위 신고 시 서비스 이용이 제한될 수 있습니다.</li>
                  </ul>
                </div>
              </>
            )}

            {active === 'member' && (
              <>
                <div className="sp-title">회원안내</div>
                <div className="member-grid">
                  <div className="member-card"><h4>회원 혜택</h4><ul><li>민원 접수 현황 실시간 조회</li><li>처리 단계별 알림 수신</li><li>민원 처리 이력 관리</li></ul></div>
                  <div className="member-card"><h4>계정 관리</h4><ul><li>아이디/비밀번호 변경</li><li>개인정보 수정</li><li>알림 설정 관리</li></ul></div>
                </div>
                <div className="sp-notice"><ul><li>비회원도 민원 접수는 가능하나, 처리 현황 조회 및 알림 수신은 회원만 이용 가능합니다.</li></ul></div>
              </>
            )}

            {active === 'caution' && (
              <>
                <div className="sp-title">유의사항</div>
                <div className="caution-box">
                  <h4>민원 접수 시 유의사항</h4>
                  <ul>
                    <li>허위 사실 또는 타인을 비방하는 내용은 접수가 제한될 수 있습니다.</li>
                    <li>동일한 내용의 반복 민원은 처리가 지연될 수 있습니다.</li>
                  </ul>
                </div>
                <div className="caution-box">
                  <h4>처리 기간 안내</h4>
                  <ul>
                    <li>일반 민원: 접수 후 7일 이내 처리</li>
                    <li>복잡 민원: 접수 후 14일 이내 처리</li>
                    <li>공휴일·주말은 처리 기간에서 제외됩니다.</li>
                  </ul>
                </div>
              </>
            )}

            {active === 'contact' && (
              <>
                <div className="sp-title">문의하기</div>
                <div className="contact-grid">
                  <div className="contact-card"><h4>전화 문의</h4><p>02-1234-5678<br />평일 09:00~18:00</p></div>
                  <div className="contact-card"><h4>이메일 문의</h4><p>help@civicflow.kr<br />24시간 접수 가능</p></div>
                  <div className="contact-card"><h4>채팅 문의</h4><p>홈페이지 채팅 상담<br />평일 09:00~17:00</p></div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
