import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import PhysicsPage from './pages/PhysicsPage.tsx';
import MathematicsPage from './pages/MathematicsPage.tsx';
import TechnologyPage from './pages/TechnologyPage.tsx';
import SimulatorPage from './pages/SimulatorPage.tsx';
import ProgressPage from './pages/ProgressPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Entrada raíz hacia login */}
        <Route index element={<Navigate to="/login" replace />} />

        {/* Auth Routes - sin Layout */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Main Routes - con Layout */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="physics" element={<PhysicsPage />} />
          <Route path="mathematics" element={<MathematicsPage />} />
          <Route path="technology" element={<TechnologyPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Rutas no encontradas vuelven al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;