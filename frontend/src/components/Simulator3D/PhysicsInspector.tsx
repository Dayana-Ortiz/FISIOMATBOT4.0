import React from 'react';
import { FaSlidersH } from 'react-icons/fa';
import { usePhysicsStore } from '../../store/usePhysicsStore';

interface SliderRowProps {
  label: string;
  unit?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, unit, value, min, max, step, onChange }) => (
  <div className="fmb-slider-group">
    <div className="fmb-slider-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{label}</label>
      <span style={{ fontSize: '0.9rem', color: '#FD7B41', fontWeight: 800 }}>
        {value.toFixed(step < 1 ? 2 : 0)}
        {unit && <small style={{ marginLeft: '2px', opacity: 0.8 }}>{unit}</small>}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="fmb-brand-slider"
    />
  </div>
);

const PhysicsInspector: React.FC = () => {
  const objects = usePhysicsStore((s) => s.objects);
  const selectedObjectId = usePhysicsStore((s) => s.selectedObjectId);
  const selectObject = usePhysicsStore((s) => s.selectObject);
  const updateObjectProps = usePhysicsStore((s) => s.updateObjectProps);
  const worldSettings = usePhysicsStore((s) => s.worldSettings);
  const setGroundFriction = usePhysicsStore((s) => s.setGroundFriction);
  const setGroundRestitution = usePhysicsStore((s) => s.setGroundRestitution);

  const selected = objects.find((o) => o.id === selectedObjectId) ?? null;

  return (
    <aside className="sim3d-panel sim3d-inspector">
      <header className="fmb-panel-header">
        <h4>
          <FaSlidersH /> Inspector de Propiedades
        </h4>
      </header>

      <div className="fmb-panel-body">
        <div className="fmb-control-list">
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Objeto seleccionado</label>
          <select
            className="sim3d-select"
            value={selectedObjectId ?? ''}
            onChange={(e) => selectObject(e.target.value || null)}
          >
            {objects.map((obj) => (
              <option key={obj.id} value={obj.id}>
                {obj.label}
              </option>
            ))}
          </select>

          {selected && (
            <>
              <div className="fmb-divider" />
              {selected.type !== 'ramp' && (
                <SliderRow
                  label="Masa"
                  unit="kg"
                  value={selected.mass}
                  min={0.1}
                  max={50}
                  step={0.1}
                  onChange={(v) => updateObjectProps(selected.id, { mass: v })}
                />
              )}
              {selected.type === 'ramp' && (
                <SliderRow
                  label="Inclinación"
                  unit="°"
                  value={selected.rampAngleDeg ?? 0}
                  min={0}
                  max={60}
                  step={1}
                  onChange={(v) => updateObjectProps(selected.id, { rampAngleDeg: v })}
                />
              )}
              <SliderRow
                label="Fricción"
                value={selected.friction}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => updateObjectProps(selected.id, { friction: v })}
              />
              <SliderRow
                label="Restitución"
                value={selected.restitution}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => updateObjectProps(selected.id, { restitution: v })}
              />
            </>
          )}

          <div className="fmb-divider" />
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Entorno</label>
          <SliderRow
            label="Fricción del suelo"
            value={worldSettings.groundFriction}
            min={0}
            max={1}
            step={0.05}
            onChange={setGroundFriction}
          />
          <SliderRow
            label="Restitución del suelo"
            value={worldSettings.groundRestitution}
            min={0}
            max={1}
            step={0.05}
            onChange={setGroundRestitution}
          />
        </div>
      </div>
    </aside>
  );
};

export default PhysicsInspector;
