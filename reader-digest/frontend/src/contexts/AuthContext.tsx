'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { authAPI } from '@/lib/api';
import { isAuthenticated, setAuthToken, removeAuthToken } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (loginData: { login: string; password: string }) => Promise<{ success: boolean; user: any }>;
  register: (registerData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<{ success: boolean; user: any }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user);
        } catch (error) {
          // Token might be invalid, remove it
          removeAuthToken();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (loginData: { login: string; password: string }) => {
    try {
      const response = await authAPI.login(loginData);
      const { access_token, user: userData } = response.data;
      
      setAuthToken(access_token);
      setUser(userData);
      
      // Return success so components can handle redirect
      return { success: true, user: userData };
    } catch (error) {
      throw error;
    }
  };

  const register = async (registerData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => {
    try {
      const response = await authAPI.register(registerData);
      const { access_token, user: userData } = response.data;
      
      setAuthToken(access_token);
      setUser(userData);
      
      // Return success so components can handle redirect
      return { success: true, user: userData };
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const refreshUser = async () => {
    if (isAuthenticated()) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data.user);
      } catch (error) {
        logout();
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
