import { useState, useRef, useEffect } from 'react'
import StaffModal from '../../components/staff/StaffModal'

const MEMBERS = {
  'ch-general':  [{ av:'박', name:'박서연', color:'#f59e0b' },{ av:'이', name:'이지은', color:'#22c55e' },{ av:'최', name:'최재호', color:'#8b5cf6' }],
  'ch-road':     [{ av:'이', name:'이지은', color:'#22c55e' },{ av:'최', name:'최재호', color:'#8b5cf6' }],
  'ch-facility': [{ av:'박', name:'박서연', color:'#f59e0b' }],
  'ch-env':      [{ av:'최', name:'최재호', color:'#8b5cf6' }],
  'dm-lee':      [{ av:'이', name:'이지은', color:'#22c55e' }],
  'dm-park':     [{ av:'박', name:'박서연', color:'#f59e0b' }],
  'dm-choi':     [{ av:'최', name:'최재호', color:'#8b5cf6' }],
}

const AUTO_REPLIES = {
  'ch-general': ['확인했습니다!','네, 알겠습니다.','처리하겠습니다.','담당자에게 전달했습니다.','현장 확인 후 보고드리겠습니다.'],
  'ch-road':    ['도로 현장 사진 첨부할게요.','포트홀 보수 작업 오늘 중 완료 예정입니다.','교통 통제 필요할 것 같습니다.'],
  'ch-facility':['시설물 점검 완료했습니다.','가로등 교체 완료했습니다.','벤치 수리 작업 진행 중입니다.'],
  'ch-env':     ['불법 투기 현장 사진 첨부합니다.','청소 작업 완료했습니다.'],
  'dm-lee':     ['네, 확인했습니다.','방금 처리했어요.','오늘 현장 나갑니다.','사진 첨부해서 보낼게요.'],
  'dm-park':    ['네, 알겠습니다!','확인 후 답변드릴게요.','오늘 오후에 처리할게요.'],
  'dm-choi':    ['네.','확인했습니다.','잠시만요.','처리할게요.'],
}

const INIT_MSGS = {
  'ch-general': [
    { who:'other', av:'박', name:'박서연', color:'#f59e0b', text:'오늘 도로 포트홀 민원 접수 건 확인했나요?', time:'오전 9:12' },
    { who:'other', av:'이', name:'이지은', color:'#22c55e', text:'네, 2026-0012 접수됐습니다. 오늘 현장 확인 예정입니다.', time:'오전 9:15' },
    { who:'me',    av:'김', name:'김민지', color:'#4a9eff', text:'처리 기한 11/23까지니까 이번 주 안에 처리 부탁드립니다.', time:'오전 9:18' },
    { who:'other', av:'박', name:'박서연', color:'#f59e0b', text:'알겠습니다. 오늘 오후에 처리 완료하겠습니다.', time:'오전 9:20' },
  ],
  'ch-road': [
    { who:'other', av:'이', name:'이지은', color:'#22c55e', text:'이번 주 접수된 도로 관련 민원 총 5건입니다.', time:'오전 10:00' },
    { who:'me',    av:'김', name:'김민지', color:'#4a9eff', text:'우선순위 순으로 처리해 주세요.', time:'오전 10:03' },
    { who:'other', av:'이', name:'이지은', color:'#22c55e', text:'네, 긴급 건부터 처리하겠습니다.', time:'오전 10:05' },
  ],
  'ch-facility': [
    { who:'other', av:'박', name:'박서연', color:'#f59e0b', text:'가로등 고장 건은 오늘 오후 처리 완료할 예정입니다.', time:'오후 1:30' },
    { who:'me',    av:'김', name:'김민지', color:'#4a9eff', text:'수고해요. 완료 후 보고 부탁드립니다.', time:'오후 1:32' },
  ],
  'ch-env': [],
  'dm-lee': [
    { who:'other', av:'이', name:'이지은', color:'#22c55e', text:'담당 구역 현장 확인 완료했습니다.', time:'오전 11:20' },
    { who:'me',    av:'김', name:'김민지', color:'#4a9eff', text:'수고하셨습니다. 사진도 첨부해 주세요.', time:'오전 11:22' },
    { who:'other', av:'이', name:'이지은', color:'#22c55e', text:'네, 지금 바로 보낼게요!', time:'오전 11:23' },
  ],
  'dm-park': [
    { who:'other', av:'박', name:'박서연', color:'#f59e0b', text:'내일 오전 회의 참석 가능하신가요?', time:'오후 2:10' },
    { who:'me',    av:'김', name:'김민지', color:'#4a9eff', text:'네, 10시 가능합니다.', time:'오후 2:13' },
    { who:'other', av:'박', name:'박서연', color:'#f59e0b', text:'좋아요! 회의실 예약해 두겠습니다.', time:'오후 2:14' },
  ],
  'dm-choi': [],
}

