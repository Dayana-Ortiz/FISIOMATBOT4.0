import React from 'react';
import { FaHeart } from 'react-icons/fa';
// TypeScript does not have a declaration for CSS side-effect imports.
// @ts-expect-error CSS is handled by the bundler at runtime.
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content container">
        <section className="footer-section">
          <h4>FisioMathBoth</h4>
          <p>Plataforma educativa STEM para grado 11.</p>
        </section>

        <section className="footer-section">
          <h4>Módulos</h4>
          <ul>
            <li>Física</li>
            <li>Matemáticas</li>
            <li>Tecnología</li>
            <li>Simulador</li>
          </ul>
        </section>

        <section className="footer-section">
          <h4>Contacto</h4>
          <p>¿Dudas o sugerencias? Escríbenos y mejora tu experiencia.</p>
        </section>
      </div>

      <div className="footer-bottom">
        <p>
          © 2024 FisioMathBoth · Diseñado para estudiantes STEM{' '}
          <span className="heart-icon"><FaHeart aria-hidden="true" /></span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;