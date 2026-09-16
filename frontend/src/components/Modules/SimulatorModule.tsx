import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlay, FaPause, FaRedo, FaChartBar, FaQuestionCircle } from 'react-icons/fa';
import { FaCarBattery, FaLightbulb, FaBolt, FaChartLine, FaPlug } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card.tsx';
import Button from '../common/Button.tsx';
import QuizComponent from './QuizComponent.tsx';
import { moduleIcons } from '../../Utils/moduleIcons';
import './ModuleStyles.css';

interface Parameter {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

interface Simulation {
  id: string;
  title: string;
  description: string;
  parameters: Parameter[];
}

const SimulatorModule: React.FC = () => {
  const [activeSimulation, setActiveSimulation] = useState<string>('physics');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationTime, setSimulationTime] = useState<number>(0);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [paramValues, setParamValues] = useState<Record<string, number>>({});
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [hasHitGround, setHasHitGround] = useState<boolean>(false);
  
  // Refs for animation loop
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(null);

  const simulations: Simulation[] = [
    {
      id: 'physics',
      title: 'Simulador de Movimiento',
      description: 'Estudia el movimiento parabólico de un proyectil aplicando las leyes de la cinemática en el sistema MKS.',
      parameters: [
        { id: 'v0', name: 'Velocidad inicial', unit: 'm/s', min: 0, max: 200, step: 1, defaultValue: 50 },
        { id: 'angle', name: 'Ángulo de lanzamiento', unit: '°', min: 0, max: 90, step: 1, defaultValue: 45 },
        { id: 'gravity', name: 'Gravedad', unit: 'm/s²', min: 0, max: 25, step: 0.1, defaultValue: 9.8 },
        { id: 'mass', name: 'Masa', unit: 'kg', min: 0.1, max: 200, step: 0.1, defaultValue: 10 }
      ]
    },
    {
      id: 'math',
      title: 'Gráfico de Funciones',
      description: 'Visualiza funciones matemáticas en tiempo real y analiza su comportamiento.',
      parameters: [
        { id: 'freq', name: 'Frecuencia', unit: 'Hz', min: 0.1, max: 10, step: 0.1, defaultValue: 1 },
        { id: 'amp', name: 'Amplitud', unit: 'm', min: 0, max: 50, step: 1, defaultValue: 25 },
        { id: 'phase', name: 'Fase', unit: 'rad', min: 0, max: 6.28, step: 0.01, defaultValue: 0 }
      ]
    },
    {
      id: 'circuit',
      title: 'Simulador de Circuitos',
      description: 'Construye circuitos eléctricos virtuales y mide voltaje, corriente y resistencia.',
      parameters: [
        { id: 'voltage', name: 'Voltaje', unit: 'V', min: 0, max: 24, step: 0.5, defaultValue: 12 },
        { id: 'resistance', name: 'Resistencia', unit: 'Ω', min: 1, max: 1000, step: 1, defaultValue: 100 }
      ]
    }
  ];

