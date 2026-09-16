import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaUserCircle, FaBars } from 'react-icons/fa';
import {
  FaUser,
  FaGear,
  FaRightFromBracket,
  FaCircleInfo,
  FaCircleCheck,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import { useUser } from '../../context/UserContext';
import { useNotifications, formatRelativeTime, NotificationKind } from '../../context/NotificationContext';
import './header.css';

interface HeaderProps {
  onMenuToggle: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Estudiante',
  teacher: 'Profesor',
  admin: 'Administrador',
};

const NOTIFICATION_ICONS: Record<NotificationKind, React.ReactNode> = {
  info: <FaCircleInfo />,
  success: <FaCircleCheck />,
  warning: <FaTriangleExclamation />,
};

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useUser();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header shadow-sm ${scrolled ? 'scrolled' : ''}`}>
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
        <div className="dropdown">
          <button
            className="notification-btn position-relative"
            type="button"
            id="notificationsMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            aria-label="Ver notificaciones"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          <div
            className="dropdown-menu dropdown-menu-end notifications-menu"
            aria-labelledby="notificationsMenuButton"
          >
            <div className="notifications-header">
              <span>Notificaciones</span>
              {unreadCount > 0 && (
                <button type="button" className="mark-read-btn" onClick={markAllRead}>
                  Marcar todas como leídas
                </button>
              )}
            </div>
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <p className="notifications-empty">No tienes notificaciones por ahora.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`notification-item ${n.read ? '' : 'unread'}`}>
                    <span className={`notification-icon kind-${n.kind}`}>
                      {NOTIFICATION_ICONS[n.kind]}
                    </span>
                    <div className="notification-body">
                      <span className="notification-title">{n.title}</span>
                      <span className="notification-message">{n.message}</span>
                      <span className="notification-time">{formatRelativeTime(n.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

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
              <span className="user-name">{user?.name ?? 'Invitado'}</span>
              <span className="user-grade">
                {user ? ROLE_LABELS[user.role] ?? user.role : 'Sin sesión'}
              </span>
            </div>
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="userMenuButton"
          >
            <li>
              <button className="dropdown-item" type="button" onClick={() => navigate('/profile')}>
                <FaUser /> Perfil
              </button>
            </li>
            <li>
              <button className="dropdown-item" type="button">
                <FaGear /> Configuración
              </button>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button className="dropdown-item" type="button" onClick={handleLogout}>
                <FaRightFromBracket /> Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
