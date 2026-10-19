import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { getToken, isTokenExpired, setToken, UNAUTHORIZED_EVENT } from '../services/api';

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
      const token = getToken();
      // Sin token válido el usuario guardado no sirve: el backend rechazaría todas las peticiones.
      if (!stored || !token || isTokenExpired(token)) {
        setToken(null);
        return null;
      }
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  });

  // El backend rechazó el token (expiró mientras se usaba la plataforma): cerrar sesión.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

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
  const logout = () => {
    setUser(null);
    setToken(null);
  };

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
