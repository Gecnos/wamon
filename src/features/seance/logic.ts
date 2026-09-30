import type { Exercise, Params } from '../../exercises';
import type { IndicatorType } from '../../models/dosageFortFort';

export const STEPS = [
  { id: 'enonce', label: 'Faire calculer', hint: 'Projeter la consigne et les données' },
  { id: 'reponse', label: 'Entrer la réponse', hint: 'Noter ce que la classe a trouvé' },
  { id: 'experience', label: 'Lancer l’expérience', hint: 'Manipuler devant la classe' },
  { id: 'comparer', label: 'Comparer', hint: 'Discuter l’écart avec le modèle' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

export function stepIndex(id: string | undefined): number {
  return STEPS.findIndex(step => step.id === id);
}

export interface Group {
  id: string;
  name: string;
  value: number | null;
}

export interface SeanceState {
  variantId: string;
  params: Params;
  indicator: IndicatorType;
  classAnswer: number | null;
  groups: Group[];
  /** Indice de l’étape la plus avancée déjà atteinte. */
  furthest: number;
}

export function initialState(ex: Exercise): SeanceState {
  return {
    variantId: ex.variants[0].id,
    params: { ...ex.defaults },
    indicator: ex.kind === 'titration' ? ex.defaultIndicator : 'btb',
    classAnswer: null,
    groups: [],
    furthest: 0,
  };
}

/** Couleurs des groupes, distinctes de l’encre (classe) et du rouge (modèle). */
export const GROUP_COLORS = ['#7c3aed', '#0e7490', '#b45309', '#be185d', '#4d7c0f', '#475569'];

/** Capacité de burette nécessaire pour voir l’équivalence et la prédiction. */
export function buretteCapacity(ve: number, predicted: number): 25 | 50 {
  return Math.max(ve, predicted) <= 22 ? 25 : 50;
}
