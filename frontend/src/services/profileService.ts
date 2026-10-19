// Perfil del usuario autenticado (ver backend/src/controllers/profileController.js).

import { apiRequest, setToken } from './api';
import { Grade, User } from '../types';

export interface Profile extends User {
  institution?: string;
  bio: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ProfileStats {
  completedLessons: number;
  totalScore: number;
  achievements: number;
}

interface ProfileResponse {
  profile: Profile;
  stats: ProfileStats;
}

export interface ProfileUpdate {
  name: string;
  email: string;
  grade: Grade | null;
  institution: string;
  bio: string;
}

export const getMyProfile = () => apiRequest<ProfileResponse>('/profile/me');

export const updateMyProfile = async (data: ProfileUpdate): Promise<ProfileResponse> => {
  const res = await apiRequest<ProfileResponse & { token: string }>('/profile/me', {
    method: 'PUT',
    body: data,
  });
  // El backend emite un token nuevo con el nombre y correo actualizados.
  setToken(res.token);
  return { profile: res.profile, stats: res.stats };
};
