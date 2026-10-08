import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Exercise } from '../../exercises';
import { readJSON, writeJSON } from '../../lib/storage';
import { initialState, type SeanceState } from './logic';

const STORAGE_KEY = 'wamon:seances:v2';

type Patch = Partial<SeanceState> | ((current: SeanceState) => Partial<SeanceState>);

interface SeanceStore {
  states: Record<string, SeanceState>;
  update: (ex: Exercise, patch: Patch) => void;
  restart: (ex: Exercise) => void;
}

const SeanceContext = createContext<SeanceStore | null>(null);

/**
 * Une séance par exercice. L’état survit aux changements d’étape, au bouton
 * « retour » du navigateur et au rechargement de la page (sessionStorage).
 */
export function SeanceProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<Record<string, SeanceState>>(() => readJSON('session', STORAGE_KEY) ?? {});

  useEffect(() => {
    writeJSON('session', STORAGE_KEY, states);
  }, [states]);

  const update = useCallback((ex: Exercise, patch: Patch) => {
    setStates(all => {
      const current = all[ex.id] ?? initialState(ex);
      const next = typeof patch === 'function' ? patch(current) : patch;
      return { ...all, [ex.id]: { ...current, ...next } };
    });
  }, []);

  // On garde les réglages de l’enseignant, on efface les réponses.
  const restart = useCallback((ex: Exercise) => {
    setStates(all => {
      const current = all[ex.id] ?? initialState(ex);
      return { ...all, [ex.id]: { ...initialState(ex), params: current.params, variantId: current.variantId, indicator: current.indicator } };
    });
  }, []);

  const value = useMemo(() => ({ states, update, restart }), [states, update, restart]);
  return <SeanceContext.Provider value={value}>{children}</SeanceContext.Provider>;
}

export function useSeance(ex: Exercise) {
  const store = useContext(SeanceContext);
  if (!store) throw new Error('useSeance doit être utilisé dans <SeanceProvider>');
  const { states, update, restart } = store;
  const state = states[ex.id] ?? initialState(ex);
  return {
    state,
    update: useCallback((patch: Patch) => update(ex, patch), [ex, update]),
    restart: useCallback(() => restart(ex), [ex, restart]),
  };
}
