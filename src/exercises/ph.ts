import acideFortConfig from '../data/modules/ph-acide-fort.json';
import baseForteConfig from '../data/modules/ph-base-forte.json';
import acideFaibleConfig from '../data/modules/ph-acide-faible.json';
import type { ModuleConfig } from '../types';
import { fmt } from '../lib/format';
import { conjugateBaseConcentration, phStrongAcid, phStrongBase, phWeakAcid } from '../models/ph';
import { fromModule, makeVerify, pick } from './helpers';
import type { Correction, Params, PhExercise } from './types';

/** Concentrations du programme pour les acides et bases forts : 10⁻³ à 10⁻¹ mol/L. */
const CONCENTRATIONS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1];

/**
 * Pour l'acide faible, on reste au-dessus de 0,05 mol/L : en dessous, la part
 * d'acide ayant réagi n'est plus négligeable, la formule pH = ½ (pKa − log C)
 * enseignée en classe s'écarte de la valeur exacte et sortirait de la tolérance.
 */
const CONCENTRATIONS_FAIBLE = [0.05, 0.08, 0.1, 0.15, 0.2];

/** Description d'un exercice de pH : la chimie (`phOf`) et les textes. */
interface PhSpec {
  config: ModuleConfig;
  id: string;
  short: string;
  context: string;
  solute: PhExercise['solute'];
  phOf: (C: number) => number;
  defaults: Params;
  randoms: number[];
  /** Correction pour la grandeur cherchée (`pH`, `C` ou `A`). */
  correction: (p: Params, unknown: string, pH: number) => Correction;
}

/**
 * Fabrique un exercice de pH à partir de son module JSON (grandeurs, variantes)
 * et de son modèle. Trois grandeurs peuvent être cherchées :
 * - `pH`, calculé à partir de C ;
 * - `C`, à partir du pH annoncé dans l'énoncé ;
 * - `A`, la concentration en base conjuguée (acide faible seulement).
 */
function phExercise(spec: PhSpec): PhExercise {
  const base = fromModule(spec.config, { C: { digits: 3 }, pH: { digits: 2, symbol: 'pH' }, pKa: { digits: 2 }, A: { symbol: '[CH₃COO⁻]', digits: 5 } });
  const unknownOf = (variantId: string) => base.variants.find(v => v.id === variantId)?.unknown ?? 'pH';
  const pKa = spec.solute.pKa;

  const value = (p: Params, key: string) => {
    // Le pH est arrondi à 0,01 comme sur l'afficheur : c'est cette valeur que la
    // classe lit dans l'énoncé, donc celle à partir de laquelle elle calcule C.
    if (key === 'pH') return Number(spec.phOf(p.C).toFixed(2));
    if (key === 'pKa') return pKa ?? 0;
    if (key === 'A') return pKa !== undefined ? conjugateBaseConcentration(p.C, pKa) : 0;
    return p[key];
  };
  const reference = (p: Params, variantId: string) => value(p, unknownOf(variantId));

  // Traduit la réponse de la classe en pH, pour la placer sur l'échelle de teintes.
  const phOfAnswer = (_p: Params, variantId: string, answer: number) => {
    const unknown = unknownOf(variantId);
    if (unknown === 'C') return spec.phOf(answer);
    if (unknown === 'A') return -Math.log10(answer);
    return answer;
  };

  return {
    kind: 'ph',
    ...base,
    id: spec.id,
    short: spec.short,
    duration: '20 min',
    context: spec.context,
    equipment: ['becher'],
    solute: spec.solute,
    paramKeys: ['C'],
    defaults: spec.defaults,
    random: () => ({ C: pick(spec.randoms) }),
    value,
    reference,
    verify: makeVerify(reference, base.tolerance),
    warning: () => null,
    phOf: spec.phOf,
    phOfAnswer,
    experiment: (p, variantId, answer) => {
      const unknown = unknownOf(variantId);
      // Si la classe cherche C, on prépare réellement la solution avec sa valeur :
      // le pH mesuré dira si elle retombe sur celui de l'énoncé.
      if (unknown === 'C') return { measured: spec.phOf(answer), target: value(p, 'pH'), concentration: answer, answerIsUsed: true };
      return { measured: spec.phOf(p.C), target: phOfAnswer(p, variantId, answer), concentration: p.C, answerIsUsed: false };
    },
    correction: (p, variantId) => spec.correction(p, unknownOf(variantId), value(p, 'pH')),
  };
}

