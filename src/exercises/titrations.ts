import fortConfig from '../data/modules/dosage-fort-fort.json';
import faibleConfig from '../data/modules/dosage-faible-fort.json';
import type { ModuleConfig } from '../types';
import { fmt } from '../lib/format';
import { fromModule, makeVerify, pick } from './helpers';
import type { Params, TitrationExercise } from './types';

const CONCENTRATIONS = [0.02, 0.05, 0.08, 0.1, 0.12, 0.15, 0.2];
const VOLUMES = [10, 15, 20, 25];
const MAX_BURETTE = 50;

const ve = (p: Params) => (p.Ca * p.Va) / p.Cb;

/** Données réalistes, avec un volume équivalent lisible sur une burette de 25 mL. */
function randomTitration(fallback: Params): Params {
  for (let i = 0; i < 50; i++) {
    const p = { Ca: pick(CONCENTRATIONS), Va: pick(VOLUMES), Cb: pick(CONCENTRATIONS) };
    if (ve(p) >= 6 && ve(p) <= 22) return p;
  }
  return fallback;
}

function titration(
  config: ModuleConfig,
  extra: Pick<TitrationExercise, 'id' | 'short' | 'duration' | 'context' | 'acid' | 'base' | 'defaultIndicator' | 'equipment'>
): TitrationExercise {
  const base = fromModule(config, { Ve: { digits: 2 }, Ca: { digits: 3 }, Cb: { digits: 3 }, Va: { digits: 1 } });
  const defaults: Params = { Ca: 0.1, Va: 20, Cb: 0.1 };
  const value = (p: Params, key: string) => (key === 'Ve' ? ve(p) : p[key]);
  const reference = (p: Params, variantId: string) => {
    const unknown = base.variants.find(v => v.id === variantId)?.unknown ?? 'Ve';
    return value(p, unknown);
  };

  return {
    kind: 'titration',
    ...base,
    ...extra,
    paramKeys: ['Ca', 'Va', 'Cb'],
    defaults,
    random: () => randomTitration(defaults),
    value,
    reference,
    verify: makeVerify(reference, base.tolerance),
    predictedVolume: (p, variantId, answer) => (base.variants.find(v => v.id === variantId)?.unknown === 'Ve' ? answer : (answer * p.Va) / p.Cb),
    warning: p => (ve(p) > MAX_BURETTE - 5 ? `Avec ces données, l’équivalence est à ${fmt(ve(p), 1)} mL : c’est plus que la burette (50 mL). Diminuez Ca ou Va, ou augmentez Cb.` : null),
    correction: (p, variantId) => {
      const unknown = base.variants.find(v => v.id === variantId)?.unknown;
      const note = extra.acid.pKa !== undefined
        ? `L’acide éthanoïque est un acide faible : à l’équivalence, le pH vaut environ ${fmt(8.7, 1)} (milieu basique). La phénolphtaléine, qui vire entre 8,2 et 10, convient ; le BBT vire trop tôt. À la demi-équivalence, pH = pKa = ${fmt(extra.acid.pKa, 2)}.`
        : 'Acide fort et base forte : à l’équivalence, la solution est neutre (pH = 7). Le BBT, qui vire entre 6,0 et 7,6, convient.';
      return unknown === 'Ve'
        ? { law: 'À l’équivalence, les réactifs ont été introduits dans les proportions stœchiométriques : n(acide) = n(HO⁻).', formula: 'Ve = Ca × Va / Cb', numeric: `Ve = ${fmt(p.Ca, 3)} × ${fmt(p.Va)} / ${fmt(p.Cb, 3)} = ${fmt(ve(p), 2)} mL`, note }
        : { law: 'À l’équivalence, les réactifs ont été introduits dans les proportions stœchiométriques : n(acide) = n(HO⁻).', formula: 'Ca = Cb × Ve / Va', numeric: `Ca = ${fmt(p.Cb, 3)} × ${fmt(ve(p), 2)} / ${fmt(p.Va)} = ${fmt(p.Ca, 3)} mol/L`, note };
    },
  };
}

export const dosageFortFort = titration(fortConfig as ModuleConfig, {
  id: 'dosage-fort-fort',
  short: 'Dosage acide fort / base forte',
  duration: '30 min',
  context: 'On dose une solution d’acide chlorhydrique par une solution d’hydroxyde de sodium (soude).',
  acid: { name: 'acide chlorhydrique', formula: 'H₃O⁺ + Cl⁻' },
  base: { name: 'soude', formula: 'Na⁺ + HO⁻' },
  defaultIndicator: 'btb',
  equipment: ['burette', 'becher', 'pipette-jaugee', 'statif'],
});

export const dosageFaibleFort = titration(faibleConfig as ModuleConfig, {
  id: 'dosage-faible-fort',
  short: 'Dosage de l’acide éthanoïque',
  duration: '35 min',
  context: 'On dose une solution d’acide éthanoïque (CH₃COOH, pKa = 4,76) par une solution d’hydroxyde de sodium (soude).',
  acid: { name: 'acide éthanoïque', formula: 'CH₃COOH', pKa: 4.76 },
  base: { name: 'soude', formula: 'Na⁺ + HO⁻' },
  defaultIndicator: 'phenolphthalein',
  equipment: ['burette', 'becher', 'pipette-jaugee', 'statif'],
});
