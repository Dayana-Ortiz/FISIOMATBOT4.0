// Servicio de progreso: lee y registra el avance real del usuario
// (ver backend/src/controllers/progressController.js y database/lessons.sql).

import { apiRequest } from './api';
import { ModuleType } from '../types';

export interface ModuleProgress {
  code: ModuleType;
  total: number;
  completed: number;
  percent: number;
  /** lesson_key de las actividades completadas (p.ej. 'intro', 'quiz') */
  completedLessons: string[];
  lastActivity: string | null;
}

export interface MyProgress {
  overall: { completed: number; total: number; percent: number };
  modules: ModuleProgress[];
  stats: {
    completedActivities: number;
    activitiesThisWeek: number;
    totalScore: number;
    achievements: number;
    achievementsTotal: number;
  };
}

export interface CompleteLessonResponse extends MyProgress {
  /** Títulos de los logros obtenidos con esta actividad */
  newAchievements: string[];
}

export const getMyProgress = (): Promise<MyProgress> => apiRequest<MyProgress>('/progress/me');

export const completeLesson = (moduleCode: ModuleType, lessonKey: string): Promise<CompleteLessonResponse> =>
  apiRequest<CompleteLessonResponse>('/progress/lessons/complete', {
    method: 'POST',
    body: { moduleCode, lessonKey },
  });

export const submitQuizAttempt = (
  quizId: string,
  selectedOptionId: number
): Promise<{ isCorrect: boolean; score: number }> =>
  apiRequest(`/progress/quizzes/${quizId}/attempt`, {
    method: 'POST',
    body: { selectedOptionId },
  });
