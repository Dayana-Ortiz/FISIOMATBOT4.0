import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../services/api';
import * as progressService from '../services/progressService';
import type { ModuleProgress, MyProgress } from '../services/progressService';
import { useNotifications } from '../context/NotificationContext';
import { ModuleType } from '../types';

/**
 * Progreso real del usuario autenticado. Lo usan Inicio, Progreso y los módulos.
 * completeLesson registra una actividad y actualiza el estado con la respuesta del backend.
 */
export function useProgress() {
  const { addNotification } = useNotifications();
  const [progress, setProgress] = useState<MyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    progressService
      .getMyProgress()
      .then((data) => {
        if (!cancelled) setProgress(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getModule = useCallback(
    (code: ModuleType): ModuleProgress | undefined => progress?.modules.find((m) => m.code === code),
    [progress]
  );

  const isCompleted = useCallback(
    (code: ModuleType, lessonKey: string) => Boolean(getModule(code)?.completedLessons.includes(lessonKey)),
    [getModule]
  );

  /** Devuelve true si se guardó. Muestra notificaciones de error y de logros nuevos. */
  const completeLesson = useCallback(
    async (code: ModuleType, lessonKey: string): Promise<boolean> => {
      try {
        const { newAchievements, ...data } = await progressService.completeLesson(code, lessonKey);
        setProgress(data);
        newAchievements.forEach((title) =>
          addNotification({ title: '¡Nuevo logro!', message: title, kind: 'success' })
        );
        return true;
      } catch (err) {
        addNotification({
          title: 'No se guardó tu avance',
          message: err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.',
          kind: 'warning',
        });
        return false;
      }
    },
    [addNotification]
  );

  return { progress, loading, error, getModule, isCompleted, completeLesson };
}