export const phAcideFort = phExercise({
  config: acideFortConfig as ModuleConfig,
  id: 'ph-acide-fort',
  short: 'pH d’un acide fort',
  context: 'On dispose d’une solution d’acide chlorhydrique (H₃O⁺ + Cl⁻), d’un pH-mètre étalonné et d’indicateur universel.',
  solute: { name: 'acide chlorhydrique', formula: 'H₃O⁺ + Cl⁻', type: 'acide fort' },
  phOf: phStrongAcid,
  defaults: { C: 0.01 },
  randoms: CONCENTRATIONS,
  correction: (p, unknown, pH) => {
    const law = 'L’acide chlorhydrique est un acide fort : sa réaction avec l’eau est totale, donc [H₃O⁺] = C. Cette relation vaut pour 10⁻⁶ < C < 10⁻¹ mol/L.';
    const note = 'Un résultat obtenu avec [H₃O⁺] = 10^(−pH) s’écrit avec trois chiffres significatifs au plus, comme le pH mesuré.';
    return unknown === 'pH'
      ? { law, formula: 'pH = −log [H₃O⁺] = −log C', numeric: `pH = −log(${fmt(p.C, 3)}) = ${fmt(pH, 2)}`, note }
      : { law, formula: 'C = [H₃O⁺] = 10^(−pH)', numeric: `C = 10^(−${fmt(pH, 2)}) = ${fmt(p.C, 3)} mol/L`, note };
  },
});

export const phBaseForte = phExercise({
  config: baseForteConfig as ModuleConfig,
  id: 'ph-base-forte',
  short: 'pH d’une base forte',
  context: 'On dispose d’une solution d’hydroxyde de sodium (Na⁺ + HO⁻), d’un pH-mètre étalonné et d’indicateur universel. La température est de 25 °C.',
  solute: { name: 'hydroxyde de sodium', formula: 'Na⁺ + HO⁻', type: 'base forte' },
  phOf: phStrongBase,
  defaults: { C: 0.01 },
  randoms: CONCENTRATIONS,
  correction: (p, unknown, pH) => {
    const law = 'L’hydroxyde de sodium est une base forte : [HO⁻] = C. Avec Ke = [H₃O⁺] × [HO⁻] = 10⁻¹⁴ à 25 °C, on obtient [H₃O⁺] = 10⁻¹⁴ / C.';
    const note = 'Piège fréquent : −log C donne le pOH, pas le pH. Une solution de base a un pH supérieur à 7.';
    return unknown === 'pH'
      ? { law, formula: 'pH = −log [H₃O⁺] = 14 + log C', numeric: `pH = 14 + log(${fmt(p.C, 3)}) = ${fmt(pH, 2)}`, note }
      : { law, formula: 'C = [HO⁻] = 10^(pH − 14)', numeric: `C = 10^(${fmt(pH, 2)} − 14) = ${fmt(p.C, 3)} mol/L`, note };
  },
});

export const phAcideFaible = phExercise({
  config: acideFaibleConfig as ModuleConfig,
  id: 'ph-acide-faible',
  short: 'pH d’un acide faible',
  context: 'On dispose d’une solution d’acide éthanoïque (CH₃COOH, pKa = 4,76), d’un pH-mètre étalonné et d’indicateur universel.',
  solute: { name: 'acide éthanoïque', formula: 'CH₃COOH', type: 'acide faible', pKa: 4.76 },
  phOf: C => phWeakAcid(C, 4.76),
  defaults: { C: 0.1 },
  randoms: CONCENTRATIONS_FAIBLE,
  correction: (p, unknown, pH) => {
    const law = 'L’acide éthanoïque réagit partiellement avec l’eau. Si peu d’acide a réagi, [CH₃COOH] ≈ C et l’électroneutralité donne [H₃O⁺] ≈ [CH₃COO⁻].';
    if (unknown === 'pH') {
      return { law, formula: 'pH = ½ (pKa − log C)', numeric: `pH = ½ × (4,76 − log(${fmt(p.C, 3)})) = ${fmt(pH, 2)}`, note: 'À concentration égale, le pH d’un acide faible est bien plus élevé que celui d’un acide fort : l’acide éthanoïque à 0,1 mol/L a un pH proche de 2,9, l’acide chlorhydrique de même concentration un pH de 1.' };
    }
    if (unknown === 'C') {
      return { law, formula: 'C = 10^(pKa − 2 pH)', numeric: `C = 10^(4,76 − 2 × ${fmt(pH, 2)}) = ${fmt(p.C, 3)} mol/L`, note: 'On retrouve la concentration en supposant que peu d’acide a réagi. Le rapport [CH₃COO⁻] / C est de l’ordre de quelques pour cent.' };
    }
    return { law: 'Électroneutralité : [H₃O⁺] = [CH₃COO⁻] + [HO⁻]. En milieu acide, [HO⁻] est négligeable.', formula: '[CH₃COO⁻] = [H₃O⁺] = 10^(−pH)', numeric: `[CH₃COO⁻] = 10^(−${fmt(pH, 2)}) = ${fmt(conjugateBaseConcentration(p.C, 4.76), 5)} mol/L`, note: 'Cette valeur est faible devant C : l’acide éthanoïque est un acide faible.' };
  },
});
