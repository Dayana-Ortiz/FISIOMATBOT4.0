import React from 'react';
import { FaPause, FaPlay, FaRedo, FaStepForward } from 'react-icons/fa';
import { FaCube, FaCirclePlay } from 'react-icons/fa6';
import { GiSteeringWheel } from 'react-icons/gi';
import { BsCircle } from 'react-icons/bs';
import { usePhysicsStore } from '../../store/usePhysicsStore';
import { GRAVITY_PRESETS } from '../../types/simulator3d';
import { useFpsCounter } from './useFpsCounter';

const TopBar: React.FC = () => {
  const isRunning = usePhysicsStore((s) => s.isRunning);
  const simulationTime = usePhysicsStore((s) => s.simulationTime);
  const cameraView = usePhysicsStore((s) => s.cameraView);
  const gravityPreset = usePhysicsStore((s) => s.worldSettings.gravityPreset);
  const play = usePhysicsStore((s) => s.play);
  const pause = usePhysicsStore((s) => s.pause);
  const reset = usePhysicsStore((s) => s.reset);
  const setGravityPreset = usePhysicsStore((s) => s.setGravityPreset);
  const setCameraView = usePhysicsStore((s) => s.setCameraView);
  const addObject = usePhysicsStore((s) => s.addObject);
  const fps = useFpsCounter();

  const handleStep = () => {
    // Avanza exactamente un frame de física: reanuda y pausa de inmediato.
    play();
    requestAnimationFrame(() => pause());
  };

  return (
    <div className="sim3d-topbar">
      <div className="sim3d-topbar-group">
        <button
          type="button"
          className="fmb-round-btn primary-action"
          onClick={() => (isRunning ? pause() : play())}
          title={isRunning ? 'Pausar' : 'Reproducir'}
        >
          {isRunning ? <FaPause /> : <FaPlay />}
        </button>
        <button
          type="button"
          className="fmb-round-btn secondary-action"
          onClick={handleStep}
          disabled={isRunning}
          title="Avanzar un paso"
        >
          <FaStepForward />
        </button>
        <button
          type="button"
          className="fmb-round-btn secondary-action"
          onClick={reset}
          title="Reiniciar"
        >
          <FaRedo />
        </button>
      </div>

      <div className="sim3d-topbar-group">
        <span className="sim3d-label">Gravedad</span>
        <div className="sim3d-pill-group">
          {GRAVITY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`sim3d-pill ${gravityPreset === preset.id ? 'active' : ''}`}
              onClick={() => setGravityPreset(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sim3d-topbar-group">
        <button
          type="button"
          className="sim3d-icon-btn"
          onClick={() => addObject('cube')}
          title="Agregar cubo"
        >
          <FaCube /> Cubo
        </button>
        <button
          type="button"
          className="sim3d-icon-btn"
          onClick={() => addObject('sphere')}
          title="Agregar esfera"
        >
          <BsCircle /> Esfera
        </button>
      </div>

      <div className="sim3d-topbar-group">
        <button
          type="button"
          className={`sim3d-pill ${cameraView === 'isometric' ? 'active' : ''}`}
          onClick={() => setCameraView('isometric')}
        >
          <GiSteeringWheel /> Isométrica
        </button>
        <button
          type="button"
          className={`sim3d-pill ${cameraView === 'top' ? 'active' : ''}`}
          onClick={() => setCameraView('top')}
        >
          <FaCirclePlay /> Cenital
        </button>
      </div>

      <div className="sim3d-topbar-group sim3d-telemetry-mini">
        <span>t = {simulationTime.toFixed(1)}s</span>
        <span>{fps} FPS</span>
      </div>
    </div>
  );
};

export default TopBar;
