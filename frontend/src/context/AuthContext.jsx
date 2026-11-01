import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('snist_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('snist_auth_token'));
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (token) {
      api.get('/auth/profile')
        .then((res) => {
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('snist_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));

      if (user?.role === 'student') {
        fetchNotifications();
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setUnreadNotifications(res.data.unreadCount);
      }
    } catch (e) {
      // ignore
    }
  };

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data.success) {
      localStorage.setItem('snist_auth_token', res.data.token);
      localStorage.setItem('snist_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data.success) {
      localStorage.setItem('snist_auth_token', res.data.token);
      localStorage.setItem('snist_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const adminLogin = async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('snist_auth_token', res.data.token);
      localStorage.setItem('snist_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('snist_auth_token');
    localStorage.removeItem('snist_user');
    setToken(null);
    setUser(null);
    setUnreadNotifications(0);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      unreadNotifications,
      login,
      register,
      adminLogin,
      logout,
      fetchNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
