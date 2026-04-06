import React, { useState, useRef } from 'react';
//import { authService } from '../services/authService';
//import eduboticLogo from '../assets/images/edubotic.svg';
import axios from 'axios';
import { BsQuestionCircleFill } from 'react-icons/bs';
//import HelpModal from '../components/HelpModal';
//import MaskedPasswordInput from '../components/MaskedPasswordInput';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    role: 'estudiante',
    email: '',
    institutionNit: ''
  });
  const passwordInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nitError, setNitError] = useState(''); // Nuevo estado para errores del NIT
  const [showHelpModal, setShowHelpModal] = useState(false); // Estado para controlar la visibilidad del modal

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Nueva función para validar el NIT de la institución con el backend
  const validateInstitutionNit = async (nit) => {
    if (!nit || nitError) {
      setError('Por favor, ingresa un NIT de institución válido.');
      return null; // Indica que la validación falló o el NIT es inválido en el frontend
    }
    try {
      const response = await axios.post(`${API_URL}/institutions/validate-nit`, { nit });
      if (response.data.success) {
        return response.data.data.institutionId; // Devolver el ID si es válido
      } else {
        setError(response.data.message || 'Institución no encontrada. Ingresa el NIT correcto o pídele a tu profesor que cree la institución.');
        return null;
      }
    } catch (err) {
      console.error('Error al validar NIT de institución:', err);
      setError(err.response?.data?.message || 'Error de red o del servidor al validar la institución.');
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let currentNitError = '';

    if (name === 'institutionNit') {
      newValue = value.replace(/[^0-9]/g, '');
      if (newValue.length > 15) {
        newValue = newValue.slice(0, 15);
        currentNitError = 'El NIT no puede tener más de 15 dígitos.';
      }
    }

    setNitError(currentNitError);
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setError('');
  };

  // La función handleRoleSelect se elimina ya que el rol será fijo.
  // const handleRoleSelect = (role) => {
  //   setFormData({
  //     ...formData,
  //     role: role,
  //     institutionNit: role === 'estudiante' ? formData.institutionNit : '' // Limpiar NIT si no es estudiante
  //   });
  //   setNitError(''); // Limpiar error de NIT al cambiar de rol
  // };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    const password = passwordInputRef.current?.getValue() ?? '';
    if (!formData.name || !formData.email || !password) {
      setError('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    let institutionId = null;
    institutionId = await validateInstitutionNit(formData.institutionNit);
    if (!institutionId) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        ...formData,
        password,
        institutionId
      });

      if (response.success) {
        passwordInputRef.current?.clear();
        setSuccess('¡Registro exitoso! Redirigiendo...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    let queryString = `role=${formData.role}`;

    // Ya no es condicional, siempre se valida y añade el NIT de la institución a la URL
    const institutionId = await validateInstitutionNit(formData.institutionNit);
    if (!institutionId) {
      setLoading(false);
      return; // Detener el registro si el NIT no es válido
    }
    queryString += `&institutionId=${institutionId}`;
   
    // Redirigir al backend para iniciar el flujo de autenticación de Google
    window.location.href = `${API_URL}/auth/google/init?${queryString}`;
  };

  const toggleHelpModal = () => { // Función para alternar la visibilidad del modal
    setShowHelpModal(!showHelpModal);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative"> {/* Añadir 'relative' para posicionar el botón */}
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Formulario de Registro */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-[#0052CC]">
          {/* Botón Atrás */}
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center text-[#0052CC] hover:text-[#003f99] mb-4 font-semibold font-open-sans"
          >
            ← ATRÁS
          </button>

          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4 font-montserrat">REGISTRO DE ESTUDIANTES</h2> {/* Título cambiado */}
          
          {/* Mensajes de error/éxito */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded mb-3 font-inter">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-300 text-green-600 px-4 py-3 rounded mb-3 font-inter">
              {success}
            </div>
          )}

          <div className="space-y-3">
            {/* Nombre Completo */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#0052CC] focus:outline-none font-roboto-mono"
                placeholder="NOMBRE COMPLETO"
                disabled={loading}
              />
            </div>

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

            {/* Campo NIT de la Institución (YA NO ES CONDICIONAL) */}
            {/* {formData.role === 'estudiante' && ( */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                <input
                  type="text"
                  name="institutionNit"
                  value={formData.institutionNit}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-[#0052CC] focus:outline-none font-roboto-mono"
                  placeholder="NIT DE LA INSTITUCIÓN"
                  disabled={loading}
                />
                {nitError && <p className="text-red-600 text-sm mt-1 font-inter">{nitError}</p>}
              </div>
            {/* )} */}

            {/* Botón Crear Cuenta */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full bg-[#0052CC] hover:bg-[#003f99] text-white font-bold py-3 rounded-lg transition-all font-open-sans ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'REGISTRANDO...' : 'CREAR CUENTA'}
            </button>
          </div>

          {/* Ya tienes cuenta */}
          <p className="text-center text-gray-700 mt-3 font-inter">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-[#0052CC] hover:underline font-inter">
              Inicia sesión
            </a>
          </p>

          {/* Separador */}
          <div className="flex items-center my-4">
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
          <p className="text-xs text-gray-500 text-center mt-3 font-inter">
            AL CONTINUAR ACEPTAS NUESTROS TÉRMINOS<br />
            DE USO Y POLÍTICA DE PRIVACIDAD
          </p>
        </div>

        {/* Logo Section */}
        <div className="hidden md:flex justify-center">
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

      </div>

      {/* Botón de Ayuda */}
      <button
        onClick={toggleHelpModal}
        className="fixed bottom-8 right-8 bg-[#0052CC] text-white p-3 rounded-full shadow-lg hover:bg-[#003f99] transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-opacity-75 z-50"
        aria-label="Ayuda"
      >
        <BsQuestionCircleFill className="w-8 h-8" />
      </button>

      {/* Renderizar el modal de ayuda condicionalmente */}
      {showHelpModal && <HelpModal onClose={toggleHelpModal} />}
    </div>
  );
}