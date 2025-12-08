import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Keychain from 'react-native-keychain';
import apiClient from '../api/axios';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const [tokenCredentials, userCredentials] = await Promise.all([
        Keychain.getGenericPassword({ service: 'accessToken' }),
        Keychain.getGenericPassword({ service: 'user' }),
      ]);

      if (tokenCredentials && userCredentials) {
        setAccessToken(tokenCredentials.password);
        setUser(JSON.parse(userCredentials.password));
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });

      const { user: userData, accessToken: token, refreshToken } = response.data.data;

      // Save tokens and user data
      await Promise.all([
        Keychain.setGenericPassword('accessToken', token, {
          service: 'accessToken',
        }),
        Keychain.setGenericPassword('refreshToken', refreshToken, {
          service: 'refreshToken',
        }),
        Keychain.setGenericPassword('user', JSON.stringify(userData), {
          service: 'user',
        }),
      ]);

      setAccessToken(token);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      // Get refresh token for logout request
      const refreshTokenCredentials = await Keychain.getGenericPassword({
        service: 'refreshToken',
      });

      if (refreshTokenCredentials) {
        await apiClient.post('/api/auth/logout', {
          refreshToken: refreshTokenCredentials.password,
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear all stored data
      await Promise.all([
        Keychain.resetGenericPassword({ service: 'accessToken' }),
        Keychain.resetGenericPassword({ service: 'refreshToken' }),
        Keychain.resetGenericPassword({ service: 'user' }),
      ]);

      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
