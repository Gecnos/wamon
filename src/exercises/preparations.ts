import dilutionConfig from '../data/modules/dilution.json';
import dissolutionConfig from '../data/modules/dissolution.json';
import type { ModuleConfig } from '../types';
import { fmt } from '../lib/format';
import { dilutionConcentration, dilutionVolumeMere, dissolutionConcentration, dissolutionMasse } from '../models/preparation';
import { fromModule, makeVerify, pick } from './helpers';
import type { Params, PreparationExercise } from './types';

const unknownOf = (ex: { variants: { id: string; unknown: string }[] }, variantId: string) =>
  ex.variants.find(v => v.id === variantId)?.unknown;

// ─── Dilution ────────────────────────────────────────────────

const dilutionBase = fromModule(dilutionConfig as ModuleConfig, {
  Cmere: { symbol: 'Cmère', digits: 3 },
  Vmere: { symbol: 'Vmère', digits: 1 },
  Cfille: { symbol: 'Cfille', digits: 4 },
  Vfille: { symbol: 'Vfille', digits: 0 },
});

const PIPETTES = [2, 5, 10, 20, 25];
const FIOLES = [50, 100, 200, 250, 500];
const MERES = [0.05, 0.1, 0.2];

const dilutionValue = (p: Params, key: string) => (key === 'Vmere' ? dilutionVolumeMere(p.Cmere, p.Cfille, p.Vfille) : p[key]);
const dilutionReference = (p: Params, variantId: string) => dilutionValue(p, unknownOf(dilutionBase, variantId) ?? 'Vmere');

export const dilution: PreparationExercise = {
  kind: 'preparation',
  method: 'dilution',
  id: 'dilution',
  short: 'Dilution',
  duration: '25 min',
  context: 'On dispose d’une solution mère de permanganate de potassium, de pipettes jaugées et de fioles jaugées.',
  equipment: ['pipette-jaugee', 'fiole-jaugee', 'becher'],
  ...dilutionBase,
  paramKeys: ['Cmere', 'Cfille', 'Vfille'],
  defaults: { Cmere: 0.1, Cfille: 0.01, Vfille: 100 },
  // On tire une pipette et une fiole qui existent au laboratoire.
  random: () => {
    for (let i = 0; i < 50; i++) {
      const Cmere = pick(MERES);
      const Vfille = pick(FIOLES);
      const Vmere = pick(PIPETTES.filter(v => v <= Vfille / 4));
      const Cfille = Number(dilutionConcentration(Cmere, Vmere, Vfille).toFixed(4));
      if (Cfille >= 0.002) return { Cmere, Vfille, Cfille };
    }
    return { Cmere: 0.1, Cfille: 0.01, Vfille: 100 };
  },
  value: dilutionValue,
  reference: dilutionReference,
  verify: makeVerify(dilutionReference, dilutionBase.tolerance),
  warning: p => {
    if (p.Cfille >= p.Cmere) return 'La solution fille doit être moins concentrée que la solution mère.';
    return dilutionVolumeMere(p.Cmere, p.Cfille, p.Vfille) > p.Vfille / 2 ? 'Le volume à prélever dépasse la moitié de la fiole : choisissez une solution fille plus diluée.' : null;
  },
  solute: { name: 'permanganate de potassium', formula: 'K⁺ + MnO₄⁻', rgb: [128, 32, 140], Cscale: 0.02 },
  experiment: (p, variantId, answer) => {
    const Vmere = dilutionValue(p, 'Vmere');
    return unknownOf(dilutionBase, variantId) === 'Vmere'
      ? { amount: answer, obtained: dilutionConcentration(p.Cmere, answer, p.Vfille), expected: p.Cfille, answerIsUsed: true }
      : { amount: Vmere, obtained: p.Cfille, expected: answer, answerIsUsed: false };
  },
  correction: (p, variantId) => {
    const law = 'Au cours d’une dilution, la quantité de soluté se conserve : Cmère × Vmère = Cfille × Vfille.';
    return unknownOf(dilutionBase, variantId) === 'Vmere'
      ? { law, formula: 'Vmère = Cfille × Vfille / Cmère', numeric: `Vmère = ${fmt(p.Cfille, 4)} × ${fmt(p.Vfille)} / ${fmt(p.Cmere, 3)} = ${fmt(dilutionValue(p, 'Vmere'), 1)} mL`, note: `Facteur de dilution : F = Cmère / Cfille = ${fmt(p.Cmere / p.Cfille, 1)}. On prélève à la pipette jaugée, on verse dans la fiole jaugée, on complète avec de l’eau distillée jusqu’au trait de jauge puis on homogénéise.` }
      : { law, formula: 'Cfille = Cmère × Vmère / Vfille', numeric: `Cfille = ${fmt(p.Cmere, 3)} × ${fmt(dilutionValue(p, 'Vmere'), 1)} / ${fmt(p.Vfille)} = ${fmt(p.Cfille, 4)} mol/L`, note: `Facteur de dilution : F = Vfille / Vmère = ${fmt(p.Vfille / dilutionValue(p, 'Vmere'), 1)}.` };
  },
};

