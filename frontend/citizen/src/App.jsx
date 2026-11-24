import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ComplaintProvider } from './contexts/ComplaintContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Apply from './pages/Apply';
import AIPhoto from './pages/AIPhoto';
import Report from './pages/Report';
import Result from './pages/Result';
import Guide from './pages/Guide';
import Info from './pages/Info';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import StaffLayout from './pages/staff/StaffLayout';

function AppRoutes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="ai-photo" element={<AIPhoto />} />
        <Route path="guide" element={<Guide />} />
        <Route path="info" element={<Info />} />
        <Route path="apply" element={<Apply />} />
        <Route path="report" element={<Report />} />
        <Route path="result" element={<Result />} />
      </Route>

      {/* Staff routes */}
      <Route
        path="/staff/*"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['staff']}>
              <StaffLayout onLogout={handleLogout} />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* Manager routes */}
      <Route
        path="/manager/*"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['manager']}>
              <StaffLayout onLogout={handleLogout} />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </BrowserRouter>
      </ComplaintProvider>
    </AuthProvider>
  );
}
