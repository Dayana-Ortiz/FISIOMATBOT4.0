// Servicio de progreso: lee y actualiza el avance del usuario contra el
// backend real (ver backend/src/controllers/progressController.js).
//
// Reemplaza el uso de ProgressContext/localStorage cuando el backend esté
// desplegado y el login emita un token real (ver frontend/src/services/api.ts).

import { apiRequest } from './api';
import { ModuleType } from '../types';

export interface ModuleProgressResponse {
  moduleCode: ModuleType;
  moduleTitle: string;
  overallProgress: number;
  lastActivity: string | null;
}

export interface ProfileStats {
  completed_lessons: number;
  total_score: number;
  achievements_count: number;
}

export interface MyProgressResponse {
  moduleProgress: ModuleProgressResponse[];
  stats: ProfileStats;
}

export const getMyProgress = (): Promise<MyProgressResponse> =>
  apiRequest<MyProgressResponse>('/progress/me');

export const completeSection = (sectionId: string): Promise<{ message: string }> =>
  apiRequest(`/progress/sections/${sectionId}/complete`, { method: 'POST' });

export const updateModuleProgress = (
  moduleId: string,
  overallProgress: number
): Promise<{ message: string }> =>
  apiRequest(`/progress/modules/${moduleId}`, {
    method: 'PUT',
    body: { overallProgress },
  });

export const submitQuizAttempt = (
  quizId: string,
  selectedOptionId: number
): Promise<{ isCorrect: boolean; score: number }> =>
  apiRequest(`/progress/quizzes/${quizId}/attempt`, {
    method: 'POST',
    body: { selectedOptionId },
  });
