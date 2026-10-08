import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Chronomètre d’une simulation : `t` va de 0 à 1 en `durationMs`. On peut
 * lancer, mettre en pause, rejouer ou se placer n’importe où avec `seek`.
 * Si l’utilisateur limite les animations, « lancer » saute directement à la fin.
 */
export function useTimeline(durationMs: number) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tRef = useRef(0);
  const last = useRef(0);

  const seek = useCallback((value: number) => {
    tRef.current = Math.min(1, Math.max(0, value));
    setT(tRef.current);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    last.current = performance.now();
    const tick = (now: number) => {
      const next = Math.min(1, tRef.current + (now - last.current) / durationMs);
      last.current = now;
      seek(next);
      if (next >= 1) setPlaying(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, durationMs, seek]);

  const play = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      seek(1);
      return;
    }
    if (tRef.current >= 1) seek(0);
    setPlaying(true);
  }, [seek]);

  const pause = useCallback(() => setPlaying(false), []);
  const replay = useCallback(() => {
    seek(0);
    setPlaying(true);
  }, [seek]);

  return { t, playing, play, pause, replay, seek: (value: number) => { setPlaying(false); seek(value); } };
}
