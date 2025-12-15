import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import PhysicsPage from './pages/PhysicsPage.tsx';
import MathematicsPage from './pages/MatemathiscsPage.tsx';
import TechnologyPage from './pages/TechnologyPage.tsx';
import SimulatorPage from './pages/SimulatorPage.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="physics" element={<PhysicsPage />} />
          <Route path="mathematics" element={<MathematicsPage />} />
          <Route path="technology" element={<TechnologyPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;