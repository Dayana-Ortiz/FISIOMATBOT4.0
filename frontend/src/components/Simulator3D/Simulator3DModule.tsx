import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaQuestionCircle } from 'react-icons/fa';
import QuizComponent from '../Modules/QuizComponent.tsx';
import { moduleIcons } from '../../Utils/moduleIcons';
import TopBar from './TopBar.tsx';
import SimulatorCanvas from './SimulatorCanvas.tsx';
import PhysicsInspector from './PhysicsInspector.tsx';
import TelemetryHUD from './TelemetryHUD.tsx';
// @ts-expect-error CSS es manejado por el bundler en tiempo de ejecución.
import '../Modules/ModuleStyles.css';
// @ts-expect-error CSS es manejado por el bundler en tiempo de ejecución.
import './Simulator3D.css';

const Simulator3DModule: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title icon-inline">{moduleIcons.simulator} Simulador 3D de Física</h1>
      </div>

      <article className="module-intro">
        <h2>Matriz de simulación 3D</h2>
        <p>
          Explora una arena tridimensional con física real. Ajusta la gravedad, la masa y la
          fricción, observa la conservación de la energía en tiempo real y comprueba cómo la
          teoría (E<sub>p</sub> = m·g·h, E<sub>k</sub> = ½·m·v²) se cumple en la simulación.
        </p>
      </article>

      <div className="sim3d-layout">
        <TopBar />

        <div className="sim3d-canvas-area">
          <SimulatorCanvas />
        </div>

        <div className="sim3d-side-panels">
          <PhysicsInspector />
          <TelemetryHUD />
        </div>
      </div>

      <nav className="fmb-mode-navigation">
        <button type="button" className="fmb-mode-btn quiz-accent" onClick={() => setShowQuiz(true)}>
          <div className="fmb-mode-icon">
            <FaQuestionCircle />
          </div>
          <span className="fmb-mode-name">Quiz</span>
        </button>
      </nav>

      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="quiz-modal-overlay"
          >
            <QuizComponent module="simulator" onClose={() => setShowQuiz(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Simulator3DModule;
