import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaQuestionCircle } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import { findUserByEmail } from '../data/users';
import logo from '../assets/logo.png';
import './AuthPages.css';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState<LoginFormData>({ 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validación básica
    if (!formData.email || !formData.password) {
      setError('Email y contraseña son obligatorios');
      setLoading(false);
      return;
    }

    try {
      // TODO: Integrar con servicio de autenticación del backend
      // const response = await authService.login(formData);
      // if (response.success) {
      //   navigate('/dashboard');
      // }

      // Por ahora, se resuelve el rol contra una lista de usuarios de
      // referencia (ver src/data/users.ts) y cualquier otro correo entra
      // como estudiante. Esto permite probar la vista de Admin.
      setTimeout(() => {
        const matchedUser = findUserByEmail(formData.email);
        const loggedInUser = matchedUser ?? {
          id: `guest-${Date.now()}`,
          name: formData.email.split('@')[0],
          email: formData.email,
          role: 'student' as const,
        };
        login(loggedInUser);
        addNotification({
          title: 'Sesión iniciada',
          message: `Bienvenido, ${loggedInUser.name}`,
          kind: 'success',
        });
        navigate('/dashboard');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus datos e intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <img src={logo} alt="FisioMathBoth" className="auth-logo" />
          <h1>FisioMathBot</h1>
          <p>Plataforma STEM para estudiantes</p>
        </div>

        <Card className="auth-card">
          <div className="auth-form-content">
            <h2 className="auth-title">Acceder</h2>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  disabled={loading}
                  className="auth-input"
                  required
                />
              </div>

              <div className="auth-input-group">
                <label htmlFor="password">Contraseña</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                    className="auth-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    disabled={loading}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Accediendo...' : 'Acceder'}
              </Button>
            </form>

            <div className="auth-divider">
              <span>o</span>
            </div>

            <div className="auth-links">
              <Link to="/forgot-password" className="link-secondary">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="auth-footer">
              <p>¿No tienes cuenta?</p>
              <Link to="/register" className="link-primary">
                Regístrate aquí
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <button
        className="help-button"
        aria-label="Ayuda"
        title="Centro de ayuda"
      >
        <FaQuestionCircle />
      </button>
    </div>
  );
};

export default Login;
