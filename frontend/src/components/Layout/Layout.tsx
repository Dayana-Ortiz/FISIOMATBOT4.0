import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header.tsx';
import Sidebar from './Sidebar.tsx';
import Footer from './Footer.tsx';
import './Layout.css';

const Layout: React.FC = () => {
<<<<<<< HEAD
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <div className="layout">
=======
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="layout">
      {/* Backdrop (fondo oscuro) al abrir el menú en móviles o desktop */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

>>>>>>> master
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="main-content">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="content-wrapper" role="main">
          <article className="main-view" aria-label="Contenido principal de aprendizaje">
            <Outlet />
          </article>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;