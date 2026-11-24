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
              <span>{user?.name || '사용자'}님</span>
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
