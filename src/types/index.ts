export type UserRole = 'student' | 'teacher' | 'admin';
export type Grade = 9 | 10 | 11;
export type ModuleType = 'physics' | 'mathematics' | 'technology' | 'simulator';
export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  grade: Grade;
  avatar?: string;
}

export interface Module {
  id: string;
  type: ModuleType;
  title: string;
  description: string;
  color: string;
  icon: string;
  progress: number;
  sections: Section[];
  quizzes: Quiz[];
  simulations: Simulation[];
}

export interface Section {
  id: string;
  title: string;
  content: string;
  order: number;
  completed: boolean;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Simulation {
  id: string;
  title: string;
  description: string;
  type: 'physics' | 'math' | 'tech';
}

export interface Progress {
  userId: string;
  moduleId: string;
  completedSections: string[];
  quizScores: Record<string, number>;
  simulationAttempts: Record<string, number>;
  lastActivity: Date;
  overallProgress: number;
}