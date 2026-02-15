import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaAtom, FaCalculator, FaLaptopCode, FaGamepad,
  FaChartLine, FaTrophy, FaCalendarAlt, FaBook 
} from 'react-icons/fa';
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
      title: 'Física', 
      icon: <FaAtom />, 
      color: '#FF6B6B',
      progress: 65,
      description: 'Movimiento, fuerzas y energía',
      path: '/physics'
    },
    { 
      id: 'mathematics', 
      title: 'Matemáticas', 
      icon: <FaCalculator />, 
      color: '#4ECDC4',
      progress: 80,
      description: 'Álgebra, geometría y cálculo',
      path: '/mathematics'
    },
    { 
      id: 'technology', 
      title: 'Tecnología', 
      icon: <FaLaptopCode />, 
      color: '#FFD166',
      progress: 45,
      description: 'Programación y robótica',
      path: '/technology'
    },
    { 
      id: 'simulator', 
      title: 'Simulador', 
      icon: <FaGamepad />, 
      color: '#06D6A0',
      progress: 90,
      description: 'Prácticas interactivas',
      path: '/simulator'
    },
  ];

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1>¡Bienvenido de nuevo! 👋</h1>
        <p className="subtitle">Continúa tu aprendizaje en los módulos educativos</p>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>Progreso Total</h3>
            <p className="stat-value">72%</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaTrophy />
          </div>
          <div className="stat-content">
            <h3>Logros</h3>
            <p className="stat-value">8/15</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>Sesiones esta semana</h3>
            <p className="stat-value">12</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaBook />
          </div>
          <div className="stat-content">
            <h3>Lecciones completadas</h3>
            <p className="stat-value">24</p>
          </div>
        </div>
      </div>

      <section className="modules-section">
        <h2 className="section-title">Tus Módulos</h2>
        <div className="modules-grid">
          {modules.map((module) => (
            <Link key={module.id} to={module.path} className="module-card-link">
              <div className="module-card" style={{ borderTop: `4px solid ${module.color}` }}>
                <div className="module-header">
                  <div className="module-icon" style={{ backgroundColor: module.color }}>
                    {module.icon}
                  </div>
                  <h3>{module.title}</h3>
                </div>
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
                        backgroundColor: module.color 
                      }}
                    ></div>
                  </div>
                </div>
                <button className="continue-btn">Continuar</button>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;