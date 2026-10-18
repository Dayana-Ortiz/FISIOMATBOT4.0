import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FaChartLine } from 'react-icons/fa';
import { usePhysicsStore } from '../../store/usePhysicsStore';

const TelemetryHUD: React.FC = () => {
  const telemetry = usePhysicsStore((s) => s.telemetry);
  const selectedObjectId = usePhysicsStore((s) => s.selectedObjectId);
  const objects = usePhysicsStore((s) => s.objects);
  const selectedLabel = objects.find((o) => o.id === selectedObjectId)?.label ?? '—';

  const current = telemetry.current;

  return (
    <section className="sim3d-panel sim3d-telemetry">
      <header className="fmb-panel-header">
        <h4>
          <FaChartLine /> Telemetría — {selectedLabel}
        </h4>
      </header>

      <div className="fmb-panel-body">
        <div className="sim3d-telemetry-readouts">
          <div className="sim3d-readout">
            <span className="sim3d-readout-label">Altura (h)</span>
            <span className="sim3d-readout-value">{(current?.height ?? 0).toFixed(2)} m</span>
          </div>
          <div className="sim3d-readout">
            <span className="sim3d-readout-label">Velocidad (v)</span>
            <span className="sim3d-readout-value">{(current?.speed ?? 0).toFixed(2)} m/s</span>
          </div>
          <div className="sim3d-readout">
            <span className="sim3d-readout-label" style={{ color: '#22c55e' }}>
              E. Potencial
            </span>
            <span className="sim3d-readout-value">{(current?.ep ?? 0).toFixed(2)} J</span>
          </div>
          <div className="sim3d-readout">
            <span className="sim3d-readout-label" style={{ color: '#3b82f6' }}>
              E. Cinética
            </span>
            <span className="sim3d-readout-value">{(current?.ek ?? 0).toFixed(2)} J</span>
          </div>
          <div className="sim3d-readout">
            <span className="sim3d-readout-label" style={{ color: '#FD7B41' }}>
              E. Total
            </span>
            <span className="sim3d-readout-value">{(current?.etotal ?? 0).toFixed(2)} J</span>
          </div>
        </div>

        <div className="sim3d-chart-wrapper">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={telemetry.history} margin={{ top: 6, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="t"
                tickFormatter={(t: number) => t.toFixed(1)}
                stroke="rgba(255,255,255,0.5)"
                fontSize={10}
              />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
              <Tooltip
                formatter={(value: number) => value.toFixed(2)}
                labelFormatter={(t: number) => `t = ${t.toFixed(1)}s`}
              />
              <Line type="monotone" dataKey="ep" name="Ep" stroke="#22c55e" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="ek" name="Ek" stroke="#3b82f6" dot={false} strokeWidth={2} />
              <Line
                type="monotone"
                dataKey="etotal"
                name="Etotal"
                stroke="#FD7B41"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default TelemetryHUD;
