import React from 'react';
import ProgressTracker from '../components/Layout/ProgressTracker.tsx';

const ProgressPage: React.FC = () => {
  return (
    <section aria-labelledby="progress-page-title">
      <header className="mb-4">
        <h1 id="progress-page-title">Tu progreso</h1>
        <p className="text-muted">
          Revisa el avance general y por módulo en la plataforma.
        </p>
      </header>

      <div className="row g-4">
        <article className="col-12 col-lg-8">
          <div className="p-4 bg-white rounded-3 shadow-sm h-100">
            <h2 className="h5 mb-3">Resumen de estudio</h2>
            <p className="mb-0">
              Aquí podrás añadir más detalles, gráficas o historial de sesiones
              conforme vayas ampliando la plataforma.
            </p>
          </div>
        </article>

        <aside
          className="col-12 col-lg-4"
          aria-label="Panel lateral de seguimiento de progreso"
        >
          <div className="bg-white rounded-3 shadow-sm p-4 h-100">
            <ProgressTracker />
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ProgressPage;

