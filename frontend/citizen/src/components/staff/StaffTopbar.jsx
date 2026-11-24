export default function StaffTopbar({ onLogout }) {
  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('로그아웃 버튼 클릭됨');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="staff-topbar">
      <input type="text" placeholder="민원 번호, 키워드로 입력하세요." />
      <div className="staff-topbar-right">
        <span style={{ color: '#778090', fontSize: 18 }}>&#9825;</span>
        <span className="tb-name">김민지</span>
        <button
          className="tb-logout"
          onClick={handleLogout}
          style={{
            position: 'relative',
            zIndex: 1000,
            cursor: 'pointer'
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
