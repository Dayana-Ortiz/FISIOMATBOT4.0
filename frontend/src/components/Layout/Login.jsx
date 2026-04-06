import React, { useState, useRef } from 'react';
//import { authService } from '../services/authService';
//import eduboticLogo from '../assets/images/edubotic.svg';
import { BsQuestionCircleFill } from 'react-icons/bs';
//import HelpModal from '../components/HelpModal';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import MaskedPasswordInput from '../components/MaskedPasswordInput';

export default function Login() {
  const [formData, setFormData] = useState({ email: '' });
  const passwordInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false); // Estado para controlar la visibilidad del modal de ayuda
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false); // Nuevo estado para controlar la visibilidad del modal de olvido de contraseña

  const handleChange = (e) => {
    setFormData({ email: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const password = passwordInputRef.current?.getValue() ?? '';
    if (!formData.email || !password) {
      setError('Email y contraseña son obligatorios');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login({ email: formData.email, password });
      
      if (response.success) {
        const userRole = response.data.role;
        passwordInputRef.current?.clear();

        if (userRole === 'admin') {
          window.location.href = '/admin-dashboard';
        } else if (userRole === 'profesor') {
          window.location.href = '/teacher-dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirigir al backend para iniciar el flujo de autenticación de Google
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/init`;
  };

  const toggleHelpModal = () => { // Función para alternar la visibilidad del modal de ayuda
    setShowHelpModal(!showHelpModal);
  };

  const toggleForgotPasswordModal = () => { // Nueva función para alternar la visibilidad del modal de olvido de contraseña
    setShowForgotPasswordModal(!showForgotPasswordModal);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative"> {/* Añadir 'relative' para posicionar el botón */}
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Logo Section - A la izquierda en desktop */}
        <div className="hidden md:flex justify-center order-1">
          <div className="relative">
            {/* Eliminado el div con brillo azul */}
            <div className="relative flex items-center justify-center">
              <img
                src={eduboticLogo}
                alt="EduBotic Logo"
                className="w-96 h-96 object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl order-2 border-4 border-[#0052CC]">
          {/* Botón Atrás */}
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center text-[#0052CC] hover:text-[#003f99] mb-6 font-semibold font-open-sans"
          >
            ← ATRÁS
          </button>

          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6 font-montserrat">ACCEDER</h2>
          
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded mb-4 font-inter">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#0052CC] focus:outline-none font-roboto-mono"
                placeholder="DIRECCIÓN DE CORREO"
                disabled={loading}
              />
            </div>

            {/* Contraseña: valor real solo en memoria (ref), en el DOM solo bullets (•) */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
              <MaskedPasswordInput
                ref={passwordInputRef}
                name="password"
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#0052CC] focus:outline-none font-roboto-mono"
                placeholder="CONTRASEÑA"
                disabled={loading}
              />
            </div>

            {/* Botón Acceder */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full bg-[#0052CC] hover:bg-[#003f99] text-white font-bold py-3 rounded-lg transition-all font-open-sans ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'ACCEDIENDO...' : 'ACCEDER'}
            </button>
          </div>

          {/* Olvidé mi contraseña */}
          <p className="text-center mt-4">
            <a href="#" onClick={toggleForgotPasswordModal} className="text-[#0052CC] hover:underline font-inter"> {/* Modificado el onClick */}
              OLVIDÉ MI CONTRASEÑA
            </a>
          </p>

          {/* No tienes cuenta */}
          <p className="text-center text-gray-700 mt-4 font-inter">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-[#0052CC] hover:underline font-inter">
              Regístrate aquí
            </a>
          </p>

          {/* Separador */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm font-inter">o</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Continuar con Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border-2 border-[#0052CC] text-[#0052CC] hover:bg-[#0052CC]/10 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-bold font-open-sans"
          >
            <span className="text-xl">G</span>
            <span>Continuar con Google</span>
          </button>

          {/* Términos */}
          <p className="text-xs text-gray-500 text-center mt-4 font-inter">
            AL CONTINUAR ACEPTAS NUESTROS TÉRMINOS<br />
            DE USO Y POLÍTICA DE PRIVACIDAD
          </p>
        </div>

      </div>

      {/* Botón de Ayuda */}
      <button
        onClick={toggleHelpModal}
        className="fixed bottom-8 left-8 bg-[#0052CC] text-white p-3 rounded-full shadow-lg hover:bg-[#003f99] transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-opacity-75 z-50"
        aria-label="Ayuda"
      >
        <BsQuestionCircleFill className="w-8 h-8" />
      </button>

      {/* Renderizar el modal de ayuda condicionalmente */}
      {showHelpModal && <HelpModal onClose={toggleHelpModal} />}

      {/* Renderizar el modal de olvido de contraseña condicionalmente */}
      {showForgotPasswordModal && <ForgotPasswordModal onClose={toggleForgotPasswordModal} />}
    </div>
  );
}