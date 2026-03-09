import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card.tsx';
import Button from '../common/Button.tsx';
import QuizComponent from './QuizComponent.tsx';
import './ModuleStyles.css';

interface MathSection {
  id: string;
  title: string;
  content: string;
  formulas: string[];
  problems: string[];
}

const MathematicsModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('algebra');
  const [showQuiz, setShowQuiz] = useState<boolean>(false);

  const sections: MathSection[] = [
    {
      id: 'algebra',
      title: 'Álgebra Básica',
      content: 'El álgebra es la rama de las matemáticas que estudia las estructuras, las relaciones y las cantidades. Se utiliza para resolver ecuaciones y representar relaciones matemáticas.',
      formulas: ['ax² + bx + c = 0', 'x = [-b ± √(b² - 4ac)] / 2a'],
      problems: ['Resuelve: 2x + 5 = 15', 'Factoriza: x² - 4']
    },
    {
      id: 'geometry',
      title: 'Geometría',
      content: 'La geometría estudia las propiedades y las medidas de las figuras en el plano o en el espacio. Incluye puntos, líneas, planos, ángulos y figuras geométricas.',
      formulas: ['A = πr²', 'V = (4/3)πr³', 'c² = a² + b²'],
      problems: ['Calcula el área de un círculo con radio 5cm', 'Encuentra la hipotenusa de un triángulo con catetos 3 y 4']
    },
    {
      id: 'calculus',
      title: 'Cálculo Diferencial',
      content: 'El cálculo diferencial se ocupa del estudio de las tasas de cambio. La derivada representa la pendiente de la tangente a la curva de una función en un punto dado.',
      formulas: ['dy/dx = lim(h→0) [f(x+h) - f(x)]/h', '∫f(x)dx = F(x) + C'],
      problems: ['Deriva: f(x) = 3x² + 2x - 1', 'Integra: ∫2x dx']
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title">Módulo de Matemáticas 🧮</h1>
      </div>

      <article className="module-intro">
        <h2>Introducción al módulo</h2>
        <p>
          Este módulo reúne lecciones de álgebra, geometría y cálculo pensadas para que avances
          paso a paso y domines los números y las formas. Primero lee la explicación general y,
          después, utiliza los botones de lecciones para cambiar de tema mientras ves el contenido
          interactivo y los ejemplos resueltos en el panel de la derecha.
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
                {section.id === 'algebra' && '📊'}
                {section.id === 'geometry' && '📐'}
                {section.id === 'calculus' && '📈'}
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
              🧩 Ejercicios interactivos
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowQuiz(true)}
              fullWidth
            >
              ❓ Evaluación
            </Button>
          </div>
        </div>

        <div className="main-content">
          <Card color={'var(--secondary-blue)'}>
            <div className="section-content">
              <h2>{currentSection?.title}</h2>
              <div className="content-body">
                <p>{currentSection?.content}</p>
                
                <div className="formulas-section">
                  <h4>📐 Fórmulas Clave</h4>
                  {currentSection?.formulas.map((formula, index) => (
                    <div 
                      key={index} 
                      className="formula-box"
                    >
                      <code>{formula}</code>
                    </div>
                  ))}
                </div>
                
                <div className="examples-section">
                  <h4>💡 Problemas Resueltos</h4>
                  {currentSection?.problems.map((problem, index) => (
                    <div key={index} className="problem-box">
                      <p><strong>Problema {index + 1}:</strong> {problem}</p>
                      <button className="show-solution-btn">
                        Ver Solución
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="practice-section">
                <h4>✏️ Práctica Rápida</h4>
                <div className="practice-problem">
                  <p>Resuelve: 3(x - 2) = 15</p>
                  <input type="text" placeholder="Tu respuesta..." className="answer-input" />
                  <Button variant="primary" size="small">
                    Verificar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showQuiz && (
        <QuizComponent 
          module="mathematics"
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  );
};

export default MathematicsModule;