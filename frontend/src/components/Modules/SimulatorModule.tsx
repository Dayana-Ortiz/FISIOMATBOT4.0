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
      description: 'Observa cómo cambia el movimiento de un objeto al variar su velocidad, masa y ángulo de lanzamiento.',
      parameters: ['Velocidad inicial', 'Ángulo de lanzamiento', 'Gravedad', 'Masa']
    },
    {
      id: 'math',
      title: 'Gráfico de Funciones',
      description: 'Visualiza funciones matemáticas en tiempo real y analiza su comportamiento.',
      parameters: ['Función f(x)', 'Rango de x', 'Color de gráfica', 'Espesor de línea']
    },
    {
      id: 'circuit',
      title: 'Simulador de Circuitos',
      description: 'Construye circuitos eléctricos virtuales y mide voltaje, corriente y resistencia.',
      parameters: ['Resistencia', 'Voltaje', 'Corriente', 'Tipo de componente']
    }
  ];

  const currentSimulation = simulations.find(s => s.id === activeSimulation);

  return (
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title">🎮 Módulo Simulador</h1>
      </div>

      <article className="module-intro">
        <h2>Introducción al módulo</h2>
        <p>
          En el módulo simulador podrás experimentar con distintos escenarios de física,
          matemáticas y circuitos eléctricos. Primero selecciona una simulación en la columna
          de la izquierda y, luego, utiliza los controles del panel derecho para ajustar
          parámetros y observar cómo cambia el comportamiento en el área visual. Es una forma
          de aprender experimentando con simulaciones interactivas.
        </p>
      </article>

<<<<<<< HEAD
      <div className="module-content">
        <div className="sidebar-sections">
          <h3>Simulaciones Disponibles</h3>
          {simulations.map((sim) => (
            <button
              key={sim.id}
              className={`section-btn ${activeSimulation === sim.id ? 'active' : ''}`}
              onClick={() => setActiveSimulation(sim.id)}
            >
              <span className="section-icon">
                {sim.id === 'physics' && '⚡'}
                {sim.id === 'math' && '📈'}
                {sim.id === 'circuit' && '🔌'}
              </span>
              {sim.title}
            </button>
          ))}
          
          <div className="action-buttons">
            <Button 
              variant="primary" 
              icon={<FaPlay />}
              onClick={() => setIsRunning(!isRunning)}
              fullWidth
            >
              {isRunning ? 'Pausar' : 'Iniciar'} Simulación
            </Button>
            <Button 
              variant="outline" 
              icon={<FaQuestionCircle />}
              onClick={() => setShowQuiz(true)}
              fullWidth
            >
              Cuestionario
            </Button>
          </div>
        </div>

        <div className="main-content">
          <Card color={'var(--accent-green)'}>
            <div className="simulation-container">
              <h2>{currentSimulation?.title}</h2>
              
              <div className="simulation-area">
                <div className="simulation-visualization">
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
                        <div className="battery">🔋</div>
                        <div className="wire">━━━━</div>
                        <div className="resistor">⏚</div>
                        <div className="wire">━━━━</div>
                        <div className="led">💡</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="simulation-controls">
                  <div className="control-panel">
                    <h4><FaChartBar /> Controles</h4>
                    
                    <div className="control-group">
                      <label>Tiempo: {simulationTime.toFixed(1)}s</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="0.1"
                        value={simulationTime}
                        onChange={(e) => setSimulationTime(parseFloat(e.target.value))}
                        className="control-slider"
                      />
                    </div>
                    
                    {currentSimulation?.parameters.map((param, index) => (
                      <div key={index} className="control-group">
                        <label>{param}</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          className="control-slider"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="simulation-buttons">
                    <Button 
                      variant="primary" 
                      icon={isRunning ? <FaPause /> : <FaPlay />}
                      onClick={() => setIsRunning(!isRunning)}
                    >
                      {isRunning ? 'Pausar' : 'Iniciar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      icon={<FaRedo />}
                      onClick={() => setSimulationTime(0)}
                    >
                      Reiniciar
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="simulation-info">
                <h4>📖 Descripción</h4>
                <p>{currentSimulation?.description}</p>
                
                <div className="simulation-stats">
                  <div className="stat">
                    <span className="stat-label">Tiempo de simulación:</span>
                    <span className="stat-value">{simulationTime.toFixed(2)}s</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Estado:</span>
                    <span className="stat-value">{isRunning ? 'En ejecución' : 'Pausado'}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Intentos:</span>
                    <span className="stat-value">5</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
=======
      <div className="module-content fmb-inmersive-layout">
        {/* Capa Principal: Simulación */}
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
                  <div className="battery">🔋</div>
                  <div className="wire">━━━━</div>
                  <div className="resistor">⏚</div>
                  <div className="wire">━━━━</div>
                  <div className="led">💡</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel de Control Fisiomatbot: Flotante Derecho */}
        <aside className="fmb-floating-panel">
          <header className="fmb-panel-header">
            <h4><FaChartBar /> Parámetros</h4>
          </header>
          
          <div className="fmb-panel-body">
            <div className="fmb-control-list">
              <div className="fmb-check-item">
                <input type="checkbox" id="grid" defaultChecked />
                <label htmlFor="grid">Ver Cuadrícula</label>
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

        {/* Controles de Acción: Barra Central Inferior */}
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

        {/* Navegación Modular: Barra Inferior Fisiomatbot */}
        <nav className="fmb-mode-navigation">
          {simulations.map((sim) => (
            <button
              key={sim.id}
              className={`fmb-mode-btn ${activeSimulation === sim.id ? 'active' : ''}`}
              onClick={() => setActiveSimulation(sim.id)}
            >
              <div className="fmb-mode-icon">
                {sim.id === 'physics' && '⚡'}
                {sim.id === 'math' && '📈'}
                {sim.id === 'circuit' && '🔌'}
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
>>>>>>> master
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