// ─── Dissolution ─────────────────────────────────────────────

const dissolutionBase = fromModule(dissolutionConfig as ModuleConfig, {
  C: { digits: 3 },
  V: { digits: 0 },
  M: { digits: 1 },
  m: { digits: 2 },
});

const dissolutionValue = (p: Params, key: string) => (key === 'm' ? dissolutionMasse(p.C, p.V, p.M) : p[key]);
const dissolutionReference = (p: Params, variantId: string) => dissolutionValue(p, unknownOf(dissolutionBase, variantId) ?? 'm');

export const dissolution: PreparationExercise = {
  kind: 'preparation',
  method: 'dissolution',
  id: 'dissolution',
  short: 'Dissolution',
  duration: '25 min',
  context: 'On dispose de sulfate de cuivre pentahydraté solide (CuSO₄, 5 H₂O), d’une balance et d’une fiole jaugée.',
  equipment: ['fiole-jaugee', 'becher'],
  ...dissolutionBase,
  paramKeys: ['C', 'V'],
  defaults: { C: 0.1, V: 100, M: 249.7 },
  random: () => ({ C: pick([0.05, 0.08, 0.1, 0.15, 0.2]), V: pick([50, 100, 200, 250]), M: 249.7 }),
  value: dissolutionValue,
  reference: dissolutionReference,
  verify: makeVerify(dissolutionReference, dissolutionBase.tolerance),
  warning: () => null,
  solute: { name: 'sulfate de cuivre', formula: 'Cu²⁺ + SO₄²⁻', rgb: [24, 108, 210], Cscale: 0.12 },
  experiment: (p, variantId, answer) => {
    const m = dissolutionValue(p, 'm');
    return unknownOf(dissolutionBase, variantId) === 'm'
      ? { amount: answer, obtained: dissolutionConcentration(answer, p.V, p.M), expected: p.C, answerIsUsed: true }
      : { amount: m, obtained: p.C, expected: answer, answerIsUsed: false };
  },
  correction: (p, variantId) => {
    const law = 'La quantité de matière de soluté vaut n = m / M, et la concentration C = n / V.';
    return unknownOf(dissolutionBase, variantId) === 'm'
      ? { law, formula: 'm = C × V × M (V en litres)', numeric: `m = ${fmt(p.C, 3)} × ${fmt(p.V / 1000, 3)} × ${fmt(p.M, 1)} = ${fmt(dissolutionValue(p, 'm'), 2)} g`, note: 'Attention à la conversion : le volume de la fiole est en mL, il faut l’exprimer en litres.' }
      : { law, formula: 'C = m / (M × V) (V en litres)', numeric: `C = ${fmt(dissolutionValue(p, 'm'), 2)} / (${fmt(p.M, 1)} × ${fmt(p.V / 1000, 3)}) = ${fmt(p.C, 3)} mol/L`, note: 'Attention à la conversion : le volume de la fiole est en mL, il faut l’exprimer en litres.' };
  },
};
