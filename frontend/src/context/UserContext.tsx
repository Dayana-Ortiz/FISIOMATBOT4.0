import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';

const STORAGE_KEY = 'fmb_user';

interface UserContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isTeacherOrAdmin: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage no disponible (modo privado, etc.): la sesión no persiste.
    }
  }, [user]);

  const login = (nextUser: User) => setUser(nextUser);
  const logout = () => setUser(null);

  const value: UserContextValue = {
    user,
    login,
    logout,
    isTeacherOrAdmin: user?.role === 'teacher' || user?.role === 'admin',
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return context;
};
