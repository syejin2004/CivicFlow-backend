import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState('login');
  const [showDropdown, setShowDropdown] = useState(false);

  const navItems = [
    { path: '/apply', label: '민원신청' },
    { path: '/result', label: '민원결과조회' },
    { path: '/report', label: '생활불편 신고' },
    { path: '/guide', label: '서비스 안내' },
    { path: '/info', label: '이용안내' },
  ];

  const openLoginModal = (tab = 'login') => {
    setModalTab(tab);
    setShowModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  return (
    <>
      <header>
        <div className="logo" onClick={() => navigate('/')}>
          <i></i>CivicFlow
        </div>
        <nav className="nav">
          {navItems.map(({ path, label }) => (
            <span
              key={path}
              className={location.pathname === path ? 'active' : ''}
              onClick={() => navigate(path)}
            >
              {label}
            </span>
          ))}
        </nav>
        <div className="account">
          {isAuthenticated ? (
            <>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span
                  onClick={() => setShowDropdown(v => !v)}
                  style={{ cursor: 'pointer' }}
                >
                  {user?.name || '사용자'}님
                </span>
                {showDropdown && (
                  <div style={{
                    position: 'absolute', right: 0, top: '30px',
                    background: '#fff', border: '1px solid #e2e6ec',
                    borderRadius: '10px', padding: '8px 0',
                    minWidth: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    zIndex: 1000
                  }}>
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#172238' }}>{user?.name}</div>
                      <div style={{ fontSize: '12px', color: '#778090' }}>{user?.email}</div>
                    </div>
                    <div
                      onClick={() => { navigate('/result'); setShowDropdown(false); }}
                      style={{ padding: '10px 16px', fontSize: '13px', cursor: 'pointer', color: '#374151' }}
                      onMouseEnter={e => e.target.style.background = '#f7f8fa'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      내 민원 조회
                    </div>
                  </div>
                )}
              </div>
              <span className="sep">│</span>
              <span onClick={handleLogout}>로그아웃</span>
            </>
          ) : (
            <>
              <span onClick={() => openLoginModal('login')}>로그인</span>
              <span className="sep">│</span>
              <span onClick={() => openLoginModal('register')}>회원가입</span>
            </>
          )}
        </div>
      </header>
      {showModal && (
        <LoginModal
          initialTab={modalTab}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}