import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header.tsx';
import Sidebar from './Sidebar.tsx';
import Footer from './Footer.tsx';
import ProgressTracker from './ProgressTracker.tsx';
import './Layout.css';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="content-wrapper">
          <main className="main-view">
            <Outlet />
          </main>
          <aside className="sidebar-right">
            <ProgressTracker />
          </aside>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;