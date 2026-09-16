import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaTrophy, FaCalendarDays, FaBookOpen } from 'react-icons/fa6';
import { moduleIcons } from '../Utils/moduleIcons';
import './Dashboard.css';
import { ModuleType } from '../types';

interface ModuleCard {
  id: ModuleType;
  title: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  description: string;
  path: string;
}

const Dashboard: React.FC = () => {
  const modules: ModuleCard[] = [
    {
      id: 'physics',
      title: 'Ciencia',
      icon: moduleIcons.physics,
      color: 'var(--accent-orange)',
      progress: 65,
      description: 'Movimiento, fuerzas y energía',
      path: '/physics',
    },
    {
      id: 'mathematics',
      title: 'Matemáticas',
      icon: moduleIcons.mathematics,
      color: 'var(--secondary-blue)',
      progress: 80,
      description: 'Álgebra, geometría y cálculo',
      path: '/mathematics',
    },
    {
      id: 'technology',
      title: 'Tecnología',
      icon: moduleIcons.technology,
      color: 'var(--medium-gray)',
      progress: 45,
      description: 'Programación y robótica',
      path: '/technology',
    },
    {
      id: 'simulator',
      title: 'Simulador',
      icon: moduleIcons.simulator,
      color: 'var(--accent-green)',
      progress: 90,
      description: 'Prácticas interactivas',
      path: '/simulator',
    },
  ];

  return (
    <section className="dashboard">
      <header className="welcome-section">
        <h1>¡Bienvenido de nuevo!</h1>
        <p className="subtitle">
          Elige un módulo STEM y continúa con tu ruta de aprendizaje.
        </p>
      </header>

      <section
        className="stats-cards"
        aria-label="Resumen de tu actividad en la plataforma"
      >
        <article className="stat-card">
          <div className="stat-icon"><FaChartLine /></div>
          <div className="stat-content">
            <h3>Progreso total</h3>
            <p className="stat-value">72%</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon"><FaTrophy /></div>
          <div className="stat-content">
            <h3>Logros</h3>
            <p className="stat-value">8/15</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon"><FaCalendarDays /></div>
          <div className="stat-content">
            <h3>Sesiones esta semana</h3>
            <p className="stat-value">12</p>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon"><FaBookOpen /></div>
          <div className="stat-content">
            <h3>Lecciones completadas</h3>
            <p className="stat-value">24</p>
          </div>
        </article>
      </section>

      <section className="modules-section" aria-labelledby="modules-title">
        <div className="modules-section-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h2 id="modules-title" className="section-title mb-0">
            Tus módulos
          </h2>
          <div className="btn-group" role="group" aria-label="Filtros de módulos">
            <button type="button" className="btn btn-sm btn-outline-secondary">
              Todos
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary">
              En progreso
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary">
              Completados
            </button>
          </div>
        </div>

        <div className="modules-grid">
          {modules.map((module) => (
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
                      <span>Progreso</span>
                      <span>{module.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${module.progress}%`,
                          backgroundColor: module.color,
                        }}
                      ></div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="continue-btn btn btn-sm btn-primary"
                  >
                    Continuar
                  </button>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
};

export default Dashboard;