import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import ProtectedRoute from './components/common/ProtectedRoute.tsx';
import Layout from './components/Layout/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import PhysicsPage from './pages/PhysicsPage.tsx';
import MathematicsPage from './pages/MathematicsPage.tsx';
import TechnologyPage from './pages/TechnologyPage.tsx';
import ProgressPage from './pages/ProgressPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import AdminPanel from './pages/AdminPanel.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

// Carga diferida: el simulador 3D trae three.js/Rapier/recharts, que no deben
// engordar el bundle inicial de las demás páginas.
const SimulatorPage = lazy(() => import('./pages/SimulatorPage.tsx'));

const App: React.FC = () => {
  return (
    <UserProvider>
      <NotificationProvider>
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
              <Route
                path="simulator"
                element={
                  <Suspense fallback={<div className="module-page">Cargando simulador…</div>}>
                    <SimulatorPage />
                  </Suspense>
                }
              />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Rutas no encontradas vuelven al login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </UserProvider>
  );
};

export default App;