import { dissolution, dilution } from './preparations';
import {
  constanteAcidite, dilutionCommerciale, dosagePermanganate, dosageVin, predominance, produitIonique,
  rendementEsterification, saponification, tampon, vitesseFormation, vitessesStoechiometrie,
} from './chimie';
import { dosageAmine, dosageBaseFaible, dosageFaibleFort, dosageFortFort } from './titrations';
import { phAcideFaible, phAcideFort, phBaseForte } from './ph';
import type { Exercise } from './types';

export type { CalculExercise, Exercise, Figure, Level, Params, PhExercise, PreparationExercise, TitrationExercise, Variant, Quantity, Correction } from './types';

/** Tous les exercices, dans l’ordre du programme. Ajoutez le vôtre ici. */
export const EXERCISES: Exercise[] = [
  // Solutions : préparation
  dissolution, dilution, dilutionCommerciale,
  // pH et couples acide-base
  produitIonique, phAcideFort, phBaseForte, phAcideFaible, constanteAcidite, predominance, tampon,
  // Dosages
  dosageFortFort, dosageFaibleFort, dosageBaseFaible, dosageAmine, dosagePermanganate,
  // Cinétique
  vitesseFormation, vitessesStoechiometrie,
  // Chimie organique
  rendementEsterification, saponification, dosageVin,
];

export const DEFAULT_EXERCISE = dosageFortFort.id;

export function findExercise(id: string | undefined): Exercise | undefined {
  return EXERCISES.find(ex => ex.id === id);
}

export function findVariant(ex: Exercise, variantId: string) {
  return ex.variants.find(v => v.id === variantId) ?? ex.variants[0];
}

export const LEVEL_LABELS = { '2de': 'Seconde', '1re': 'Première', Tle: 'Terminale' } as const;
