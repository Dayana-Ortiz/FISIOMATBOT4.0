import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaAtom, FaCalculator, FaLaptopCode, 
  FaGamepad, FaChartLine, FaUserGraduate, FaCog 
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
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🎓</span>
          {isOpen && <span className="logo-text">PGC OFI</span>}
        </div>
        <button className="toggle-btn" onClick={onToggle}>
          {isOpen ? '‹' : '›'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {isOpen && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;