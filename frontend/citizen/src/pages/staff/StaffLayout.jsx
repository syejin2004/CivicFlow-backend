import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StaffSidebar from '../../components/staff/StaffSidebar';
import StaffTopbar from '../../components/staff/StaffTopbar';
import Toast from '../../components/staff/Toast';
import Dash from './Dash';
import List from './List';
import Detail from './Detail';
import Class from './Class';
import Stats from './Stats';
import Notice from './Notice';
import Setting from './Setting';
import Chat from './Chat';
import Inbox from './Inbox';
import AllList from './AllList';
import Assign from './Assign';
import Team from './Team';

export default function StaffLayout({ onLogout }) {
  const { user } = useAuth();
  const [page, setPage] = useState(user?.role === 'staff' ? 'inbox' : 'dash');
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('light');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  useEffect(() => {
    if (user?.role === 'staff') {
      setPage('inbox');
    } else if (user?.role === 'manager') {
      setPage('dash');
    }
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const goToDetail = (id) => {
    setSelectedComplaintId(id);
    setPage('detail');
  };

  const pageMap = {
    inbox:      <Inbox />,
    dash:       <Dash setPage={setPage} />,
    list:       <List setPage={setPage} goToDetail={goToDetail} />,
    detail:     <Detail setPage={setPage} showToast={showToast} complaintId={selectedComplaintId} />,
    class:      <Class showToast={showToast} />,
    stats:      <Stats />,
    notice:     <Notice showToast={showToast} />,
    setting:    <Setting showToast={showToast} theme={theme} setTheme={setTheme} />,
    chat:       <Chat />,
    'all-list': <AllList />,
    assign:     <Assign />,
    team:       <Team />,
  };

  return (
    <div className={`staff-wrap${theme === 'dark' ? ' dark-theme' : ''}`}>
      <StaffSidebar page={page} setPage={setPage} />
      <div className="staff-main">
        <StaffTopbar onLogout={onLogout} />
        <div className="staff-body">
          {pageMap[page] || pageMap.dash}
        </div>
      </div>
      {toast && <Toast msg={toast} />}
    </div>
  );
}