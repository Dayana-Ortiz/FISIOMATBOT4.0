import React from 'react';
import SimulatorModule from '../components/Modules/SimulatorModule.tsx';
import './ModulePage.css';

const SimulatorPage: React.FC = () => {
  return (
    <div className="module-page">
      <SimulatorModule />
    </div>
  );
};

export default SimulatorPage;