import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHouse, FaChartLine, FaUser, FaGear } from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { moduleIcons } from '../../Utils/moduleIcons';
import logo from '../../assets/logo.png';
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
  const { isTeacherOrAdmin } = useUser();

  const menuItems: MenuItem[] = [
    { path: '/dashboard', icon: <FaHouse />, label: 'Inicio' },
    { path: '/physics', icon: moduleIcons.physics, label: 'Ciencia' },
    { path: '/mathematics', icon: moduleIcons.mathematics, label: 'Matemáticas' },
    { path: '/technology', icon: moduleIcons.technology, label: 'Tecnología' },
    { path: '/simulator', icon: moduleIcons.simulator, label: 'Simulador' },
    { path: '/progress', icon: <FaChartLine />, label: 'Progreso' },
    { path: '/profile', icon: <FaUser />, label: 'Perfil' },
    // Solo visible para profesores o administradores.
    ...(isTeacherOrAdmin ? [{ path: '/admin', icon: <FaGear />, label: 'Admin' }] : []),
  ];

  return (
    <nav
      className={`sidebar ${isOpen ? 'open' : 'closed'}`}
      aria-label="Navegación principal de módulos"
    >
      <div className="sidebar-header">
        <div className="logo">
          <img src={logo} alt="FisioMathBoth" className="logo-image" />
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
