import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaRedo, FaChartBar, FaQuestionCircle } from 'react-icons/fa';
import Card from '../common/Card.tsx';
import Button from '../common/Button.tsx';
import QuizComponent from './QuizComponent.tsx';
import './ModuleStyles.css';

interface Simulation {
  id: string;
  title: string;
  description: string;
  parameters: string[];
}

const SimulatorModule: React.FC = () => {
  const [activeSimulation, setActiveSimulation] = useState<string>('physics');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationTime, setSimulationTime] = useState<number>(0);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);

  const simulations: Simulation[] = [
    {
      id: 'physics',
      title: 'Simulador de Movimiento',
      description: 'Observa c├│mo cambia el movimiento de un objeto al variar su velocidad, masa y ├íngulo de lanzamiento.',
      parameters: ['Velocidad inicial', '├üngulo de lanzamiento', 'Gravedad', 'Masa']
    },
    {
      id: 'math',
      title: 'Gr├ífico de Funciones',
      description: 'Visualiza funciones matem├íticas en tiempo real y analiza su comportamiento.',
      parameters: ['Funci├│n f(x)', 'Rango de x', 'Color de gr├ífica', 'Espesor de l├¡nea']
    },
    {
      id: 'circuit',
      title: 'Simulador de Circuitos',
      description: 'Construye circuitos el├®ctricos virtuales y mide voltaje, corriente y resistencia.',
      parameters: ['Resistencia', 'Voltaje', 'Corriente', 'Tipo de componente']
    }
  ];

  const currentSimulation = simulations.find(s => s.id === activeSimulation);

  return (
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title">­ƒÄ« M├│dulo Simulador</h1>
      </div>

      <article className="module-intro">
        <h2>Introducci├│n al m├│dulo</h2>
        <p>
          En el m├│dulo simulador podr├ís experimentar con distintos escenarios de f├¡sica,
          matem├íticas y circuitos el├®ctricos. Primero selecciona una simulaci├│n en la columna
          de la izquierda y, luego, utiliza los controles del panel derecho para ajustar
          par├ímetros y observar c├│mo cambia el comportamiento en el ├írea visual. Es una forma
          de aprender experimentando con simulaciones interactivas.
        </p>
      </article>

      <div className="module-content fmb-inmersive-layout">
        {/* Capa Principal: Simulaci├│n */}
        <div className="simulation-canvas-area">
          <div className={`simulation-visualization inmersive-view ${activeSimulation}-bg`}>
            {activeSimulation === 'physics' && (
              <div className="physics-simulation">
                <div className="projectile-trajectory">
                  <div className="projectile" style={{ 
                    left: `${simulationTime * 10}%`,
                    bottom: `${Math.sin(simulationTime * 0.5) * 50}%`
                  }} />
                </div>
              </div>
            )}
            
            {activeSimulation === 'math' && (
              <div className="math-simulation">
                <div className="graph-container">
                  <div className="graph-axis">
                    <div className="graph-line" style={{ 
                      height: '2px',
                      width: '100%',
                      background: 'var(--primary-blue)'
                    }} />
                  </div>
                </div>
              </div>
            )}
            
            {activeSimulation === 'circuit' && (
              <div className="circuit-simulation">
                <div className="circuit-diagram">
                  <div className="battery">­ƒöï</div>
                  <div className="wire">ÔöüÔöüÔöüÔöü</div>
                  <div className="resistor">ÔÅÜ</div>
                  <div className="wire">ÔöüÔöüÔöüÔöü</div>
                  <div className="led">­ƒÆí</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel de Control Fisiomatbot: Flotante Derecho */}
        <aside className="fmb-floating-panel">
          <header className="fmb-panel-header">
            <h4><FaChartBar /> Par├ímetros</h4>
          </header>
          
          <div className="fmb-panel-body">
            <div className="fmb-control-list">
              <div className="fmb-check-item">
                <input type="checkbox" id="grid" defaultChecked />
                <label htmlFor="grid">Ver Cuadr├¡cula</label>
              </div>
              <div className="fmb-check-item">
                <input type="checkbox" id="vectors" />
                <label htmlFor="vectors">Ver Vectores</label>
              </div>
              
              <div className="fmb-divider" />

              {currentSimulation?.parameters.map((param, index) => (
                <div key={index} className="fmb-slider-group">
                  <label>{param}</label>
                  <div className="fmb-slider-wrapper">
                    <input type="range" min="0" max="100" className="fmb-brand-slider" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Controles de Acci├│n: Barra Central Inferior */}
        <div className="fmb-action-bar">
          <div className="fmb-playback-controls">
            <button 
              className="fmb-round-btn primary-action"
              onClick={() => setIsRunning(!isRunning)}
              title={isRunning ? 'Pausar' : 'Iniciar'}
            >
              {isRunning ? <FaPause /> : <FaPlay />}
            </button>
            <button 
              className="fmb-round-btn secondary-action"
              onClick={() => setSimulationTime(0)}
              title="Reiniciar"
            >
              <FaRedo />
            </button>
            <div className="fmb-speed-selector">
              <button className="speed-tab active">Normal</button>
              <button className="speed-tab">Lento</button>
            </div>
          </div>
        </div>

        {/* Navegaci├│n Modular: Barra Inferior Fisiomatbot */}
        <nav className="fmb-mode-navigation">
          {simulations.map((sim) => (
            <button
              key={sim.id}
              className={`fmb-mode-btn ${activeSimulation === sim.id ? 'active' : ''}`}
              onClick={() => setActiveSimulation(sim.id)}
            >
              <div className="fmb-mode-icon">
                {sim.id === 'physics' && 'ÔÜí'}
                {sim.id === 'math' && '­ƒôê'}
                {sim.id === 'circuit' && '­ƒöî'}
              </div>
              <span className="fmb-mode-name">{sim.title}</span>
            </button>
          ))}
          <div className="fmb-nav-separator" />
          <button 
            className="fmb-mode-btn quiz-accent"
            onClick={() => setShowQuiz(true)}
          >
            <div className="fmb-mode-icon"><FaQuestionCircle /></div>
            <span className="fmb-mode-name">Quiz</span>
          </button>
        </nav>
      </div>

      {showQuiz && (
        <QuizComponent 
          module="simulator"
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  );
};

export default SimulatorModule;
