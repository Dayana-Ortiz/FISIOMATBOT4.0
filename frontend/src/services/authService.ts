// Servicio de autenticación real contra el backend (ver backend/src/controllers/authController.js).
// Login.tsx y Register.tsx ya usan estas funciones: las credenciales se
// validan contra la tabla `users` de MySQL (bcrypt + JWT), no hay mocks.

import { apiRequest, setToken } from './api';
import { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<User> => {
  const { token, user } = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setToken(token);
  return user;
};

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
  institution?: string;
  grade: number;
}): Promise<User> => {
  const { token, user } = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  });
  setToken(token);
  return user;
};

export const logout = (): void => setToken(null);

export const fetchCurrentUser = async (): Promise<User> => {
  const { user } = await apiRequest<{ user: User }>('/auth/me');
  return user;
};
