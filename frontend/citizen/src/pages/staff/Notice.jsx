import { useState } from 'react'
import StaffModal from '../../components/staff/StaffModal'

const INIT = [
  { num:5, tag:'sys',  tagLabel:'시스템',   title:'CivicFlow 서비스 이용 안내',         date:'2026.11.10', author:'관리자', views:142, content:'CivicFlow 서비스 이용에 관한 안내입니다. 민원 신청 및 처리 현황 조회 등 주요 기능을 소개합니다.' },
  { num:4, tag:'upd',  tagLabel:'업데이트', title:'AI 민원 분류 기능 업데이트 안내',     date:'2026.11.07', author:'관리자', views:98,  content:'AI 민원 자동 분류 정확도가 향상되었습니다. 이미지 분석 기능이 추가되어 첨부 사진을 통한 민원 분류가 가능합니다.' },
  { num:3, tag:'info', tagLabel:'안내',     title:'민원 처리 단계 세분화 안내',          date:'2026.11.03', author:'관리자', views:76,  content:'민원 처리 단계가 접수대기 → 검토중 → 처리중 → 처리완료로 세분화되었습니다.' },
  { num:2, tag:'sys',  tagLabel:'시스템',   title:'개인정보 처리방침 개정 안내',         date:'2026.10.25', author:'관리자', views:54,  content:'개인정보 처리방침이 개정되었습니다. 주요 변경사항을 확인해 주시기 바랍니다.' },
  { num:1, tag:'sys',  tagLabel:'시스템',   title:'시스템 점검 안내 (11/15 02:00~04:00)', date:'2026.10.20', author:'관리자', views:213, content:'정기 시스템 점검이 11월 15일 오전 2시~4시에 진행됩니다. 해당 시간에는 서비스 이용이 불가합니다.' },
]
const TAG_MAP = { sys:'시스템', upd:'업데이트', info:'안내' }

export default function Notice({ showToast }) {
  const [data, setData]       = useState(INIT)
  const [modal, setModal]     = useState(null)   // null | 'write' | 'view'
  const [selected, setSelected] = useState(null)
  const [form, setForm]       = useState({ tag:'sys', title:'', content:'', author:'', date:'' })

  const close = () => setModal(null)

  const openView = (item) => { setSelected(item); setModal('view') }
  const openWrite = () => {
    const today = new Date().toISOString().split('T')[0]
    setForm({ tag:'sys', title:'', content:'', author:'김민지', date:today })
    setModal('write')
  }

  const save = () => {
    if (!form.title || !form.content) { showToast('제목과 내용을 입력해 주세요.'); return }
    if (!form.author) { showToast('작성자를 입력해 주세요.'); return }
    if (!form.date) { showToast('작성일을 선택해 주세요.'); return }

    const formattedDate = form.date.replace(/-/g, '.').replace(/^(\d{4})\./, '$1.')
    const newItem = {
      num: data.length+1,
      tag:form.tag,
      tagLabel:TAG_MAP[form.tag],
      title:form.title,
      date:formattedDate,
      author:form.author,
      views:0,
      content:form.content
    }
    setData(d => [newItem, ...d])
    showToast('공지가 등록되었습니다.')
    close()
  }

  return (
    <div className="s-page active">
      <div className="s-toolbar">
        <div>
          <div style={{fontSize:20,fontWeight:800,letterSpacing:'-.5px',marginBottom:4}}>공지사항</div>
          <div style={{fontSize:13,color:'#778090'}}>시스템 운영 및 업무 관련 공지사항입니다.</div>
        </div>
        <button className="s-add-btn" onClick={openWrite}>+ 공지 작성</button>
      </div>

      <div className="s-tbl-wrap">
        <table className="s-notice-tbl">
          <thead>
            <tr><th style={{width:56}}>번호</th><th>제목</th><th style={{width:120}}>작성일</th><th style={{width:70}}>작성자</th><th style={{width:60}}>조회</th></tr>
          </thead>
          <tbody>
            {data.map(r => (
              <tr key={r.num} style={{cursor:'pointer'}} onClick={() => openView(r)}>
                <td className="tnum">{r.num}</td>
                <td><span className={`ntag ${r.tag}`}>{r.tagLabel}</span>{r.title}</td>
                <td>{r.date}</td>
                <td>{r.author}</td>
                <td>{r.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 공지 보기 */}
      {modal==='view' && selected && (
        <StaffModal title="공지사항 상세" onClose={close} footer={<button className="sf-btn-cancel" onClick={close}>닫기</button>}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
            <span className={`ntag ${selected.tag}`}>{selected.tagLabel}</span>
            <span style={{fontSize:16,fontWeight:800}}>{selected.title}</span>
          </div>
          <div style={{fontSize:12,color:'#9ca3af',marginBottom:16}}>{selected.date} · {selected.author}</div>
          <div style={{fontSize:14,color:'#374151',lineHeight:1.9,padding:'16px',background:'#f7f8fa',borderRadius:8}}>{selected.content}</div>
        </StaffModal>
      )}

      {/* 공지 작성 */}
      {modal==='write' && (
        <StaffModal
          title="공지 작성"
          onClose={close}
          footer={<><button className="sf-btn-cancel" onClick={close}>취소</button><button className="sf-btn-ok" onClick={save}>등록</button></>}
        >
          <div className="sf-fg">
            <label>태그</label>
            <select value={form.tag} onChange={e => setForm(f => ({...f,tag:e.target.value}))}>
              <option value="sys">시스템</option><option value="upd">업데이트</option><option value="info">안내</option>
            </select>
          </div>
          <div className="sf-fg">
            <label>작성자 <span className="req">*</span></label>
            <input type="text" value={form.author} onChange={e => setForm(f => ({...f,author:e.target.value}))} placeholder="작성자 이름을 입력하세요"/>
          </div>
          <div className="sf-fg">
            <label>작성일 <span className="req">*</span></label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({...f,date:e.target.value}))} />
          </div>
          <div className="sf-fg">
            <label>제목 <span className="req">*</span></label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))} placeholder="공지 제목을 입력하세요"/>
          </div>
          <div className="sf-fg">
            <label>내용 <span className="req">*</span></label>
            <textarea value={form.content} onChange={e => setForm(f => ({...f,content:e.target.value}))} placeholder="공지 내용을 입력하세요"/>
          </div>
        </StaffModal>
      )}
    </div>
  )
}
