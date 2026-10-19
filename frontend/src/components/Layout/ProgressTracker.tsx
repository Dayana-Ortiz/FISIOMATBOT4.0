import React from 'react';
import { FaChartColumn } from 'react-icons/fa6';
import { moduleIcons } from '../../Utils/moduleIcons';
import type { MyProgress } from '../../services/progressService';
import { ModuleType } from '../../types';
import './ProgressTracker.css';

export const MODULE_META: { code: ModuleType; name: string; icon: React.ReactNode; color: string }[] = [
  { code: 'physics', name: 'Ciencia', icon: moduleIcons.physics, color: 'var(--primary-blue)' },
  { code: 'mathematics', name: 'Matemáticas', icon: moduleIcons.mathematics, color: 'var(--secondary-blue)' },
  { code: 'technology', name: 'Tecnología', icon: moduleIcons.technology, color: 'var(--medium-gray)' },
  { code: 'simulator', name: 'Simulador', icon: moduleIcons.simulator, color: 'var(--accent-green)' },
];

interface ProgressTrackerProps {
  progress: MyProgress | null;
  loading?: boolean;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progress, loading }) => {
  const overall = progress?.overall.percent ?? 0;

  return (
    <div className="progress-tracker">
      <h3 className="tracker-title icon-inline">
        <FaChartColumn /> Tu progreso
      </h3>

      <div className="overall-progress">
        <div className="progress-header">
          <span>Progreso General</span>
          <span className="progress-percent">{loading ? '—' : `${overall}%`}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${overall}%` }}></div>
        </div>
      </div>

      <div className="modules-progress">
        <h4>Progreso por Módulo</h4>
        {MODULE_META.map((module) => {
          const percent = progress?.modules.find((m) => m.code === module.code)?.percent ?? 0;
          return (
            <div key={module.code} className="module-item">
              <div className="module-info">
                <span className="module-icon" style={{ color: module.color }}>
                  {module.icon}
                </span>
                <span className="module-name">{module.name}</span>
                <span className="module-percent">{loading ? '—' : `${percent}%`}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: module.color
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
