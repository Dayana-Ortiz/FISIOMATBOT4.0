import React from 'react';
import { FaHeart, FaGithub } from 'react-icons/fa';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>PGC OFI</h4>
          <p>Plataforma Educativa para Grados 9, 10 y 11</p>
        </div>
        
        <div className="footer-section">
          <h4>Módulos</h4>
          <ul>
            <li>Física</li>
            <li>Matemáticas</li>
            <li>Tecnología</li>
            <li>Simulador</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>
          © 2024 PGC OFI - Desarrollado con <FaHeart className="heart-icon" />
        </p>
      </div>
    </footer>
  );
};

export default Footer;