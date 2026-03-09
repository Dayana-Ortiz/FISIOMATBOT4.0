import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaFlask, FaCalculator, FaQuestionCircle, FaPlay } from 'react-icons/fa';
import Card from '../common/Card.tsx';
import Button from '../common/Button.tsx';
import QuizComponent from './QuizComponent.tsx';
import './ModuleStyles.css';

interface Section {
  id: string;
  title: string;
  content: string;
  formulas?: string[];
  examples?: string[];
}

const PhysicsModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [showQuiz, setShowQuiz] = useState<boolean>(false);

  const sections: Section[] = [
    {
      id: 'intro',
      title: 'Introducción a la Física',
      content: 'La física es la ciencia que estudia las propiedades de la materia y la energía, y las relaciones entre ellas. Se basa en la observación y experimentación para formular leyes que describen el comportamiento del universo.',
      formulas: ['F = m × a', 'v = d/t'],
      examples: ['Un carro que acelera a 2 m/s² con masa de 1000kg tiene una fuerza de 2000N']
    },
    {
      id: 'movement',
      title: 'Movimiento Rectilíneo',
      content: 'El movimiento rectilíneo uniforme (MRU) describe el movimiento de un cuerpo que se desplaza en línea recta a velocidad constante. La posición del objeto cambia uniformemente con el tiempo.',
      formulas: ['x = x₀ + v·t', 'v = constante'],
      examples: ['Un auto que viaja a 60 km/h recorrerá 120 km en 2 horas']
    },
    {
      id: 'forces',
      title: 'Leyes de Newton',
      content: 'Las tres leyes de Newton describen la relación entre las fuerzas que actúan sobre un cuerpo y el movimiento de ese cuerpo. Son fundamentales para entender la mecánica clásica.',
      formulas: ['ΣF = m·a', 'F₁₂ = -F₂₁'],
      examples: ['Para empujar un objeto pesado, necesitas aplicar una fuerza mayor que la fricción']
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <section className="module-container">
      <article
        className="module-header"
        aria-label="Introducción al módulo de Física"
      >
        <h1 className="module-title">📚 Módulo Física</h1>
        <p className="module-description">
          Conoce los conceptos básicos de la física mediante explicaciones,
          ejemplos y materiales de apoyo antes de experimentar con actividades
          y simulaciones.
        </p>
      </article>

      <div className="module-content">
        <div className="sidebar-sections">
          <h3>Lecciones</h3>
          {sections.map((section) => (
            <button
              key={section.id}
              className={`section-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="section-icon">
                {section.id === 'intro' && <FaBook />}
                {section.id === 'movement' && <FaPlay />}
                {section.id === 'forces' && <FaFlask />}
              </span>
              {section.title}
            </button>
          ))}
          
          <div className="action-buttons">
            <Button 
              variant="primary" 
              icon={<FaFlask />}
              onClick={() => {}}
              fullWidth
            >
              Iniciar Simulación
            </Button>
            <Button 
              variant="outline" 
              icon={<FaQuestionCircle />}
              onClick={() => setShowQuiz(true)}
              fullWidth
            >
              Tomar Quiz
            </Button>
          </div>
        </div>

        <div className="main-content">
          <Card color={'var(--primary-blue)'}>
            <div className="section-content">
              <h2>{currentSection?.title}</h2>
              <div className="content-body">
                <p>{currentSection?.content}</p>
                
                {currentSection?.formulas && currentSection.formulas.length > 0 && (
                  <div className="formulas-section">
                    <h4><FaCalculator /> Fórmulas Importantes</h4>
                    {currentSection.formulas.map((formula, index) => (
                      <div key={index} className="formula-box">
                        <code>{formula}</code>
                      </div>
                    ))}
                  </div>
                )}
                
                {currentSection?.examples && currentSection.examples.length > 0 && (
                  <div className="examples-section">
                    <h4>📝 Ejemplos Prácticos</h4>
                    {currentSection.examples.map((example, index) => (
                      <div key={index} className="example-box">
                        <p>{example}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="section-footer">
                <Button variant="primary">
                  Marcar como Completado
                </Button>
                <Button variant="outline">
                  Descargar Apuntes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showQuiz && (
        <QuizComponent 
          module="physics"
          onClose={() => setShowQuiz(false)}
        />
      )}
    </section>
  );
};

export default PhysicsModule;