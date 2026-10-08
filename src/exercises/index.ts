import { dissolution, dilution } from './preparations';
import { dosageBaseFaible, dosageFaibleFort, dosageFortFort } from './titrations';
import { phAcideFaible, phAcideFort, phBaseForte } from './ph';
import type { Exercise } from './types';

export type { Exercise, Level, Params, PhExercise, PreparationExercise, TitrationExercise, Variant, Quantity, Correction } from './types';

/** Tous les exercices, dans l’ordre du programme. Ajoutez le vôtre ici. */
export const EXERCISES: Exercise[] = [dissolution, dilution, phAcideFort, phBaseForte, phAcideFaible, dosageFortFort, dosageFaibleFort, dosageBaseFaible];

export const DEFAULT_EXERCISE = dosageFortFort.id;

export function findExercise(id: string | undefined): Exercise | undefined {
  return EXERCISES.find(ex => ex.id === id);
}

export function findVariant(ex: Exercise, variantId: string) {
  return ex.variants.find(v => v.id === variantId) ?? ex.variants[0];
}

export const LEVEL_LABELS = { '2de': 'Seconde', '1re': 'Première', Tle: 'Terminale' } as const;
