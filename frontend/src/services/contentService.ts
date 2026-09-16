// Servicio de contenido: trae módulos, secciones, quizzes y simulaciones
// desde el backend real (ver backend/src/controllers/moduleController.js).
//
// NOTA: hoy el frontend usa datos simulados (frontend/src/data/*). Este
// servicio queda listo para reemplazarlos cuando el backend esté desplegado;
// solo hace falta llamar a estas funciones desde los componentes/páginas
// en lugar de los mocks.

import { apiRequest } from './api';
import { Module, ModuleType, Quiz, Section, Simulation } from '../types';

interface ModuleSummaryResponse {
  id: number;
  code: ModuleType;
  title: string;
  description: string;
  color: string;
  icon: string;
  display_order: number;
}

interface QuizOptionResponse {
  id: number;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

interface QuizResponse {
  id: number;
  question: string;
  explanation: string;
  difficulty: Quiz['difficulty'];
  options: QuizOptionResponse[];
}

interface SectionResponse {
  id: number;
  title: string;
  content: string;
  display_order: number;
}

interface SimulationResponse {
  id: number;
  title: string;
  description: string;
  type: Simulation['type'];
}

interface ModuleDetailResponse {
  module: ModuleSummaryResponse;
  sections: SectionResponse[];
  quizzes: QuizResponse[];
  simulations: SimulationResponse[];
}

export const getModules = async (): Promise<ModuleSummaryResponse[]> => {
  const { modules } = await apiRequest<{ modules: ModuleSummaryResponse[] }>('/modules');
  return modules;
};

export const getModuleDetail = async (code: ModuleType): Promise<Module> => {
  const { module, sections, quizzes, simulations } = await apiRequest<ModuleDetailResponse>(
    `/modules/${code}`
  );

  const mappedSections: Section[] = sections.map((s) => ({
    id: String(s.id),
    title: s.title,
    content: s.content,
    order: s.display_order,
    completed: false, // se combina con el progreso del usuario (ver progressService)
  }));

  const mappedQuizzes: Quiz[] = quizzes.map((q) => {
    const correctIndex = q.options.findIndex((o) => o.is_correct);
    return {
      id: String(q.id),
      question: q.question,
      options: q.options.map((o) => o.option_text),
      correctAnswer: correctIndex >= 0 ? correctIndex : 0,
      explanation: q.explanation,
      difficulty: q.difficulty,
    };
  });

  const mappedSimulations: Simulation[] = simulations.map((s) => ({
    id: String(s.id),
    title: s.title,
    description: s.description,
    type: s.type,
  }));

  return {
    id: String(module.id),
    type: module.code,
    title: module.title,
    description: module.description,
    color: module.color,
    icon: module.icon,
    progress: 0, // se completa con progressService.getMyProgress()
    sections: mappedSections,
    quizzes: mappedQuizzes,
    simulations: mappedSimulations,
  };
};
