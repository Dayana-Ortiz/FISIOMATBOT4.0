import React from 'react';
import { FaChartLine, FaFire, FaCalculator, FaLaptop, FaGamepad } from 'react-icons/fa';
import './ProgressTracker.css';

interface ModuleProgress {
  name: string;
  progress: number;
  icon: React.ReactNode;
  color: string;
}

const ProgressTracker: React.FC = () => {
  const modules: ModuleProgress[] = [
    { name: 'Física', progress: 65, icon: <FaFire />, color: '#FF6B6B' },
    { name: 'Matemáticas', progress: 80, icon: <FaCalculator />, color: '#4ECDC4' },
    { name: 'Tecnología', progress: 45, icon: <FaLaptop />, color: '#FFD166' },
    { name: 'Simulador', progress: 90, icon: <FaGamepad />, color: '#06D6A0' },
  ];

  return (
    <div className="progress-tracker">
      <h3 className="tracker-title">
        <FaChartLine /> Tu Progreso
      </h3>
      
      <div className="overall-progress">
        <div className="progress-header">
          <span>Progreso General</span>
          <span className="progress-percent">70%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '70%' }}></div>
        </div>
      </div>
      
      <div className="modules-progress">
        <h4>Progreso por Módulo</h4>
        {modules.map((module, index) => (
          <div key={index} className="module-item">
            <div className="module-info">
              <span className="module-icon" style={{ color: module.color }}>
                {module.icon}
              </span>
              <span className="module-name">{module.name}</span>
              <span className="module-percent">{module.progress}%</span>
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
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;