// Quizzes (ver backend/src/controllers/quizController.js).
//  - Estudiantes: las preguntas llegan sin la respuesta; cada respuesta se corrige en el servidor.
//  - Profesores y administradores: gestión completa en /admin/quizzes.

import { apiRequest } from './api';
import { ModuleType } from '../types';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Difícil',
};

// --- Estudiantes ---

export interface StudentQuestion {
  id: number;
  question: string;
  difficulty: Difficulty;
  options: { id: number; text: string }[];
}

export interface AnswerResult {
  isCorrect: boolean;
  correctOptionId: number | null;
  explanation: string | null;
  points: number;
}

export const getModuleQuiz = async (module: ModuleType): Promise<StudentQuestion[]> => {
  const { questions } = await apiRequest<{ questions: StudentQuestion[] }>(`/quizzes/module/${module}`);
  return questions;
};

export const answerQuestion = (quizId: number, optionId: number): Promise<AnswerResult> =>
  apiRequest<AnswerResult>(`/quizzes/${quizId}/answer`, { method: 'POST', body: { optionId } });

// --- Profesores y administradores ---

export interface ManagedOption {
  id?: number;
  text: string;
  isCorrect: boolean;
}

export interface ManagedQuiz {
  id: number;
  moduleCode: ModuleType;
  question: string;
  explanation: string | null;
  difficulty: Difficulty;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  authorName: string | null;
  options: ManagedOption[];
}

export interface QuizInput {
  question: string;
  explanation: string;
  difficulty: Difficulty;
  isActive: boolean;
  options: ManagedOption[];
}

export const getQuizSummary = async (): Promise<{ code: ModuleType; total: number; active: number }[]> => {
  const { modules } = await apiRequest<{ modules: { code: ModuleType; total: number; active: number }[] }>(
    '/admin/quizzes/summary'
  );
  return modules;
};

export const listQuizzes = async (module: ModuleType): Promise<ManagedQuiz[]> => {
  const { quizzes } = await apiRequest<{ quizzes: ManagedQuiz[] }>(`/admin/quizzes?module=${module}`);
  return quizzes;
};

export const createQuiz = async (module: ModuleType, data: QuizInput): Promise<ManagedQuiz> => {
  const { quiz } = await apiRequest<{ quiz: ManagedQuiz }>('/admin/quizzes', {
    method: 'POST',
    body: { ...data, moduleCode: module },
  });
  return quiz;
};

export const updateQuiz = async (id: number, data: QuizInput): Promise<ManagedQuiz> => {
  const { quiz } = await apiRequest<{ quiz: ManagedQuiz }>(`/admin/quizzes/${id}`, { method: 'PUT', body: data });
  return quiz;
};

export const setQuizStatus = async (id: number, isActive: boolean): Promise<ManagedQuiz> => {
  const { quiz } = await apiRequest<{ quiz: ManagedQuiz }>(`/admin/quizzes/${id}/status`, {
    method: 'PATCH',
    body: { isActive },
  });
  return quiz;
};

export const moveQuiz = (id: number, direction: 'up' | 'down') =>
  apiRequest<{ message: string }>(`/admin/quizzes/${id}/move`, { method: 'PATCH', body: { direction } });

export const deleteQuiz = (id: number) =>
  apiRequest<{ message: string }>(`/admin/quizzes/${id}`, { method: 'DELETE' });
