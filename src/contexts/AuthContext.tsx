import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/auth';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await getCurrentUser();
        const user: User = {
          id: response.id,
          email: response.email,
          full_name: response.full_name,
          role: response.role
        };
        setState({ user, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('auth_token');
      setState({ user: null, loading: false });
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await apiLogin(email, password);
      
      // Ensure we create a plain object with only the required properties
      const user: User = {
        id: response.id,
        email: response.email,
        full_name: response.full_name,
        role: response.role
      };

      // Update state with the serializable user object
      setState({ user, loading: false });
    } catch (error) {
      console.error('Login error:', error);
      // Clear any existing token on error
      localStorage.removeItem('auth_token');
      setState({ user: null, loading: false });
      throw error;
    }
  }

  function logout() {
    try {
      localStorage.removeItem('auth_token');
      setState({ user: null, loading: false });
      
      // Call API logout but don't wait for it
      apiLogout().catch(error => {
        console.error('Logout error:', error);
      });

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure user is logged out locally even if API call fails
      setState({ user: null, loading: false });
      window.location.href = '/login';
    }
  }

  const value = {
    user: state.user,
    loading: state.loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}