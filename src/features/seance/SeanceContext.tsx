import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readJSON, writeJSON } from '../../lib/storage';
import { DEFAULT_SEANCE, type SeanceState } from './logic';

const STORAGE_KEY = 'wamon:seance:v1';

interface SeanceContextValue {
  state: SeanceState;
  update: (patch: Partial<SeanceState> | ((current: SeanceState) => Partial<SeanceState>)) => void;
  restart: () => void;
}

const SeanceContext = createContext<SeanceContextValue | null>(null);

/**
 * L’état de la séance survit aux changements d’étape, au bouton « retour »
 * du navigateur et au rechargement de la page (sessionStorage).
 */
export function SeanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SeanceState>(() => ({
    ...DEFAULT_SEANCE,
    ...readJSON<SeanceState>('session', STORAGE_KEY),
  }));

  useEffect(() => {
    writeJSON('session', STORAGE_KEY, state);
  }, [state]);

  const update = useCallback<SeanceContextValue['update']>(patch => {
    setState(current => ({ ...current, ...(typeof patch === 'function' ? patch(current) : patch) }));
  }, []);

  const restart = useCallback(() => setState(current => ({ ...DEFAULT_SEANCE, params: current.params, varianteId: current.varianteId, indicator: current.indicator })), []);

  const value = useMemo(() => ({ state, update, restart }), [state, update, restart]);
  return <SeanceContext.Provider value={value}>{children}</SeanceContext.Provider>;
}

export function useSeance(): SeanceContextValue {
  const value = useContext(SeanceContext);
  if (!value) throw new Error('useSeance doit être utilisé dans <SeanceProvider>');
  return value;
}
