import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/?showLogin=true" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect based on actual role
    if (user.role === 'citizen') {
      return <Navigate to="/" replace />;
    } else if (user.role === 'staff') {
      return <Navigate to="/staff" replace />;
    } else if (user.role === 'manager') {
      return <Navigate to="/manager" replace />;
    }
  }

  return children;
}
