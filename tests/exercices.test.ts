import { describe, expect, it } from 'vitest';
import { titrationPoint, weakAcidPH } from '../src/models/titration';
import { dilutionVolumeMere, dissolutionMasse, dissolutionConcentration, tint } from '../src/models/preparation';
import { EXERCISES } from '../src/exercises';

describe('Dosage acide faible / base forte', () => {
  const setup = { Ca: 0.1, Va: 20, Cb: 0.1, pKa: 4.76 };

  it('donne le pH d’un acide faible seul (≈ 2,88 pour 0,1 mol/L)', () => {
    expect(weakAcidPH(0.1, 20, 0.1, 0, 4.76)).toBeCloseTo(2.88, 1);
  });

  it('vérifie pH = pKa à la demi-équivalence', () => {
    expect(titrationPoint(setup, 10).pH).toBeCloseTo(4.76, 1);
  });

  it('donne un pH basique à l’équivalence (≈ 8,7)', () => {
    expect(titrationPoint(setup, 20).pH).toBeCloseTo(8.72, 1);
  });

  it('rejoint le dosage fort après l’équivalence', () => {
    const weak = titrationPoint(setup, 25).pH;
    const strong = titrationPoint({ Ca: 0.1, Va: 20, Cb: 0.1 }, 25).pH;
    expect(Math.abs(weak - strong)).toBeLessThan(0.05);
  });
});

describe('Préparation de solutions', () => {
  it('dilution : 10 mL de mère à 0,10 mol/L pour 100 mL à 0,010 mol/L', () => {
    expect(dilutionVolumeMere(0.1, 0.01, 100)).toBeCloseTo(10);
  });

  it('dissolution : 2,50 g de CuSO₄·5H₂O pour 100 mL à 0,10 mol/L', () => {
    expect(dissolutionMasse(0.1, 100, 249.7)).toBeCloseTo(2.497, 3);
    expect(dissolutionConcentration(2.497, 100, 249.7)).toBeCloseTo(0.1, 4);
  });

  it('une solution plus concentrée est plus foncée', () => {
    const alpha = (s: string) => Number(s.match(/[\d.]+\)$/)![0].replace(')', ''));
    expect(alpha(tint([0, 0, 0], 0.2, 0.1))).toBeGreaterThan(alpha(tint([0, 0, 0], 0.1, 0.1)));
  });
});

describe('Catalogue d’exercices', () => {
  it.each(EXERCISES.map(e => [e.id, e] as const))('%s : chaque variante a une réponse cohérente', (_, ex) => {
    for (const v of ex.variants) {
      const ref = ex.reference(ex.defaults, v.id);
      expect(Number.isFinite(ref)).toBe(true);
      expect(ref).toBeGreaterThan(0);
      // Répondre la valeur exacte doit être jugé cohérent.
      expect(ex.verify(ex.defaults, v.id, ref).isCoherent).toBe(true);
    }
  });

  it.each(EXERCISES.map(e => [e.id, e] as const))('%s : les tirages au hasard restent dans les bornes', (_, ex) => {
    for (let i = 0; i < 30; i++) {
      const p = ex.random();
      for (const key of ex.paramKeys) {
        const q = ex.quantities[key];
        expect(p[key]).toBeGreaterThanOrEqual(q.min);
        expect(p[key]).toBeLessThanOrEqual(q.max);
      }
    }
  });
});

describe('Corrections', () => {
  it.each(EXERCISES.map(e => [e.id, e] as const))('%s : la correction affiche la valeur exacte', (_, ex) => {
    for (const v of ex.variants) {
      const c = ex.correction(ex.defaults, v.id);
      expect(c.formula).toContain('=');
      expect(c.numeric).toContain('=');
    }
  });

  it('dosage fort : Ve = Ca × Va / Cb', () => {
    const ex = EXERCISES.find(e => e.id === 'dosage-fort-fort')!;
    expect(ex.reference({ Ca: 0.1, Va: 20, Cb: 0.08 }, 'A')).toBeCloseTo(25);
  });
});
