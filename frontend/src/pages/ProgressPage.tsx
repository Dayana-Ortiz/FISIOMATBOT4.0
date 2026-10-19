import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartColumn, FaCircleCheck, FaRegCircle } from 'react-icons/fa6';
import ProgressTracker, { MODULE_META } from '../components/Layout/ProgressTracker.tsx';
import { useProgress } from '../hooks/useProgress';
import { ModuleType } from '../types';
import './ProgressPage.css';

// Mismo orden y claves que database/lessons.sql y los módulos del frontend
const ACTIVITIES: Record<ModuleType, { key: string; title: string }[]> = {
  physics: [
    { key: 'intro', title: 'Introducción a la Ciencia' },
    { key: 'movement', title: 'Movimiento Rectilíneo' },
    { key: 'forces', title: 'Leyes de Newton' },
    { key: 'quiz', title: 'Quiz de Ciencia' },
  ],
  mathematics: [
    { key: 'algebra', title: 'Álgebra Básica' },
    { key: 'geometry', title: 'Geometría' },
    { key: 'calculus', title: 'Cálculo Diferencial' },
    { key: 'quiz', title: 'Quiz de Matemáticas' },
  ],
  technology: [
    { key: 'programming', title: 'Programación Básica' },
    { key: 'robotics', title: 'Robótica Educativa' },
    { key: 'networks', title: 'Redes y Comunicaciones' },
    { key: 'quiz', title: 'Quiz de Tecnología' },
  ],
  simulator: [
    { key: 'explore', title: 'Explorar la simulación 3D (correrla al menos 3 segundos)' },
    { key: 'quiz', title: 'Quiz del Simulador' },
  ],
};

const MODULE_PATHS: Record<ModuleType, string> = {
  physics: '/physics',
  mathematics: '/mathematics',
  technology: '/technology',
  simulator: '/simulator',
};

// last_activity_at llega como "YYYY-MM-DD HH:MM:SS"
const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value.replace(' ', 'T'));
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
};

const ProgressPage: React.FC = () => {
  const { progress, loading, error, getModule, isCompleted } = useProgress();

  return (
    <section aria-labelledby="progress-page-title">
      <header className="mb-4">
        <h1 id="progress-page-title" className="icon-inline"><FaChartColumn /> Tu progreso</h1>
        <p className="text-muted">
          Revisa el avance general y por módulo en la plataforma.
        </p>
      </header>

      <div className="row g-4">
        <article className="col-12 col-lg-8">
          <div className="p-4 bg-white rounded-3 shadow-sm h-100">
            <h2 className="h5 mb-3">Resumen de estudio</h2>

            {loading && <p className="text-muted mb-0">Cargando tu progreso…</p>}
            {error && <p className="progress-page-error" role="alert">No se pudo cargar tu progreso: {error}</p>}

            {progress && (
              <>
                <p className="mb-4">
                  Has completado <strong>{progress.overall.completed}</strong> de{' '}
                  <strong>{progress.overall.total}</strong> actividades
                  {progress.stats.activitiesThisWeek > 0 && (
                    <> ({progress.stats.activitiesThisWeek} esta semana)</>
                  )}
                  . Una actividad cuenta al marcar una lección como completada, al terminar un quiz o al
                  explorar el simulador.
                </p>

                <div className="progress-summary-modules">
                  {MODULE_META.map((meta) => {
                    const mod = getModule(meta.code);
                    const lastActivity = formatDate(mod?.lastActivity ?? null);
                    return (
                      <section key={meta.code} className="progress-summary-module">
                        <header className="progress-summary-header">
                          <span className="progress-summary-icon" style={{ color: meta.color }}>
                            {meta.icon}
                          </span>
                          <Link to={MODULE_PATHS[meta.code]} className="progress-summary-name">
                            {meta.name}
                          </Link>
                          <span className="progress-summary-count">
                            {mod?.completed ?? 0}/{mod?.total ?? ACTIVITIES[meta.code].length}
                          </span>
                        </header>
                        <ul className="progress-summary-list list-unstyled">
                          {ACTIVITIES[meta.code].map((activity) => {
                            const done = isCompleted(meta.code, activity.key);
                            return (
                              <li key={activity.key} className={done ? 'done' : ''}>
                                {done ? <FaCircleCheck aria-hidden="true" /> : <FaRegCircle aria-hidden="true" />}
                                <span>{activity.title}</span>
                                <span className="visually-hidden">{done ? '(completada)' : '(pendiente)'}</span>
                              </li>
                            );
                          })}
                        </ul>
                        {lastActivity && (
                          <p className="progress-summary-date">Última actividad: {lastActivity}</p>
                        )}
                      </section>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </article>

        <aside
          className="col-12 col-lg-4"
          aria-label="Panel lateral de seguimiento de progreso"
        >
          <div className="bg-white rounded-3 shadow-sm p-4 h-100">
            <ProgressTracker progress={progress} loading={loading} />
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ProgressPage;
