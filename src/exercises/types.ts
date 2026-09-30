import type { IndicatorType } from '../models/dosageFortFort';
import type { VerificationResult } from '../types';

export type Level = '2de' | '1re' | 'Tle';
export type Params = Record<string, number>;

export interface Quantity {
  key: string;
  /** Symbole affiché (Ca, Vmère…). */
  symbol: string;
  /** Nom en toutes lettres, sans le symbole. */
  name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  /** Nombre de décimales à afficher pour une réponse. */
  digits: number;
}

export interface Variant {
  id: string;
  /** Grandeur que la classe doit calculer. */
  unknown: string;
  /** Grandeurs données dans l’énoncé. */
  given: string[];
  question: string;
}

export interface Correction {
  /** Relation utilisée, en toutes lettres. */
  law: string;
  /** Formule littérale. */
  formula: string;
  /** Application numérique. */
  numeric: string;
  note?: string;
}

interface ExerciseBase {
  id: string;
  title: string;
  /** Titre court pour les listes. */
  short: string;
  levels: Level[];
  duration: string;
  summary: string;
  /** Phrase de mise en situation projetée au-dessus des données. */
  context: string;
  /** Identifiants des fiches du catalogue de matériel. */
  equipment: string[];
  quantities: Record<string, Quantity>;
  /** Grandeurs que l’enseignant peut régler. Les autres sont calculées. */
  paramKeys: string[];
  variants: Variant[];
  defaults: Params;
  tolerance: number;
  random: () => Params;
  /** Valeur de n’importe quelle grandeur, réglable ou calculée. */
  value: (p: Params, key: string) => number;
  reference: (p: Params, variantId: string) => number;
  verify: (p: Params, variantId: string, answer: number) => VerificationResult;
  correction: (p: Params, variantId: string) => Correction;
  /** Message bloquant si les données ne permettent pas l’expérience. */
  warning: (p: Params) => string | null;
}

export interface TitrationExercise extends ExerciseBase {
  kind: 'titration';
  acid: { name: string; formula: string; pKa?: number };
  base: { name: string; formula: string };
  defaultIndicator: IndicatorType;
  /** Volume versé auquel le virage devrait se produire si `answer` était juste. */
  predictedVolume: (p: Params, variantId: string, answer: number) => number;
}

export interface PreparationExercise extends ExerciseBase {
  kind: 'preparation';
  method: 'dilution' | 'dissolution';
  solute: { name: string; formula: string; rgb: [number, number, number]; Cscale: number };
  /**
   * Ce que montre l’expérience :
   * - `amount` : volume prélevé (mL) ou masse pesée (g) ;
   * - `obtained` : concentration réellement obtenue ;
   * - `expected` : concentration à laquelle on compare la teinte ;
   * - `answerIsUsed` : vrai si la réponse de la classe sert à la manipulation,
   *   faux si elle prédit seulement la concentration obtenue.
   */
  experiment: (p: Params, variantId: string, answer: number) => {
    amount: number;
    obtained: number;
    expected: number;
    answerIsUsed: boolean;
  };
}

export type Exercise = TitrationExercise | PreparationExercise;