const CHANNELS  = [
  { id:'ch-general',  label:'# 전체공지' },
  { id:'ch-road',     label:'# 도로교통팀' },
  { id:'ch-facility', label:'# 시설물팀' },
  { id:'ch-env',      label:'# 환경청소팀' },
]
const DMS = [
  { id:'dm-lee',  label:'이지은',  online:true,  color:'#22c55e' },
  { id:'dm-park', label:'박서연',  online:true,  color:'#f59e0b' },
  { id:'dm-choi', label:'최재호',  online:false, color:'#8b5cf6' },
]

function getTimeStr() {
  const now = new Date()
  const h = now.getHours(), m = now.getMinutes().toString().padStart(2,'0')
  return (h >= 12 ? `오후 ${h===12?12:h-12}` : `오전 ${h}`) + ':' + m
}

function MsgBubble({ msg, onNameClick }) {
  const isMe = msg.who === 'me'
  if (msg.typing) {
    return (
      <div className="chat-msg">
        <div className="chat-av" style={{ background: msg.color+'33', color: msg.color }}>{msg.av}</div>
        <div className="chat-bubble-wrap">
          <div className="chat-name" onClick={() => onNameClick(msg)} style={{ cursor: 'pointer' }}>{msg.name}</div>
          <div className="chat-bubble other">
            <span className="typing-dots"><span/><span/><span/></span>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className={`chat-msg${isMe ? ' me' : ''}`}>
      <div className="chat-av" style={{ background: msg.color+'33', color: msg.color }}>{msg.av}</div>
      <div className="chat-bubble-wrap">
        <div className="chat-name" onClick={() => onNameClick(msg)} style={{ cursor: 'pointer' }}>{msg.name}</div>
        <div className={`chat-bubble ${isMe ? 'me' : 'other'}`}>{msg.text}</div>
        <div className="chat-time">
          {msg.time}
          {isMe && <span style={{ fontSize:10, color:'#93c5fd', marginLeft:3 }}> ✓✓</span>}
        </div>
      </div>
    </div>
  )
}

export default function Chat() {
  const [room, setRoom]       = useState('ch-general')
  const [msgs, setMsgs]       = useState({ ...INIT_MSGS })
  const [input, setInput]     = useState('')
  const [profileModal, setProfileModal] = useState(null)
  const [addMemberModal, setAddMemberModal] = useState(false)
  const [createRoomModal, setCreateRoomModal] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [customChannels, setCustomChannels] = useState([])
  const bottomRef             = useRef(null)
  const timerRef              = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs, room])

  const allMembers = [
    { id: 'lee', av:'이', name:'이지은', color:'#22c55e' },
    { id: 'park', av:'박', name:'박서연', color:'#f59e0b' },
    { id: 'choi', av:'최', name:'최재호', color:'#8b5cf6' },
  ];

  const handleNameClick = (msg) => {
    setProfileModal(msg)
  }

  const handleAddMember = () => {
    if (!searchName && !searchEmail) {
      alert('이름 또는 이메일을 입력해주세요.')
      return
    }
    alert(`검색: 이름="${searchName}", 이메일="${searchEmail}"\n(실제 구현 시 백엔드 연동 필요)`)
    setSearchName('')
    setSearchEmail('')
    setAddMemberModal(false)
  }

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      alert('채팅방 이름을 입력해주세요.')
      return
    }
    if (selectedMembers.length === 0) {
      alert('최소 1명의 멤버를 선택해주세요.')
      return
    }

    const roomId = 'custom-' + Date.now()
    const newRoom = {
      id: roomId,
      label: '# ' + newRoomName,
      members: selectedMembers
    }

    setCustomChannels(prev => [...prev, newRoom])
    setMsgs(prev => ({ ...prev, [roomId]: [] }))

    alert(`"${newRoomName}" 채팅방이 생성되었습니다!`)
    setNewRoomName('')
    setSelectedMembers([])
    setCreateRoomModal(false)
    setRoom(roomId)
  }

  const send = () => {
    const text = input.trim()
    if (!text) return
    const mine = { who:'me', av:'김', name:'김민지', color:'#4a9eff', text, time:getTimeStr() }
    setMsgs(prev => ({ ...prev, [room]: [...(prev[room]||[]), mine] }))
    setInput('')

    const members = MEMBERS[room] || []
    if (!members.length) return
    const responder = members[Math.floor(Math.random() * members.length)]
    const replies   = AUTO_REPLIES[room] || ['확인했습니다.']
    const replyText = replies[Math.floor(Math.random() * replies.length)]

    // 타이핑 인디케이터
    setTimeout(() => {
      const typingMsg = { who:'other', av:responder.av, name:responder.name, color:responder.color, typing:true, id:'typing' }
      setMsgs(prev => ({ ...prev, [room]: [...(prev[room]||[]), typingMsg] }))
      // 실제 답장
      const delay = 1000 + replyText.length * 30 + Math.random() * 400
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const reply = { who:'other', av:responder.av, name:responder.name, color:responder.color, text:replyText, time:getTimeStr() }
        setMsgs(prev => {
          const list = (prev[room]||[]).filter(m => m.id !== 'typing')
          return { ...prev, [room]: [...list, reply] }
        })
      }, delay)
    }, 700 + Math.random() * 600)
  }

  const currentMsgs = msgs[room] || []
  const roomName = [...CHANNELS,...DMS].find(r => r.id===room)?.label || room

  return (
    <div className="s-page active">
      <div style={{ fontSize:20, fontWeight:800, letterSpacing:'-.5px', marginBottom:4 }}>팀 채팅</div>
      <div style={{ fontSize:13, color:'#778090', marginBottom:20 }}>팀원들과 실시간으로 소통하세요.</div>

      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:16, height:'calc(100vh - 200px)', minHeight:500 }}>
        {/* 채널/DM 목록 */}
        <div className="s-card" style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'14px 16px', fontSize:12, fontWeight:800, color:'#778090', borderBottom:'1px solid #f0f2f5', letterSpacing:'.5px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span>채널</span>
            <button
              onClick={() => setAddMemberModal(true)}
              style={{ background:'#1555a4', color:'#fff', border:'none', borderRadius:'4px', padding:'4px 8px', fontSize:'11px', fontWeight:700, cursor:'pointer' }}
            >
              + 사람 추가
            </button>
          </div>
          {CHANNELS.map(ch => (
            <div key={ch.id} className={`chat-ch-item${room===ch.id?' active':''}`} onClick={() => setRoom(ch.id)}>
              <span style={{ color:'#9ca3af' }}>#</span> {ch.label.replace('# ','')}
            </div>
          ))}
          <div style={{ padding:'14px 16px', fontSize:12, fontWeight:800, color:'#778090', borderBottom:'1px solid #f0f2f5', letterSpacing:'.5px', marginTop:8 }}>다이렉트 메시지</div>
          {DMS.map(dm => (
            <div key={dm.id} className={`chat-ch-item${room===dm.id?' active':''}`} onClick={() => setRoom(dm.id)}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: dm.online ? '#22c55e' : '#9ca3af', flexShrink:0 }}/>
              {dm.label}
            </div>
          ))}
        </div>

        {/* 채팅창 */}
        <div className="s-card" style={{ padding:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid #f0f2f5', fontSize:14, fontWeight:800, color:'#172238' }}>{roomName}</div>
          <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>
            {currentMsgs.length === 0
              ? <div style={{ textAlign:'center', color:'#9ca3af', fontSize:13, marginTop:40 }}>아직 메시지가 없습니다.<br/><span style={{fontSize:12}}>첫 메시지를 보내보세요.</span></div>
              : (
                <>
                  <div className="chat-date-divider">2026년 11월 16일</div>
                  {currentMsgs.map((m,i) => <MsgBubble key={i} msg={m} onNameClick={handleNameClick} />)}
                </>
              )
            }
            <div ref={bottomRef}/>
          </div>
          <div style={{ padding:'12px 16px', borderTop:'1px solid #f0f2f5', display:'flex', gap:8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && send()}
              placeholder="메시지를 입력하세요..."
              style={{ flex:1, padding:'9px 14px', border:'1px solid #d1d5db', borderRadius:8, fontSize:13, fontFamily:'inherit', outline:'none', color:'#374151' }}
            />
            <button
              onClick={send}
              style={{ background:'#1555a4', color:'#fff', border:'none', padding:'9px 18px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}
            >
              전송
            </button>
          </div>
        </div>
      </div>

      {/* 프로필 모달 */}
      {profileModal && (
        <StaffModal title="프로필" onClose={() => setProfileModal(null)} footer={null}>
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div
              style={{
                width:80,
                height:80,
                borderRadius:'50%',
                background: profileModal.color+'33',
                color: profileModal.color,
                fontSize:32,
                fontWeight:800,
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                margin:'0 auto 16px'
              }}
            >
              {profileModal.av}
            </div>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:8, color:'#172238' }}>{profileModal.name}</div>
            <div style={{ fontSize:13, color:'#778090', marginBottom:20 }}>
              {profileModal.name === '김민지' ? '도로관리과 (인천시청)' : '도로관리과'}
            </div>
            <div style={{ background:'#f7f8fa', borderRadius:'8px', padding:'16px', textAlign:'left', marginTop:20 }}>
              <div style={{ fontSize:12, fontWeight:700, marginBottom:8, color:'#778090' }}>연락처 정보</div>
              <div style={{ fontSize:13, marginBottom:4 }}>📧 {profileModal.name.replace(/.$/, '')}@incheon.go.kr</div>
              <div style={{ fontSize:13 }}>📞 032-123-4567</div>
            </div>
          </div>
        </StaffModal>
      )}

      {/* 사람 추가 모달 */}
      {addMemberModal && (
        <StaffModal
          title="사람 추가"
          onClose={() => setAddMemberModal(false)}
          footer={
            <>
              <button className="sf-btn-cancel" onClick={() => setAddMemberModal(false)}>취소</button>
              <button className="sf-btn-ok" onClick={handleAddMember}>추가</button>
            </>
          }
        >
          <div style={{ padding:'8px 0' }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:700, display:'block', marginBottom:8 }}>이름</label>
              <input
                type="text"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                placeholder="이름을 입력하세요"
                style={{
                  width:'100%',
                  padding:'10px 14px',
                  border:'1px solid #d1d5db',
                  borderRadius:'6px',
                  fontSize:14,
                  fontFamily:'inherit'
                }}
              />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:700, display:'block', marginBottom:8 }}>이메일</label>
              <input
                type="email"
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                style={{
                  width:'100%',
                  padding:'10px 14px',
                  border:'1px solid #d1d5db',
                  borderRadius:'6px',
                  fontSize:14,
                  fontFamily:'inherit'
                }}
              />
            </div>
            <div style={{ fontSize:12, color:'#778090', background:'#f7f8fa', padding:'10px', borderRadius:'6px' }}>
              💡 이름 또는 이메일 중 하나만 입력해도 검색할 수 있습니다.
            </div>
          </div>
        </StaffModal>
      )}
    </div>
  )
}
