import React from 'react';
import Simulator3DModule from '../components/Simulator3D/Simulator3DModule.tsx';
import './ModulePage.css';

const SimulatorPage: React.FC = () => {
  return (
    <div className="module-page">
      <Simulator3DModule />
    </div>
  );
};

export default SimulatorPage;