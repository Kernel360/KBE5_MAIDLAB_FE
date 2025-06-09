import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { adminApi } from '../apis/admin';

type UserType = 'ADMIN' | 'MANAGER' | 'CONSUMER' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: UserType;
  login: (token: string, type: UserType) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedType = localStorage.getItem('userType');
    
    if (token && storedType && ['ADMIN', 'MANAGER', 'CONSUMER'].includes(storedType)) {
      setIsAuthenticated(true);
      setUserType(storedType as UserType);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, type: UserType) => {
    if (type) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userType', type);
      setIsAuthenticated(true);
      setUserType(type);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');
    setIsAuthenticated(false);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 