import React from 'react';
import { FaSearch, FaBell, FaUserCircle, FaBars } from 'react-icons/fa';
import './header.css';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="header shadow-sm">
      <div className="header-left">
        <button
          className="menu-toggle"
          onClick={onMenuToggle}
          aria-label="Abrir o cerrar menú lateral"
        >
          <FaBars />
        </button>

        <form className="search-container" role="search">
          <span className="search-icon">
            <FaSearch />
          </span>
          <input
            type="search"
            placeholder="Buscar lecciones, quizzes..."
            className="search-input form-control"
            aria-label="Buscar contenido en la plataforma"
          />
        </form>
      </div>

      <div className="header-right">
        <button
          className="notification-btn position-relative"
          aria-label="Ver notificaciones"
        >
          <FaBell />
          <span className="notification-badge">3</span>
        </button>

        <div className="dropdown">
          <button
            className="user-profile dropdown-toggle"
            type="button"
            id="userMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="user-avatar">
              <FaUserCircle />
            </span>
            <div className="user-info">
              <span className="user-name">Estudiante</span>
              <span className="user-grade">Grado 10</span>
            </div>
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="userMenuButton"
          >
            <li>
              <button className="dropdown-item" type="button">
                👤 Perfil
              </button>
            </li>
            <li>
              <button className="dropdown-item" type="button">
                ⚙️ Configuración
              </button>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button className="dropdown-item" type="button">
                🚪 Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;