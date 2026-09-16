import React, { useEffect, useState } from 'react';
import { FaPlay, FaPause, FaRedo, FaChartBar, FaQuestionCircle, FaExpand, FaCompress } from 'react-icons/fa';
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
  const [mass, setMass] = useState<number>(5);
  const [gravity, setGravity] = useState<number>(9.8);
  const [launchAngle, setLaunchAngle] = useState<number>(45);
  const [initialVelocity, setInitialVelocity] = useState<number>(20);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [switchOn, setSwitchOn] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning || activeSimulation !== 'physics') return undefined;

    let animationFrame = 0;
    let previousTimestamp: number | undefined;
    const animate = (timestamp: number) => {
      if (previousTimestamp === undefined) previousTimestamp = timestamp;
      const elapsed = (timestamp - previousTimestamp) / 1000;
      previousTimestamp = timestamp;
      setSimulationTime((currentTime) => currentTime + elapsed * playbackSpeed);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [activeSimulation, isRunning, playbackSpeed]);

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
  const angleInRadians = (launchAngle * Math.PI) / 180;
  const horizontalVelocity = initialVelocity * Math.cos(angleInRadians);
  const verticalVelocity = initialVelocity * Math.sin(angleInRadians);
  const flightTime = (2 * verticalVelocity) / gravity;
  const maxHeight = (verticalVelocity ** 2) / (2 * gravity);
  const range = horizontalVelocity * flightTime;
  const currentTime = Math.min(simulationTime, flightTime);
  const horizontalPosition = horizontalVelocity * currentTime;
  const verticalPosition = Math.max(0, verticalVelocity * currentTime - 0.5 * gravity * currentTime ** 2);
  const kineticEnergy = 0.5 * mass * initialVelocity ** 2;
  const projectileSize = 22 + mass * 1.8;
  const trajectoryX = range > 0 ? (horizontalPosition / range) * 85 : 0;
  const trajectoryY = maxHeight > 0 ? (verticalPosition / maxHeight) * 76 : 0;
  const vectorAngle = Math.atan2(verticalVelocity - gravity * currentTime, horizontalVelocity) * (180 / Math.PI);

  useEffect(() => {
    if (simulationTime >= flightTime && isRunning) setIsRunning(false);
  }, [flightTime, isRunning, simulationTime]);

  const handleReset = () => {
    setIsRunning(false);
    setSimulationTime(0);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.querySelector('.fmb-inmersive-layout')?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

      <div className="module-content fmb-inmersive-layout">
        {/* Capa Principal: Simulación */}
        <div className="simulation-canvas-area">
          <div className={`simulation-visualization inmersive-view ${activeSimulation}-bg ${showGrid ? 'show-grid' : ''}`}>
            <button className="fullscreen-button" onClick={toggleFullscreen} title={isFullscreen ? 'Salir de pantalla completa' : 'Entrar en pantalla completa'} aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Entrar en pantalla completa'}>
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
            {activeSimulation === 'physics' && (
              <div className="physics-simulation">
                <div className="physics-stage">
                  <div className="physics-copy"><span className="eyebrow">Tiro parabólico</span><h2>Laboratorio de lanzamiento</h2><p>Ajusta los parámetros y observa el movimiento en tiempo real.</p></div>
                  <div className="projectile-trajectory">
                    <div className="trajectory-curve" />
                    <div className="launch-point" />
                    <div className="projectile-vector" style={{ transform: `rotate(${vectorAngle}deg)` }} hidden={!showVectors} />
                    <div className="projectile" style={{ left: `${trajectoryX}%`, bottom: `${trajectoryY}%`, width: `${projectileSize}px`, height: `${projectileSize}px` }} />
                    <div className="ground-label">x = {horizontalPosition.toFixed(1)} m</div>
                  </div>
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
                <div className="circuit-board">
                  <div className="circuit-heading"><span className="eyebrow">Corriente alterna</span><h2>Circuito de iluminación</h2><p>Activa el switch para cerrar el circuito y encender el LED.</p></div>
                  <div className={`circuit-diagram ${switchOn ? 'circuit-live' : ''}`}>
                    <div className="circuit-node source-node"><span className="component-symbol">~</span><small>Fuente AC</small></div>
                    <div className="circuit-wire wire-top" />
                    <div className="circuit-component fuse-component"><span>F</span><small>Fusible</small></div>
                    <div className="circuit-wire wire-top" />
                    <button className="circuit-switch" onClick={() => setSwitchOn(!switchOn)} aria-pressed={switchOn} title={switchOn ? 'Abrir switch' : 'Cerrar switch'}><span className="switch-base" /><span className="switch-lever" /></button>
                    <div className="circuit-wire wire-top" />
                    <div className="circuit-component led-component"><span className="led-bulb" /><small>LED {switchOn ? 'encendido' : 'apagado'}</small></div>
                    <div className="circuit-wire wire-bottom" />
                    <div className="circuit-component resistor-component"><span className="resistor-mark">▱</span><small>Resistencia</small></div>
                    <div className="circuit-wire wire-bottom" />
                    <div className="circuit-node return-node"><span className="component-symbol">N</span><small>Neutro</small></div>
                  </div>
                  <div className={`circuit-status ${switchOn ? 'status-on' : ''}`}><span className="status-light" />{switchOn ? 'Circuito cerrado: hay corriente' : 'Circuito abierto: no hay corriente'}</div>
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
                <input type="checkbox" id="grid" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} />
                <label htmlFor="grid">Ver Cuadrícula</label>
              </div>
              <div className="fmb-check-item">
                <input type="checkbox" id="vectors" checked={showVectors} onChange={(event) => setShowVectors(event.target.checked)} />
                <label htmlFor="vectors">Ver Vectores</label>
              </div>
              
              <div className="fmb-divider" />

              {activeSimulation === 'physics' ? <>
                <div className="fmb-slider-group"><label htmlFor="mass">Masa <strong>{mass.toFixed(1)} kg</strong></label><input id="mass" type="range" min="1" max="10" step="0.1" value={mass} onChange={(event) => setMass(Number(event.target.value))} className="fmb-brand-slider" /></div>
                <div className="fmb-slider-group"><label htmlFor="gravity">Gravedad <strong>{gravity.toFixed(1)} m/s²</strong></label><input id="gravity" type="range" min="1.6" max="20" step="0.1" value={gravity} onChange={(event) => setGravity(Number(event.target.value))} className="fmb-brand-slider" /></div>
                <div className="fmb-slider-group"><label htmlFor="angle">Ángulo de lanzamiento <strong>{launchAngle}°</strong></label><input id="angle" type="range" min="15" max="75" value={launchAngle} onChange={(event) => setLaunchAngle(Number(event.target.value))} className="fmb-brand-slider" /></div>
                <div className="fmb-slider-group"><label htmlFor="velocity">Velocidad inicial <strong>{initialVelocity} m/s</strong></label><input id="velocity" type="range" min="5" max="40" value={initialVelocity} onChange={(event) => setInitialVelocity(Number(event.target.value))} className="fmb-brand-slider" /></div>
              </> : currentSimulation?.parameters.map((param, index) => <div key={index} className="fmb-slider-group"><label>{param}</label><input type="range" min="0" max="100" className="fmb-brand-slider" /></div>)}
            </div>
            {activeSimulation === 'physics' && <div className="simulation-metrics"><span><b>Tiempo</b>{currentTime.toFixed(2)} s</span><span><b>Altura máxima</b>{maxHeight.toFixed(1)} m</span><span><b>Alcance</b>{range.toFixed(1)} m</span><span><b>Energía cinética</b>{kineticEnergy.toFixed(0)} J</span><span><b>Aceleración</b>{gravity.toFixed(1)} m/s²</span></div>}
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
              onClick={handleReset}
              title="Reiniciar"
            >
              <FaRedo />
            </button>
            <div className="fmb-speed-selector">
              <button className={`speed-tab ${playbackSpeed === 1 ? 'active' : ''}`} onClick={() => setPlaybackSpeed(1)}>Normal</button>
              <button className={`speed-tab ${playbackSpeed === 0.35 ? 'active' : ''}`} onClick={() => setPlaybackSpeed(0.35)}>Lento</button>
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