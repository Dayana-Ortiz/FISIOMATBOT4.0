import React, { useState } from 'react';
import { FaCircleCheck } from 'react-icons/fa6';
import Button from '../common/Button.tsx';

/** Marca verde junto al nombre de una lección completada. */
export const LessonDoneMark: React.FC<{ done: boolean }> = ({ done }) =>
  done ? (
    <span className="lesson-done-mark" title="Completada" aria-label="Completada">
      <FaCircleCheck />
    </span>
  ) : null;

interface CompleteLessonButtonProps {
  completed: boolean;
  /** Registra la lección; devuelve true si se guardó. */
  onComplete: () => Promise<boolean>;
}

/** Botón "Marcar como Completado" que guarda el avance en el backend. */
export const CompleteLessonButton: React.FC<CompleteLessonButtonProps> = ({ completed, onComplete }) => {
  const [saving, setSaving] = useState(false);

  if (completed) {
    return (
      <Button variant="secondary" disabled>
        <FaCircleCheck /> Lección completada
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      disabled={saving}
      onClick={async () => {
        setSaving(true);
        await onComplete();
        setSaving(false);
      }}
    >
      {saving ? 'Guardando…' : 'Marcar como Completado'}
    </Button>
  );
};
