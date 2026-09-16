import React from 'react';
import { FaChartColumn } from 'react-icons/fa6';
import { moduleIcons } from '../../Utils/moduleIcons';
import './ProgressTracker.css';

interface ModuleProgress {
  name: string;
  progress: number;
  icon: React.ReactNode;
  color: string;
}

const ProgressTracker: React.FC = () => {
  const modules: ModuleProgress[] = [
    { name: 'Ciencia', progress: 65, icon: moduleIcons.physics, color: 'var(--primary-blue)' },
    { name: 'Matemáticas', progress: 80, icon: moduleIcons.mathematics, color: 'var(--secondary-blue)' },
    { name: 'Tecnología', progress: 45, icon: moduleIcons.technology, color: 'var(--medium-gray)' },
    { name: 'Simulador', progress: 90, icon: moduleIcons.simulator, color: 'var(--accent-green)' },
  ];

  return (
    <div className="progress-tracker">
      <h3 className="tracker-title icon-inline">
        <FaChartColumn /> Tu progreso
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