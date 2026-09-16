// Servicio de administración: consume los endpoints reales que ya expone
// backend/src/controllers/adminController.js. Requiere que el usuario logueado
// tenga rol 'teacher' o 'admin' (el token JWT ya lo trae, ver services/api.ts).

import { apiRequest } from './api';
import { UserRole } from '../types';

export interface AdminManagedUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  grade: number | null;
  institutionId: number | null;
  status: 'active' | 'inactive';
}

export interface AdminStats {
  students: number;
  teachers: number;
  admins: number;
  active: number;
}

export const listUsers = async (): Promise<AdminManagedUser[]> => {
  const { users } = await apiRequest<{ users: AdminManagedUser[] }>('/admin/users');
  return users;
};

export const getStats = async (): Promise<AdminStats> => {
  const { stats } = await apiRequest<{ stats: AdminStats }>('/admin/stats');
  return stats;
};

// Requiere rol 'admin' en el backend; el llamador debe validar el permiso antes.
export const changeUserRole = (id: number, role: UserRole): Promise<{ message: string }> =>
  apiRequest(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } });

export const toggleUserStatus = (id: number): Promise<{ message: string; status: 'active' | 'inactive' }> =>
  apiRequest(`/admin/users/${id}/status`, { method: 'PATCH' });
