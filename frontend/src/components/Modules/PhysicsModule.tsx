import React, { useState } from 'react';
import { FaBookOpen, FaArrowRight, FaGear, FaFlask, FaCircleQuestion, FaSquareRootVariable, FaNoteSticky } from 'react-icons/fa6';
import { moduleIcons } from '../../Utils/moduleIcons';
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
      title: 'Introducción a la Ciencia',
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
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title icon-inline">{moduleIcons.physics} Módulo de Ciencia</h1>
      </div>

      <article className="module-intro">
        <h2>Introducción al módulo</h2>
        <p>
          En este módulo explorarás conceptos clave de la física a través de explicaciones
          guiadas y pequeñas simulaciones. Explorarás los principios fundamentales del universo:
          lee la introducción y, luego, utiliza los botones de lecciones para profundizar en
          cada tema mientras observas los ejemplos en el panel interactivo de la derecha.
        </p>
      </article>

      <div className="module-content">
        <div className="module-panels">
          <aside className="panel left-panel">
            <div className="sidebar-sections">
              <h3>Lecciones</h3>
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`section-btn ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="section-icon">
                    {section.id === 'intro' && <FaBookOpen />}
                    {section.id === 'movement' && <FaArrowRight />}
                    {section.id === 'forces' && <FaGear />}
                  </span>
                  {section.title}
                </button>
              ))}

              <div className="action-buttons">
                <Button 
                  variant="primary" 
                  onClick={() => {}}
                  fullWidth
                >
                  <FaFlask /> Iniciar simulación
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQuiz(true)}
                  fullWidth
                >
                  <FaCircleQuestion /> Tomar quiz
                </Button>
              </div>
            </div>
          </aside>

          <aside className="panel right-panel">
            <div className="fmb-panel-header">
              <h4>Resumen científico</h4>
            </div>
            <div className="fmb-panel-body">
              <p>Sección activa: <strong>{currentSection?.title}</strong></p>
              <p>Explora conceptos con ejemplos prácticos y fórmulas clave.</p>
              <ul>
                <li>Tiempo estimado: 12 min</li>
                <li>Modalidad: explicación + práctica</li>
                <li>Requiere lectura y ejercicios breves</li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="module-detail-area">
          <Card color={'var(--primary-blue)'}>
            <div className="section-content">
              <h2>{currentSection?.title}</h2>
              <div className="content-body">
                <p>{currentSection?.content}</p>

                {currentSection?.formulas && currentSection.formulas.length > 0 && (
                  <div className="formulas-section">
                    <h4 className="icon-inline"><FaSquareRootVariable /> Fórmulas importantes</h4>
                    {currentSection.formulas.map((formula, index) => (
                      <div key={index} className="formula-box">
                        <code>{formula}</code>
                      </div>
                    ))}
                  </div>
                )}

                {currentSection?.examples && currentSection.examples.length > 0 && (
                  <div className="examples-section">
                    <h4 className="icon-inline"><FaNoteSticky /> Ejemplos Prácticos</h4>
                    {currentSection.examples.map((example, index) => (
                      <div key={index} className="example-box">
                        <p>{example}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="section-footer">
                  <Button variant="primary">
                    Marcar como Completado
                  </Button>
                  <Button variant="outline">
                    Descargar Apuntes
                  </Button>
                </div>
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
    </div>
  );
};

export default PhysicsModule;