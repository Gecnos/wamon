import { makeVerify, pick } from './helpers';
import type { CalculExercise, Correction, Level, Params, Quantity, Variant } from './types';

/** Grandeur d’un exercice de calcul. `digits` négatif : notation scientifique. */
export function quantity(key: string, symbol: string, name: string, unit: string, min: number, max: number, step: number, digits: number): Quantity {
  return { key, symbol, name, unit, min, max, step, digits };
}

/** Grandeur constante donnée par l’énoncé (non réglable). */
export function constant(key: string, symbol: string, name: string, unit: string, value: number, digits: number): Quantity {
  return quantity(key, symbol, name, unit, value, value, 0.01, digits);
}

export function variant(id: string, unknown: string, given: string[], question: string): Variant {
  return { id, unknown, given, question };
}

export interface CalculSpec {
  id: string;
  title: string;
  short: string;
  summary: string;
  levels?: Level[];
  duration?: string;
  context: string;
  equipment?: string[];
  quantities: Quantity[];
  /** Grandeurs réglables par l’enseignant ; les autres sont constantes ou calculées. */
  paramKeys: string[];
  defaults: Params;
  /** Tirage au hasard de valeurs réalistes. */
  random: () => Params;
  variants: Variant[];
  tolerance?: number;
  /** Valeur de n’importe quelle grandeur à partir des grandeurs réglables. */
  value: (p: Params, key: string) => number;
  warning?: (p: Params) => string | null;
  /** Correction pour la grandeur cherchée. */
  correction: (p: Params, unknown: string) => Correction;
  protocol: CalculExercise['protocol'];
  outcome: CalculExercise['outcome'];
}

export { pick };

/** Construit un exercice de calcul à partir de sa description. */
export function calculExercise(spec: CalculSpec): CalculExercise {
  const quantities = Object.fromEntries(spec.quantities.map(q => [q.key, q]));
  const unknownOf = (variantId: string) => spec.variants.find(v => v.id === variantId)?.unknown ?? spec.variants[0].unknown;
  const reference = (p: Params, variantId: string) => spec.value(p, unknownOf(variantId));
  const tolerance = spec.tolerance ?? 0.03;
  return {
    kind: 'calcul',
    id: spec.id,
    title: spec.title,
    short: spec.short,
    summary: spec.summary,
    levels: spec.levels ?? ['Tle'],
    duration: spec.duration ?? '25 min',
    context: spec.context,
    equipment: spec.equipment ?? [],
    quantities,
    paramKeys: spec.paramKeys,
    variants: spec.variants,
    defaults: spec.defaults,
    tolerance,
    random: spec.random,
    value: spec.value,
    reference,
    verify: makeVerify(reference, tolerance),
    correction: (p, variantId) => spec.correction(p, unknownOf(variantId)),
    warning: spec.warning ?? (() => null),
    protocol: spec.protocol,
    outcome: spec.outcome,
  };
}
