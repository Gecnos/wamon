import type { ModuleConfig } from '../types';
import { verifyResult } from '../core/validator';
import { decimalsOf } from '../lib/format';
import type { Level, Params, Quantity, Variant } from './types';

const LEVELS: Record<string, Level> = { '2nde': '2de', '2de': '2de', '1ere': '1re', '1re': '1re', terminale: 'Tle', Tle: 'Tle' };

/** Lit les grandeurs, variantes et niveaux depuis un fichier de module JSON. */
export function fromModule(config: ModuleConfig, overrides: Record<string, Partial<Quantity>> = {}) {
  const quantities: Record<string, Quantity> = {};
  for (const [key, g] of Object.entries(config.grandeurs)) {
    const step = g.step ?? 1;
    quantities[key] = {
      key,
      symbol: key,
      name: g.label.replace(/\s*\([^)]*\)\s*$/, ''),
      unit: g.unite,
      min: g.min ?? 0,
      max: g.max ?? Infinity,
      step,
      digits: Math.max(2, decimalsOf(step)),
      ...overrides[key],
    };
  }
  const variants: Variant[] = config.variantes.map(v => ({
    id: v.id,
    unknown: v.inconnue,
    given: v.donnees,
    question: v.description ?? '',
  }));
  const levels = config.niveau.map(n => LEVELS[n] ?? (n as Level));
  return { quantities, variants, levels, tolerance: config.tolerance, title: config.titre, summary: config.description ?? '' };
}

export function makeVerify(reference: (p: Params, variantId: string) => number, tolerance: number) {
  return (p: Params, variantId: string, answer: number) => verifyResult(answer, reference(p, variantId), tolerance);
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
