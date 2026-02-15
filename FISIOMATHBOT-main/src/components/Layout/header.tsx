import React from 'react';
import { FaSearch, FaBell, FaUserCircle, FaBars } from 'react-icons/fa';
import './header.css';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <FaBars />
        </button>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar lecciones, quizzes..." 
            className="search-input"
          />
        </div>
      </div>
      
      <div className="header-right">
        <button className="notification-btn">
          <FaBell />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-profile">
          <FaUserCircle className="user-avatar" />
          <div className="user-info">
            <span className="user-name">Estudiante</span>
            <span className="user-grade">Grado 10</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;