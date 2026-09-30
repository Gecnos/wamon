import dosageConfig from '../../data/modules/dosage-fort-fort.json';
import type { IndicatorType } from '../../models/dosageFortFort';
import type { GrandeurConfig, ModuleConfig } from '../../types';
import { verifyResult } from '../../core/validator';

export const config = dosageConfig as ModuleConfig;

export const STEPS = [
  { id: 'enonce', label: 'Faire calculer', short: 'Énoncé', hint: 'Projeter la consigne et les données' },
  { id: 'reponse', label: 'Entrer la réponse', short: 'Réponse', hint: 'Noter ce que la classe a trouvé' },
  { id: 'experience', label: 'Lancer l’expérience', short: 'Expérience', hint: 'Verser et observer le virage' },
  { id: 'comparer', label: 'Comparer', short: 'Comparer', hint: 'Discuter l’écart avec le modèle' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

export function stepIndex(id: string | undefined): number {
  return STEPS.findIndex(step => step.id === id);
}

export interface Params {
  Ca: number;
  Va: number;
  Cb: number;
}

export interface Group {
  id: string;
  name: string;
  value: number | null;
}

export interface SeanceState {
  varianteId: string;
  params: Params;
  indicator: IndicatorType;
  classAnswer: number | null;
  groups: Group[];
  /** Indice de l’étape la plus avancée déjà atteinte. */
  furthest: number;
}

export const DEFAULT_SEANCE: SeanceState = {
  varianteId: 'A',
  params: { Ca: 0.1, Va: 20, Cb: 0.1 },
  indicator: 'btb',
  classAnswer: null,
  groups: [],
  furthest: 0,
};

export const GROUP_COLORS = ['#7c3aed', '#0e7490', '#b45309', '#be185d', '#4d7c0f', '#1d4ed8'];

export function quantity(key: string): GrandeurConfig & { name: string } {
  const g = config.grandeurs[key];
  return { ...g, name: g.label.replace(/\s*\([^)]*\)\s*$/, '') };
}

export function variante(state: SeanceState) {
  return config.variantes.find(v => v.id === state.varianteId) ?? config.variantes[0];
}

/** Volume équivalent réel, fixé par les paramètres (en mL). */
export function equivalenceVolume({ Ca, Va, Cb }: Params): number {
  return (Ca * Va) / Cb;
}

/** Valeur exacte de l’inconnue de la variante. */
export function referenceValue(state: SeanceState): number {
  return variante(state).inconnue === 'Ve' ? equivalenceVolume(state.params) : state.params.Ca;
}

/** Volume auquel le virage devrait se produire si la réponse `answer` était juste. */
export function predictedVolume(state: SeanceState, answer: number): number {
  if (variante(state).inconnue === 'Ve') return answer;
  return (answer * state.params.Va) / state.params.Cb;
}

/** Capacité de la burette affichée : 25 mL par défaut, 50 mL si nécessaire. */
export function buretteCapacity(state: SeanceState): 25 | 50 {
  const ve = equivalenceVolume(state.params);
  const answer = state.classAnswer === null ? 0 : predictedVolume(state, state.classAnswer);
  return Math.max(ve, answer) <= 22 ? 25 : 50;
}

/** Données projetées aux élèves, dans l’ordre de la variante. */
export function projectedData(state: SeanceState): { key: string; name: string; value: number; unit: string }[] {
  const v = variante(state);
  return v.donnees.map(key => {
    const q = quantity(key);
    const value = key === 'Ve' ? Number(equivalenceVolume(state.params).toFixed(2)) : state.params[key as keyof Params];
    return { key, name: q.name, value, unit: q.unite };
  });
}

export function verify(state: SeanceState, answer: number) {
  return verifyResult(answer, referenceValue(state), config.tolerance);
}

const NICE_CONCENTRATIONS = [0.02, 0.05, 0.08, 0.1, 0.12, 0.15, 0.2];
const NICE_VOLUMES = [10, 15, 20, 25];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Tire des données réalistes, avec un volume équivalent lisible sur une burette de 25 mL. */
export function randomParams(): Params {
  for (let attempt = 0; attempt < 50; attempt++) {
    const params = { Ca: pick(NICE_CONCENTRATIONS), Va: pick(NICE_VOLUMES), Cb: pick(NICE_CONCENTRATIONS) };
    const ve = equivalenceVolume(params);
    if (ve >= 6 && ve <= 22) return params;
  }
  return DEFAULT_SEANCE.params;
}
