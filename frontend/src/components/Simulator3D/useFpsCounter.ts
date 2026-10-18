import { useEffect, useRef, useState } from 'react';

// Contador de FPS independiente del loop de R3F, para mostrarlo en el HUD (DOM).
export const useFpsCounter = (): number => {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let rafId: number;

    const tick = (time: number) => {
      frameCountRef.current += 1;
      const elapsed = time - lastTimeRef.current;
      if (elapsed >= 500) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return fps;
};
