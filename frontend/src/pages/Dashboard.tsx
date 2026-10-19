import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaTrophy, FaCalendarDays, FaBookOpen } from 'react-icons/fa6';
import { moduleIcons } from '../Utils/moduleIcons';
import { useUser } from '../context/UserContext';
import { useProgress } from '../hooks/useProgress';
import './Dashboard.css';
import { ModuleType } from '../types';

interface ModuleCard {
  id: ModuleType;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  path: string;
}

type ModuleFilter = 'all' | 'inProgress' | 'completed';

const MODULES: ModuleCard[] = [
  {
    id: 'physics',
    title: 'Ciencia',
    icon: moduleIcons.physics,
    color: 'var(--accent-orange)',
    description: 'Movimiento, fuerzas y energía',
    path: '/physics',
  },
  {
    id: 'mathematics',
    title: 'Matemáticas',
    icon: moduleIcons.mathematics,
    color: 'var(--secondary-blue)',
    description: 'Álgebra, geometría y cálculo',
    path: '/mathematics',
  },
  {
    id: 'technology',
    title: 'Tecnología',
    icon: moduleIcons.technology,
    color: 'var(--medium-gray)',
    description: 'Programación y robótica',
    path: '/technology',
  },
  {
    id: 'simulator',
    title: 'Simulador',
    icon: moduleIcons.simulator,
    color: 'var(--accent-green)',
    description: 'Prácticas interactivas',
    path: '/simulator',
  },
];

const FILTERS: { id: ModuleFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'inProgress', label: 'En progreso' },
  { id: 'completed', label: 'Completados' },
];

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { progress, loading, error, getModule } = useProgress();
  const [filter, setFilter] = useState<ModuleFilter>('all');

  const firstName = user?.name?.split(' ')[0];
  const stats = progress?.stats;
  const show = (value: string) => (loading || !progress ? '—' : value);

  const visibleModules = MODULES.filter((module) => {
    const percent = getModule(module.id)?.percent ?? 0;
    if (filter === 'inProgress') return percent > 0 && percent < 100;
    if (filter === 'completed') return percent === 100;
    return true;
  });

  return (
    <section className="dashboard">
      <header className="welcome-section">
        <h1>¡Bienvenido de nuevo{firstName ? `, ${firstName}` : ''}!</h1>
        <p className="subtitle">
          Elige un módulo STEM y continúa con tu ruta de aprendizaje.
        </p>
      </header>

      {error && (
        <p className="dashboard-error" role="alert">
          No se pudo cargar tu progreso: {error}
        </p>
      )}

      <section
        className="stats-cards"
        aria-label="Resumen de tu actividad en la plataforma"
      >
        <article className="stat-card">
          <div className="stat-icon"><FaChartLine /></div>
          <div className="stat-content">
            <h3>Progreso total</h3>
            <p className="stat-value">{show(`${progress?.overall.percent}%`)}</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon"><FaTrophy /></div>
          <div className="stat-content">
            <h3>Logros</h3>
            <p className="stat-value">{show(`${stats?.achievements}/${stats?.achievementsTotal}`)}</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon"><FaCalendarDays /></div>
          <div className="stat-content">
            <h3>Actividades esta semana</h3>
            <p className="stat-value">{show(String(stats?.activitiesThisWeek))}</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon"><FaBookOpen /></div>
          <div className="stat-content">
            <h3>Actividades completadas</h3>
            <p className="stat-value">{show(`${progress?.overall.completed}/${progress?.overall.total}`)}</p>
          </div>
        </article>
      </section>

      <section className="modules-section" aria-labelledby="modules-title">
        <div className="modules-section-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h2 id="modules-title" className="section-title mb-0">
            Tus módulos
          </h2>
          <div className="btn-group" role="group" aria-label="Filtros de módulos">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn btn-sm ${filter === f.id ? 'btn-secondary' : 'btn-outline-secondary'}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {visibleModules.length === 0 && (
          <p className="text-muted">
            {filter === 'completed'
              ? 'Todavía no has completado ningún módulo. ¡Sigue avanzando!'
              : 'No tienes módulos en progreso. Entra a uno para empezar.'}
          </p>
        )}

        <div className="modules-grid">
          {visibleModules.map((module) => {
            const mod = getModule(module.id);
            const percent = mod?.percent ?? 0;
            return (
              <article
                key={module.id}
                className="module-card-wrapper"
                aria-label={`Módulo ${module.title}`}
              >
                <Link to={module.path} className="module-card-link">
                  <div
                    className="module-card"
                    style={{ borderTop: `4px solid ${module.color}` }}
                  >
                    <header className="module-header">
                      <div
                        className="module-icon"
                        style={{ backgroundColor: module.color }}
                      >
                        {module.icon}
                      </div>
                      <h3>{module.title}</h3>
                    </header>
                    <p className="module-description">{module.description}</p>
                    <div className="module-progress">
                      <div className="progress-info">
                        <span>
                          Progreso{mod ? ` · ${mod.completed}/${mod.total} actividades` : ''}
                        </span>
                        <span>{loading ? '—' : `${percent}%`}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: module.color,
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="continue-btn btn btn-sm btn-primary">
                      {percent === 0 ? 'Empezar' : percent === 100 ? 'Repasar' : 'Continuar'}
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
};

export default Dashboard;
