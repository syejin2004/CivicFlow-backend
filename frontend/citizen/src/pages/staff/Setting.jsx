import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StaffModal from '../../components/staff/StaffModal';

const PANELS = [
  { id:'account', label:'계정 관리' },
  { id:'alarm',   label:'알림 설정' },
  { id:'system',  label:'시스템 설정' },
  { id:'role',    label:'권한 관리' },
];

function Toggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return <div className={`s-toggle${on?' on':''}`} onClick={() => setOn(v => !v)} />;
}

export default function Setting({ showToast, theme, setTheme }) {
  const { user } = useAuth();
  const [panel, setPanel] = useState('account');
  const [pwModal, setPwModal] = useState(false);
  const [pw, setPw] = useState({ old:'', new:'', new2:'' });

  const savePw = () => {
    if (!pw.old) { showToast('현재 비밀번호를 입력해 주세요.'); return; }
    if (pw.new.length < 8) { showToast('새 비밀번호는 8자 이상이어야 합니다.'); return; }
    if (pw.new !== pw.new2) { showToast('새 비밀번호가 일치하지 않습니다.'); return; }
    setPwModal(false);
    setPw({ old:'', new:'', new2:'' });
    showToast('비밀번호가 변경되었습니다.');
  };

  return (
    <div className="s-page active">
      <div style={{ fontSize:20, fontWeight:800, letterSpacing:'-.5px', marginBottom:4 }}>설정</div>
      <div style={{ fontSize:13, color:'#778090', marginBottom:20 }}>시스템 환경을 관리하고 계정 정보를 변경할 수 있습니다.</div>

      <div className="s-setting-layout">
        <div className="s-set-sidebar">
          {PANELS.map(p => (
            <div key={p.id} className={`s-set-item${panel===p.id?' active':''}`} onClick={() => setPanel(p.id)}>{p.label}</div>
          ))}
        </div>
        <div className="s-set-content">

          {panel==='account' && (
            <>
              <div className="s-set-title">계정 정보</div>
              <div className="s-profile-row">
                <div className="s-av">{user?.name?.charAt(0)}</div>
                <div className="s-profile-info">
                  <div className="pi-name">{user?.name}</div>
                  <div className="pi-email">{user?.email}</div>
                  <div className="pi-change" style={{ cursor:'pointer' }} onClick={() => setPwModal(true)}>비밀번호 변경</div>
                </div>
              </div>
              <div className="s-set-title" style={{ marginTop:20 }}>기본 설정</div>
              <div className="s-set-row"><div><div className="sr-label">이메일 알림</div><div className="sr-desc">민원 처리 상태가 변경되면 이메일로 알림을 받습니다.</div></div><Toggle defaultOn /></div>
              <div className="s-set-row"><div><div className="sr-label">데스크탑 알림</div><div className="sr-desc">새로운 민원이 접수되면 알림을 받습니다.</div></div><Toggle defaultOn /></div>
              <div className="s-set-row">
                <div><div className="sr-label">화면 테마</div></div>
                <div style={{ display:'flex', gap:16, fontSize:13 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer' }}>
                    <input type="radio" name="theme" value="light" checked={theme==='light'} onChange={() => setTheme('light')} /> 라이트
                  </label>
                  <label style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer' }}>
                    <input type="radio" name="theme" value="dark" checked={theme==='dark'} onChange={() => setTheme('dark')} /> 다크
                  </label>
                </div>
              </div>
            </>
          )}

          {panel==='alarm' && (
            <>
              <div className="s-set-title">알림 설정</div>
              <div className="s-set-row"><div><div className="sr-label">신규 민원 알림</div><div className="sr-desc">새 민원이 접수될 때 알림을 받습니다.</div></div><Toggle defaultOn /></div>
              <div className="s-set-row"><div><div className="sr-label">처리 기한 알림</div><div className="sr-desc">처리 기한 1일 전에 알림을 받습니다.</div></div><Toggle defaultOn /></div>
              <div className="s-set-row"><div><div className="sr-label">시스템 공지 알림</div></div><Toggle /></div>
            </>
          )}

          {panel==='system' && (
            <>
              <div className="s-set-title">시스템 설정</div>
              <div className="s-set-row"><div><div className="sr-label">자동 로그아웃</div><div className="sr-desc">30분 비활성 시 자동으로 로그아웃됩니다.</div></div><Toggle defaultOn /></div>
              <div className="s-set-row">
                <div><div className="sr-label">목록 기본 표시 수</div></div>
                <select style={{ padding:'6px 10px', border:'1px solid #d1d5db', borderRadius:5, fontSize:13, fontFamily:'inherit' }}>
                  <option>10개</option><option>20개</option><option>50개</option>
                </select>
              </div>
            </>
          )}

          {panel==='role' && (
            <>
              <div className="s-set-title">권한 관리</div>
              <p style={{ fontSize:13, color:'#778090', lineHeight:1.9 }}>
                현재 계정의 권한 : <strong style={{ color:'#1555a4' }}>
                  {user?.role === 'manager' ? '부서 관리자' : '민원 담당자'}
                </strong><br />
                권한 변경은 시스템 관리자에게 문의하세요.
              </p>
            </>
          )}
        </div>
      </div>

      {pwModal && (
        <StaffModal
          title="비밀번호 변경"
          onClose={() => setPwModal(false)}
          footer={<><button className="sf-btn-cancel" onClick={() => setPwModal(false)}>취소</button><button className="sf-btn-ok" onClick={savePw}>변경</button></>}
        >
          <div className="sf-fg"><label>현재 비밀번호 <span className="req">*</span></label><input type="password" value={pw.old} onChange={e => setPw(p => ({...p,old:e.target.value}))} placeholder="현재 비밀번호" /></div>
          <div className="sf-fg"><label>새 비밀번호 <span className="req">*</span></label><input type="password" value={pw.new} onChange={e => setPw(p => ({...p,new:e.target.value}))} placeholder="영문+숫자+특수문자 8자 이상" /></div>
          <div className="sf-fg"><label>새 비밀번호 확인 <span className="req">*</span></label><input type="password" value={pw.new2} onChange={e => setPw(p => ({...p,new2:e.target.value}))} placeholder="새 비밀번호 재입력" /></div>
        </StaffModal>
      )}
    </div>
  );
}