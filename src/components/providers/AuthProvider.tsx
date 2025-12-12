'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
  isBlocked: boolean;
  createdAt: string;
}

interface AccessStatus {
  hasAccess: boolean;
  status: 'trial' | 'subscribed' | 'expired' | 'blocked' | 'admin';
  daysRemaining?: number;
}

interface AuthContextType {
  user: User | null;
  accessStatus: AccessStatus | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = Cookies.get('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data.user);
      setAccessStatus(response.data.accessStatus);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      Cookies.remove('token');
      setUser(null);
      setAccessStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', { email, password });
    Cookies.set('token', response.data.token, { expires: 7 });
    setUser(response.data.user);
    await fetchUser();
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await axios.post('/api/auth/register', { email, password, name });
    Cookies.set('token', response.data.token, { expires: 7 });
    setUser(response.data.user);
    await fetchUser();
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    setAccessStatus(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessStatus,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
