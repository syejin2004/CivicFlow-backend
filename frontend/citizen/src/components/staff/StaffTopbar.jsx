import { useAuth } from '../../contexts/AuthContext';

export default function StaffTopbar({ onLogout }) {
  const { user } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="staff-topbar">
      <input type="text" placeholder="민원 번호, 키워드로 입력하세요." />
      <div className="staff-topbar-right">
        <span style={{ color: '#778090', fontSize: 18 }}>&#9825;</span>
        <span className="tb-name">{user?.name}</span>
        <button
          className="tb-logout"
          onClick={handleLogout}
          style={{ position: 'relative', zIndex: 1000, cursor: 'pointer' }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}