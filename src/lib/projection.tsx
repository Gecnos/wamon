import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { readJSON, writeJSON } from './storage';

type ProjectionValue = readonly [boolean, Dispatch<SetStateAction<boolean>>];

const ProjectionContext = createContext<ProjectionValue>([false, () => undefined]);

/**
 * Le mode projection pose la classe `projection` sur <html> : la taille de
 * base passe à 125 % (tout est en rem) et la variante Tailwind `projection:`
 * permet de masquer ce qui n’a pas à être vu par la classe.
 */
export function ProjectionProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(() => readJSON<boolean>('local', 'wamon:projection') ?? false);

  useEffect(() => {
    document.documentElement.classList.toggle('projection', on);
    writeJSON('local', 'wamon:projection', on);
  }, [on]);

  return <ProjectionContext.Provider value={[on, setOn]}>{children}</ProjectionContext.Provider>;
}

export function useProjection(): ProjectionValue {
  return useContext(ProjectionContext);
}
