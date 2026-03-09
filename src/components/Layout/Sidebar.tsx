import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaAtom,
  FaCalculator,
  FaLaptopCode,
  FaGamepad,
  FaChartLine,
  FaUserGraduate,
  FaCog,
} from 'react-icons/fa';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const menuItems: MenuItem[] = [
    { path: '/dashboard', icon: <FaHome />, label: 'Inicio' },
    { path: '/physics', icon: <FaAtom />, label: 'Física' },
    { path: '/mathematics', icon: <FaCalculator />, label: 'Matemáticas' },
    { path: '/technology', icon: <FaLaptopCode />, label: 'Tecnología' },
    { path: '/simulator', icon: <FaGamepad />, label: 'Simulador' },
    { path: '/progress', icon: <FaChartLine />, label: 'Progreso' },
    { path: '/profile', icon: <FaUserGraduate />, label: 'Perfil' },
    { path: '/admin', icon: <FaCog />, label: 'Admin' },
  ];

  return (
    <nav
      className={`sidebar ${isOpen ? 'open' : 'closed'}`}
      aria-label="Navegación principal de módulos"
    >
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🎓</span>
          {isOpen && <span className="logo-text">FisioMathBoth</span>}
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
            >
              <span className="nav-icon">{item.icon}</span>
              {isOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
