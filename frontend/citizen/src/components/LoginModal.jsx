import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DEPARTMENTS = [
  { id: 7, name: '도로관리과' },
  { id: 8, name: '교통지도과' },
  { id: 9, name: '환경미화과' },
  { id: 10, name: '생활민원과' },
  { id: 11, name: '시설관리과' },
  { id: 12, name: '민원실' },
];

function RegisterSteps({ onLoginClick }) {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [allChecked, setAllChecked] = useState(false);
  const [form, setForm] = useState({
    username: '', email: '', password: '', passwordConfirm: '', role: 'CITIZEN', department_id: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const labels = ['약관동의', '정보입력', '가입완료'];

  const toggleAll = (e) => {
    setAllChecked(e.target.checked);
    document.querySelectorAll('.term-chk').forEach(c => c.checked = e.target.checked);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError('');
    if (!form.username || !form.email || !form.password) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (form.role === 'OFFICER' && !form.department_id) {
      setError('부서를 선택해주세요.');
      return;
    }
    setLoading(true);
    const result = await register({
      name: form.username,
      email: form.email,
      password: form.password,
      role: form.role,
      department_id: form.department_id || null
    });
    setLoading(false);
    if (result.success) {
      setStep(3);
    } else {
      setError(result.message);
    }
  };

  return (
    <>
      <div className="reg-step-bar">
        {labels.map((lb, i) => (
          <div key={i} className={`reg-step${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}>
            <div className="s-num">{i + 1}</div>
            <div className="s-label">{lb}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="modal-body">
          <div className="terms-box">
            <label className="terms-all"><input type="checkbox" onChange={toggleAll} checked={allChecked} /> 전체 동의합니다</label>
            <label className="terms-item"><input type="checkbox" className="term-chk" /> 서비스 이용약관 동의<span className="req">필수</span></label>
            <label className="terms-item"><input type="checkbox" className="term-chk" /> 개인정보 수집·이용 동의<span className="req">필수</span></label>
            <label className="terms-item"><input type="checkbox" className="term-chk" /> 개인정보 제3자 제공 동의<span className="req">필수</span></label>
            <label className="terms-item"><input type="checkbox" className="term-chk" /> 마케팅 정보 수신 동의<span className="opt">(선택)</span></label>
          </div>
          <div className="reg-nav">
            <button className="btn-next" onClick={() => {
              const required = document.querySelectorAll('.term-chk');
              const checked = Array.from(required).slice(0, 3).every(c => c.checked);
              if (!checked) {
                alert('필수 약관에 동의해주세요.');
                return;
              }
              setStep(2);
            }}>다음 단계</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="modal-body">
          {error && (
            <div style={{ padding: '10px', marginBottom: '10px', background: '#fee', color: '#c00', borderRadius: '4px', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <div className="reg-form-group">
            <label>사용자 유형 <span className="req">*</span></label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="CITIZEN">시민</option>
              <option value="OFFICER">민원 담당자</option>
            </select>
          </div>

          {form.role === 'OFFICER' && (
            <div className="reg-form-group">
              <label>소속 부서 <span className="req">*</span></label>
              <select name="department_id" value={form.department_id} onChange={handleChange}>
                <option value="">부서를 선택하세요</option>
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="reg-form-group">
            <label>이름 <span className="req">*</span></label>
            <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="이름을 입력하세요" />
          </div>
          <div className="reg-form-group">
            <label>이메일 <span className="req">*</span></label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="이메일 주소 입력" />
          </div>
          <div className="reg-form-group">
            <label>비밀번호 <span className="req">*</span></label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="비밀번호를 입력하세요" />
          </div>
          <div className="reg-form-group">
            <label>비밀번호 확인 <span className="req">*</span></label>
            <input type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} placeholder="비밀번호를 다시 입력하세요" />
          </div>
          <div className="reg-nav">
            <button className="btn-prev" onClick={() => setStep(1)}>이전</button>
            <button className="btn-next" onClick={handleRegister} disabled={loading}>
              {loading ? '가입중...' : '가입 완료'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="modal-body">
          <div className="reg-complete">
            <h3>회원가입이 완료되었습니다!</h3>
            <p>CivicFlow 회원이 되신 것을 환영합니다.<br />이제 로그인 후 민원 서비스를 이용하실 수 있습니다.</p>
            <button className="mf-submit" onClick={onLoginClick}>로그인하러 가기</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginModal({ initialTab, onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginType, setLoginType] = useState('citizen');
  const [tab, setTab] = useState(initialTab === 'register' ? 'register' : 'login');
  const [pwVisible, setPwVisible] = useState(false);
  const [error, setError] = useState('');

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) onClose(); };

  const handleLogin = async () => {
    setError('');
    const id = document.getElementById('login-id-input')?.value || '';
    const password = document.getElementById('login-pw-input')?.value || '';

    const result = await login({ id, password, loginType });

    if (result.success) {
      onClose();
      if (result.user.role === 'staff') {
        navigate('/staff');
      } else if (result.user.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="modal-overlay open" onClick={handleOverlayClick}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        {tab === 'login' && (
          <div className="modal-type-tabs">
            <button className={`modal-type-tab${loginType === 'citizen' ? ' active' : ''}`} onClick={() => setLoginType('citizen')}>시민 로그인</button>
            <button className={`modal-type-tab${loginType === 'staff' ? ' active' : ''}`} onClick={() => setLoginType('staff')}>직원 로그인</button>
          </div>
        )}

        {tab === 'register' && (
          <div style={{ padding: '20px 24px 0', fontSize: '18px', fontWeight: 800, color: '#172238' }}>
            회원가입
          </div>
        )}

        {tab === 'login' && (
          <div className="modal-form active">
            <div className="modal-body">
              {error && (
                <div style={{ padding: '10px', marginBottom: '10px', background: '#fee', color: '#c00', borderRadius: '4px', fontSize: '13px' }}>
                  {error}
                </div>
              )}
              <div className="mf-label">이메일</div>
              <div className="mf-field">
                <span className="fi-icon">ID</span>
                <input id="login-id-input" type="text" placeholder="이메일을 입력하세요." />
              </div>
              <div className="mf-label">비밀번호</div>
              <div className="mf-field">
                <span className="fi-icon">PW</span>
                <input id="login-pw-input" type={pwVisible ? 'text' : 'password'} placeholder="비밀번호를 입력하세요." />
                <span className="fi-right" onClick={() => setPwVisible(v => !v)}>{pwVisible ? '표시' : '숨김'}</span>
              </div>
              <div className="mf-opts">
                <label className="mf-check"><input type="checkbox" /> 로그인 상태 유지</label>
              </div>
              <button className="mf-submit" onClick={handleLogin}>로그인</button>
              <div className="mf-bottom">
                <span>아직 계정이 없으신가요?</span>
                <a onClick={() => setTab('register')}>회원가입</a>
              </div>
            </div>
          </div>
        )}

        {tab === 'register' && <RegisterSteps onLoginClick={() => setTab('login')} />}
      </div>
    </div>
  );
}