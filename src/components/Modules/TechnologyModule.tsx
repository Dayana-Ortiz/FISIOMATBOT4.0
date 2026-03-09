import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCode, FaRobot, FaDatabase, FaNetworkWired, FaQuestionCircle } from 'react-icons/fa';
import Card from '../common/Card.tsx';
import Button from '../common/Button.tsx';
import QuizComponent from './QuizComponent.tsx';
import './ModuleStyles.css';

interface TechSection {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  concepts: string[];
}

const TechnologyModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('programming');
  const [showQuiz, setShowQuiz] = useState<boolean>(false);

  const sections: TechSection[] = [
    {
      id: 'programming',
      title: 'Programación Básica',
      content: 'La programación es el proceso de crear instrucciones para que una computadora realice tareas específicas. Se utilizan lenguajes de programación como JavaScript, Python o Java.',
      codeExample: 'function saludar() {\n  console.log("Hola Mundo");\n}',
      concepts: ['Variables', 'Condicionales', 'Bucles', 'Funciones']
    },
    {
      id: 'robotics',
      title: 'Robótica Educativa',
      content: 'La robótica combina mecánica, electrónica y programación para crear máquinas inteligentes. Se utiliza en educación para desarrollar pensamiento lógico y creativo.',
      concepts: ['Sensores', 'Actuadores', 'Microcontroladores', 'Programación de robots']
    },
    {
      id: 'networks',
      title: 'Redes y Comunicaciones',
      content: 'Las redes permiten la comunicación entre dispositivos. Internet es la red más grande del mundo, conectando millones de computadoras globalmente.',
      concepts: ['Protocolos TCP/IP', 'WiFi y Ethernet', 'Seguridad de redes', 'Topologías']
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <section className="module-container">
      <article
        className="module-header"
        aria-label="Introducción al módulo de Tecnología"
      >
        <h1 className="module-title">💻 Módulo Tecnología</h1>
        <p className="module-description">
          Introducción teórica y ejemplos prácticos sobre programación, robótica
          y redes para comprender los conceptos antes de interactuar con las
          actividades.
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
                {section.id === 'programming' && <FaCode />}
                {section.id === 'robotics' && <FaRobot />}
                {section.id === 'networks' && <FaNetworkWired />}
              </span>
              {section.title}
            </button>
          ))}
          
          <div className="action-buttons">
            <Button 
              variant="primary" 
              icon={<FaCode />}
              onClick={() => {}}
              fullWidth
            >
              Editor de Código
            </Button>
            <Button 
              variant="outline" 
              icon={<FaQuestionCircle />}
              onClick={() => setShowQuiz(true)}
              fullWidth
            >
              Test de Conocimiento
            </Button>
          </div>
        </div>

        <div className="main-content">
          <Card color={'var(--medium-gray)'}>
            <div className="section-content">
              <h2>{currentSection?.title}</h2>
              <div className="content-body">
                <p>{currentSection?.content}</p>
                
                {currentSection?.codeExample && (
                  <div className="code-section">
                    <h4><FaCode /> Ejemplo de Código</h4>
                    <pre className="code-block">
                      <code>{currentSection.codeExample}</code>
                    </pre>
                    <Button variant="outline" size="small">
                      Ejecutar Código
                    </Button>
                  </div>
                )}
                
                <div className="concepts-section">
                  <h4>🔧 Conceptos Clave</h4>
                  <div className="concepts-grid">
                    {currentSection?.concepts.map((concept, index) => (
                      <div key={index} className="concept-chip">
                        {concept}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="hands-on-section">
                  <h4>🛠️ Actividad Práctica</h4>
                  <div className="activity-box">
                    <p><strong>Desafío:</strong> Crea una función que calcule el área de un rectángulo</p>
                    <textarea 
                      className="code-editor"
                      placeholder="Escribe tu código aquí..."
                      rows={6}
                    />
                    <div className="editor-actions">
                      <Button variant="primary">
                        Probar Código
                      </Button>
                      <Button variant="outline">
                        Ver Solución
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showQuiz && (
        <QuizComponent 
          module="technology"
          onClose={() => setShowQuiz(false)}
        />
      )}
    </section>
  );
};

export default TechnologyModule;