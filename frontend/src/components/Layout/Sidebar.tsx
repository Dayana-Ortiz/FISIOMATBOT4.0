import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  path: string;
  icon: string;
  label: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const menuItems: MenuItem[] = [
    { path: '/dashboard', icon: '🏠', label: 'Inicio' },
    { path: '/physics', icon: '⚛️', label: 'Ciencia' },
    { path: '/mathematics', icon: '🧮', label: 'Matemáticas' },
    { path: '/technology', icon: '💻', label: 'Tecnología' },
    { path: '/simulator', icon: '🎮', label: 'Simulador' },
    { path: '/progress', icon: '📈', label: 'Progreso' },
    { path: '/profile', icon: '👤', label: 'Perfil' },
    { path: '/admin', icon: '⚙️', label: 'Admin' },
  ];

  return (
    <nav
      className={`sidebar ${isOpen ? 'open' : 'closed'}`}
      aria-label="Navegación principal de módulos"
    >
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">FisioMathBoth</span>
        </div>
      </div>

      <ul className="sidebar-nav list-unstyled">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onToggle} // Al hacer clic en un enlace, cerramos el menú
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
