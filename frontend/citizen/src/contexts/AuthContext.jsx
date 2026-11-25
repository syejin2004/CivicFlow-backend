import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const BASE_URL = 'https://civicflow-production.up.railway.app/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    try {
      const savedUser = localStorage.getItem('civicflow_user');
      const savedToken = localStorage.getItem('civicflow_token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('civicflow_user');
      localStorage.removeItem('civicflow_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const { id, password } = credentials;
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: id, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message };

      const roleMap = {
        CITIZEN: 'citizen',
        OFFICER: 'staff',
        ADMIN: 'manager'
      };

      const userData = {
        id: data.user.id,
        name: data.user.username,
        email: data.user.email,
        role: roleMap[data.user.role] || 'citizen',
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('civicflow_user', JSON.stringify(userData));
      localStorage.setItem('civicflow_token', data.token);

      return { success: true, user: userData };
    } catch (e) {
      return { success: false, message: '서버 연결 실패' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('civicflow_user');
    localStorage.removeItem('civicflow_token');
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role.toUpperCase(),
          department_id: userData.department_id || null  // 추가!
        })
      });
      const data = await res.json();
      return { success: res.ok, message: data.message };
    } catch (e) {
      return { success: false, message: '서버 연결 실패' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    loadUserFromStorage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}