  // Initialize parameters when simulation changes
  useEffect(() => {
    const currentSim = simulations.find(s => s.id === activeSimulation);
    if (currentSim) {
      const initialValues: Record<string, number> = {};
      currentSim.parameters.forEach(p => {
        initialValues[p.id] = p.defaultValue;
      });
      setParamValues(initialValues);
      setSimulationTime(0);
      setIsRunning(false);
      setHasHitGround(false);
    }
  }, [activeSimulation]);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined && lastTimeRef.current !== null) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      if (isRunning && !hasHitGround) {
        setSimulationTime(prev => prev + deltaTime * speedMultiplier);
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [isRunning, speedMultiplier, hasHitGround]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleParamChange = (id: string, value: number) => {
    setParamValues(prev => ({ ...prev, [id]: value }));
    // Reset if we changed param while stopped
    if (!isRunning) {
        setSimulationTime(0);
        setHasHitGround(false);
    }
  };

  const resetSimulation = () => {
    setSimulationTime(0);
    setIsRunning(false);
    setHasHitGround(false);
  };

  // Kinematics calculations for physics simulation
  const getProjectilePosition = () => {
    const v0 = paramValues['v0'] || 40;
    const angleRad = ((paramValues['angle'] || 45) * Math.PI) / 180;
    const g = paramValues['gravity'] || 9.8;
    const t = simulationTime;

    // x = v0 * cos(theta) * t
    // y = v0 * sin(theta) * t - 0.5 * g * t^2
    let x_m = v0 * Math.cos(angleRad) * t;
    let y_m = v0 * Math.sin(angleRad) * t - 0.5 * g * Math.pow(t, 2);

    // Scaling for visualization
    const scale = 0.8; 
    let xPos = x_m * scale;
    let yPos = y_m * scale;

    // Check for ground collision
    if (yPos < 0 && t > 0.1) {
      if (!hasHitGround) setHasHitGround(true);
      yPos = 0;
    }

    return { xPos, yPos };
  };

  const { xPos, yPos } = getProjectilePosition();

  const currentSimulation = simulations.find(s => s.id === activeSimulation);

  return (
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title icon-inline">{moduleIcons.simulator} Módulo Simulador</h1>
      </div>

      <article className="module-intro">
        <h2>Introducción al módulo</h2>
        <p>
          Experimenta con el sistema estándar <strong>MKS (Metro, Kilogramo, Segundo)</strong> en nuestro entorno inmersivo. 
          Ajusta los parámetros con los deslizadores y observa cómo las leyes de la física dictan el comportamiento de la esfera en tiempo real.
        </p>
      </article>

      <div className="module-content fmb-inmersive-layout">
        {/* Capa Principal: Simulación */}
        <div className="simulation-canvas-area">
          <div className={`simulation-visualization inmersive-view ${activeSimulation}-bg`}>
            {activeSimulation === 'physics' && (
              <div className="physics-simulation">
                <div className="projectile-trajectory">
                  <motion.div 
                    className="projectile" 
                    animate={{ 
                      x: `${xPos}%`,
                      y: `${-yPos}%`
                    }}
                    transition={{ type: "just" }}
                    style={{ 
                      position: 'absolute',
                      bottom: '20px',
                      left: '50px'
                    }} 
                  />
                  <div className="visual-floor" style={{
                    position: 'absolute',
                    bottom: '0',
                    width: '100%',
                    height: '20px',
                    background: '#fbbf24',
                    borderTop: '2px solid rgba(0,0,0,0.1)'
                  }} />
                </div>
              </div>
            )}
            
            {activeSimulation === 'math' && (
              <div className="math-simulation">
                <div className="graph-container">
                  <motion.div 
                    className="projectile"
                    animate={{
                      y: Math.sin(simulationTime * (paramValues['freq'] || 1)) * (paramValues['amp'] || 25)
                    }}
                    style={{ position: 'relative' }}
                  />
                   <div className="graph-axis" style={{ height: '2px', width: '80%', background: 'rgba(255,255,255,0.3)', position: 'absolute' }} />
                </div>
              </div>
            )}
            
            {activeSimulation === 'circuit' && (
              <div className="circuit-simulation">
                <div className="circuit-diagram">
                   <div className="battery"><FaCarBattery /></div>
                   <div className="wire">━━━━</div>
                  <motion.div 
                    className="projectile"
                    style={{ width: '15px', height: '15px', background: '#3b82f6' }}
                    animate={{ x: isRunning ? [0, 200, 0] : 0 }}
                    transition={{ 
                        duration: Math.max(0.1, 5 / ((paramValues['voltage'] || 12) / (paramValues['resistance'] || 100) * 10)), 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                  />
                  <div className="resistor">⏚</div>
                   <div className="wire">━━━━</div>
                  <div className="led"><FaLightbulb /></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel de Control Fisiomatbot: Flotante Derecho */}
        <aside className="fmb-floating-panel">
          <header className="fmb-panel-header">
            <h4><FaChartBar /> Parámetros (MKS)</h4>
          </header>
          
          <div className="fmb-panel-body">
            <div className="fmb-control-list">
              <div className="fmb-check-group" style={{ display: 'flex', gap: '15px' }}>
                <div className="fmb-check-item">
                  <input type="checkbox" id="grid" defaultChecked />
                  <label htmlFor="grid">Cuadrícula</label>
                </div>
                <div className="fmb-check-item">
                  <input type="checkbox" id="vectors" />
                  <label htmlFor="vectors">Vectores</label>
                </div>
              </div>
              
              <div className="fmb-divider" />

              {currentSimulation?.parameters.map((param) => (
                <div key={param.id} className="fmb-slider-group">
                  <div className="fmb-slider-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{param.name}</label>
                    <span style={{ fontSize: '0.9rem', color: '#FD7B41', fontWeight: '800' }}>
                      {paramValues[param.id]?.toFixed(param.step < 1 ? 1 : 0)} 
                      <small style={{ marginLeft: '2px', opacity: 0.8 }}>{param.unit}</small>
                    </span>
                  </div>
                  <div className="fmb-slider-wrapper">
                    <input 
                      type="range" 
                      min={param.min} 
                      max={param.max} 
                      step={param.step}
                      value={paramValues[param.id] || param.defaultValue}
                      onChange={(e) => handleParamChange(param.id, parseFloat(e.target.value))}
                      className="fmb-brand-slider" 
                    />
                    <div className="fmb-slider-limits" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.5 }}>
                      <span>{param.min}</span>
                      <span>{param.max}</span>
                    </div>
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
              className={`fmb-round-btn ${isRunning ? 'secondary-action' : 'primary-action'}`}
              onClick={() => setIsRunning(!isRunning)}
              disabled={hasHitGround && isRunning}
              title={isRunning ? 'Pausar' : 'Iniciar'}
            >
              {isRunning ? <FaPause /> : <FaPlay />}
            </button>
            <button 
              className="fmb-round-btn secondary-action"
              onClick={resetSimulation}
              title="Reiniciar"
            >
              <FaRedo />
            </button>
            <div className="fmb-speed-selector">
              <button 
                className={`speed-tab ${speedMultiplier === 1 ? 'active' : ''}`}
                onClick={() => setSpeedMultiplier(1)}
              >
                Normal
              </button>
              <button 
                className={`speed-tab ${speedMultiplier === 0.2 ? 'active' : ''}`}
                onClick={() => setSpeedMultiplier(0.2)}
              >
                Lento
              </button>
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
                {sim.id === 'physics' && <FaBolt />}
                {sim.id === 'math' && <FaChartLine />}
                {sim.id === 'circuit' && <FaPlug />}
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

      <AnimatePresence>
        {showQuiz && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="quiz-modal-overlay"
          >
            <QuizComponent 
              module="simulator"
              onClose={() => setShowQuiz(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimulatorModule;