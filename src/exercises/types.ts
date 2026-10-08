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
  /**
   * Solution dosée, dans le bécher. Son `pKa` est celui du couple de l’espèce
   * faible : avec `mirror`, c’est l’acide conjugué d’une base faible (NH₄⁺ / NH₃).
   */
  acid: { name: string; formula: string; pKa?: number };
  /** Solution versée, dans la burette. */
  base: { name: string; formula: string };
  /** Vrai : on dose une base faible par un acide fort. */
  mirror?: boolean;
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

/** Mesure de pH : on prédit le pH d’une solution (ou sa concentration), le pH-mètre tranche. */
export interface PhExercise extends ExerciseBase {
  kind: 'ph';
  solute: { name: string; formula: string; type: 'acide fort' | 'base forte' | 'acide faible'; pKa?: number };
  /** pH d’une solution de concentration `C` (mol/L), 25 °C. */
  phOf: (C: number) => number;
  /**
   * Ce que montre l’expérience :
   * - `measured` : pH lu sur le pH-mètre pour la solution préparée ;
   * - `target` : pH auquel on le compare (celui de l’énoncé, ou la prédiction de la classe) ;
   * - `answerIsUsed` : vrai si la réponse de la classe sert à préparer la solution.
   */
  experiment: (p: Params, variantId: string, answer: number) => {
    measured: number;
    target: number;
    concentration: number;
    answerIsUsed: boolean;
  };
  /** pH que suggère une réponse de la classe, pour la placer sur l’échelle. */
  phOfAnswer: (p: Params, variantId: string, answer: number) => number;
}

/** Ce que la classe voit à la fin de l’expérience d’un exercice de calcul. */
export type Figure =
  | {
      type: 'curve';
      xLabel: string;
      yLabel: string;
      points: { x: number; y: number }[];
      /** Sécante entre deux points de la courbe (vitesse moyenne). */
      secant?: { x1: number; y1: number; x2: number; y2: number };
    }
  | { type: 'bars'; unit: string; bars: { label: string; value: number; color?: string }[] }
  | { type: 'reading'; label: string; value: string; color?: string; detail?: string };

/**
 * Exercice de calcul : la classe calcule, puis un protocole pas à pas aboutit à
 * un résultat visible (une lecture, des barres, une courbe) qui donne raison
 * ou tort à sa réponse.
 */
export interface CalculExercise extends ExerciseBase {
  kind: 'calcul';
  /** Gestes à montrer, dans l’ordre. */
  protocol: (p: Params, variantId: string, answer: number) => string[];
  outcome: (p: Params, variantId: string, answer: number) => {
    figure: Figure;
    /** Phrase de conclusion de l’expérience. */
    summary: string;
    /** Vrai si l’expérience confirme la réponse de la classe. */
    agrees: boolean;
  };
}

export type Exercise = TitrationExercise | PreparationExercise | PhExercise | CalculExercise;
