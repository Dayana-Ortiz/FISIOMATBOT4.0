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
    { path: '/dashboard', icon: '­ƒÅá', label: 'Inicio' },
    { path: '/physics', icon: 'ÔÜø´©Å', label: 'Ciencia' },
    { path: '/mathematics', icon: '­ƒº«', label: 'Matem├íticas' },
    { path: '/technology', icon: '­ƒÆ╗', label: 'Tecnolog├¡a' },
    { path: '/simulator', icon: '­ƒÄ«', label: 'Simulador' },
    { path: '/progress', icon: '­ƒôê', label: 'Progreso' },
    { path: '/profile', icon: '­ƒæñ', label: 'Perfil' },
    { path: '/admin', icon: 'ÔÜÖ´©Å', label: 'Admin' },
  ];

  return (
    <nav
      className={`sidebar ${isOpen ? 'open' : 'closed'}`}
      aria-label="Navegaci├│n principal de m├│dulos"
    >
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">­ƒÄô</span>
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
              onClick={onToggle} // Al hacer clic en un enlace, cerramos el men├║
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
