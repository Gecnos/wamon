import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { animationEngine, type AnimEngineConfig } from '../../engine/AnimationEngine';
import { createTitrationCanvasSVG } from '../../engine/TitrationCanvas';
import type { IndicatorType } from '../../models/dosageFortFort';
import { titrationPoint } from '../../models/titration';

export const TITRANT_COLOR = 'rgba(196, 119, 61, 0.82)';

export interface TitrationSetup {
  Ca: number;
  Va: number;
  Cb: number;
  indicator: IndicatorType;
  maxVb: number;
  /** Absent : acide fort. */
  pKa?: number;
  /** Vrai : la solution dosée est une base faible. */
  mirror?: boolean;
}

/**
 * Monte la scène SVG (burette + bécher) dans `hostRef` et pilote le moteur
 * d’animation. Changer l’indicateur conserve le volume déjà versé ; changer
 * les solutions ou la burette remet l’expérience à zéro.
 */
export function useTitration(hostRef: RefObject<HTMLDivElement | null>, setup: TitrationSetup) {
  const { Ca, Va, Cb, indicator, maxVb, pKa, mirror } = setup;
  const [volume, setVolume] = useState(0);
  const [pouring, setPouring] = useState(false);
  const volumeRef = useRef(0);
  volumeRef.current = volume;

  const engineConfig = useCallback(
    (initialVb: number): AnimEngineConfig => ({ initialVb, maxVb, initialVa: Va, Ca, Va, Cb, indicator, pKa, mirror, buretteFluidColor: TITRANT_COLOR }),
    [Ca, Va, Cb, indicator, maxVb, pKa, mirror]
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const start = titrationPoint({ Ca, Va, Cb, pKa, mirror }, 0, indicator);
    host.innerHTML = createTitrationCanvasSVG({
      initialVb: 0,
      maxVb,
      initialVa: Va,
      initialColor: start.color,
      buretteFluidColor: TITRANT_COLOR,
    });
    // La taille est gérée par le conteneur.
    const svg = host.querySelector('svg');
    svg?.removeAttribute('width');
    svg?.removeAttribute('height');
    animationEngine.mount(engineConfig(0));
    // Mis à jour tout de suite : l’effet de l’indicateur s’exécute juste après.
    volumeRef.current = 0;
    setVolume(0);
    setPouring(false);
    return () => {
      animationEngine.stop();
      host.innerHTML = '';
    };
    // L’indicateur est traité par l’effet suivant, sans vider la burette.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostRef, Ca, Va, Cb, maxVb, pKa, mirror]);

  useEffect(() => {
    animationEngine.reconfigure(engineConfig(volumeRef.current));
    setPouring(false);
  }, [indicator, engineConfig]);

  useEffect(() => {
    const onChange = (event: Event) => {
      const { currentVb, mode } = (event as CustomEvent<{ currentVb: number; mode: string }>).detail;
      setVolume(currentVb);
      setPouring(mode !== 'idle');
    };
    document.addEventListener('titration:volumeChanged', onChange);
    return () => document.removeEventListener('titration:volumeChanged', onChange);
  }, []);

  const addDrop = useCallback(() => animationEngine.addOneDrop(), []);
  const addVolume = useCallback((ml: number) => animationEngine.addVolume(ml), []);

  const undo = useCallback((ml = 0.5) => {
    const next = Math.max(0, Number((volumeRef.current - ml).toFixed(2)));
    animationEngine.reconfigure(engineConfig(next));
    setVolume(next);
    setPouring(false);
  }, [engineConfig]);

  const toggleFlow = useCallback(() => {
    if (animationEngine.state.mode !== 'idle') {
      animationEngine.stop();
      setPouring(false);
    } else {
      animationEngine.startFlow();
      setPouring(true);
    }
  }, []);

  const pourTo = useCallback((target: number) => {
    if (volumeRef.current >= target) return;
    animationEngine.pourToTarget(target);
    setPouring(true);
  }, []);

  const stop = useCallback(() => {
    animationEngine.stop();
    setPouring(false);
  }, []);

  const reset = useCallback(() => animationEngine.reset(), []);

  const reading = titrationPoint({ Ca, Va, Cb, pKa, mirror }, volume, indicator);

  return { volume, pouring, reading, addDrop, addVolume, undo, toggleFlow, pourTo, stop, reset };
}
