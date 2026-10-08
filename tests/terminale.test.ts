import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../src/exercises';
import { conjugateBaseConcentration, phStrongAcid, phStrongBase, phWeakAcid, universalColor } from '../src/models/ph';
import { titrationPoint } from '../src/models/titration';

describe('Dosage d’une base faible (ammoniac) par un acide fort', () => {
  const setup = { Ca: 0.1, Va: 20, Cb: 0.1, pKa: 9.25, mirror: true };

  it('donne le pH de l’ammoniac seul (≈ 11,1 pour 0,1 mol/L)', () => {
    expect(titrationPoint(setup, 0).pH).toBeCloseTo(11.12, 1);
  });

  it('vérifie pH = pKa à la demi-équivalence', () => {
    expect(titrationPoint(setup, 10).pH).toBeCloseTo(9.25, 1);
  });

  it('donne un pH acide à l’équivalence (≈ 5,3)', () => {
    expect(titrationPoint(setup, 20).pH).toBeCloseTo(5.28, 1);
  });

  it('rejoint le dosage fort après l’équivalence (acide en excès)', () => {
    const weak = titrationPoint(setup, 25).pH;
    const strong = titrationPoint({ Ca: 0.1, Va: 20, Cb: 0.1 }, 25).pH;
    expect(Math.abs(weak - (14 - strong))).toBeLessThan(0.05);
  });

  it('décroît quand on verse de l’acide', () => {
    expect(titrationPoint(setup, 5).pH).toBeGreaterThan(titrationPoint(setup, 15).pH);
  });
});

describe('pH de solutions aqueuses', () => {
  it('acide fort : pH = −log C', () => {
    expect(phStrongAcid(0.01)).toBeCloseTo(2, 5);
  });

  it('base forte : pH = 14 + log C', () => {
    expect(phStrongBase(0.01)).toBeCloseTo(12, 5);
  });

  it('acide faible : pH ≈ ½ (pKa − log C) pour une solution assez concentrée', () => {
    expect(phWeakAcid(0.1, 4.76)).toBeCloseTo(0.5 * (4.76 + 1), 1);
  });

  it('un acide faible est moins acide qu’un acide fort de même concentration', () => {
    expect(phWeakAcid(0.1, 4.76)).toBeGreaterThan(phStrongAcid(0.1));
  });

  it('[CH₃COO⁻] vaut [H₃O⁺] en milieu acide', () => {
    expect(conjugateBaseConcentration(0.1, 4.76)).toBeCloseTo(10 ** -phWeakAcid(0.1, 4.76), 6);
  });

  it('l’indicateur universel va du rouge (acide) au violet (basique)', () => {
    const [r1, , b1] = universalColor(1).match(/\d+/g)!.map(Number);
    const [r13, , b13] = universalColor(13).match(/\d+/g)!.map(Number);
    expect(r1).toBeGreaterThan(b1);
    expect(b13).toBeGreaterThan(r13 - 1);
  });
});

describe('Exercices de terminale', () => {
  it.each(['ph-acide-fort', 'ph-base-forte', 'ph-acide-faible', 'dosage-base-faible-fort'])('%s est au catalogue en terminale', id => {
    const ex = EXERCISES.find(e => e.id === id)!;
    expect(ex).toBeDefined();
    expect(ex.levels).toContain('Tle');
  });

  it('pH d’un acide fort : la réponse exacte de chaque variante est jugée cohérente', () => {
    const ex = EXERCISES.find(e => e.id === 'ph-acide-fort')!;
    for (const v of ex.variants) expect(ex.verify(ex.defaults, v.id, ex.reference(ex.defaults, v.id)).isCoherent).toBe(true);
  });

  it('pH d’une base forte : l’erreur pOH / pH est détectée', () => {
    const ex = EXERCISES.find(e => e.id === 'ph-base-forte')!;
    expect(ex.verify({ C: 0.01 }, 'A', 2).isCoherent).toBe(false);
    expect(ex.verify({ C: 0.01 }, 'A', 12).isCoherent).toBe(true);
  });

  it('acide faible : retrouver C depuis le pH arrondi reste dans la tolérance', () => {
    const ex = EXERCISES.find(e => e.id === 'ph-acide-faible')!;
    for (const C of [0.05, 0.08, 0.1, 0.15, 0.2]) {
      const pH = ex.value({ C }, 'pH');
      const found = 10 ** (4.76 - 2 * pH);
      expect(ex.verify({ C }, 'B', found).isCoherent).toBe(true);
    }
  });

  it('acide faible : [CH₃COO⁻] déduite du pH arrondi reste dans la tolérance', () => {
    const ex = EXERCISES.find(e => e.id === 'ph-acide-faible')!;
    for (const C of [0.05, 0.08, 0.1, 0.15, 0.2]) {
      const found = 10 ** -ex.value({ C }, 'pH');
      expect(ex.verify({ C }, 'C', found).isCoherent).toBe(true);
    }
  });

  it('dosage de l’ammoniac : Vae = Cb × Vb / Ca', () => {
    const ex = EXERCISES.find(e => e.id === 'dosage-base-faible-fort')!;
    expect(ex.reference({ Ca: 0.1, Va: 20, Cb: 0.08 }, 'A')).toBeCloseTo(25);
    expect(ex.correction(ex.defaults, 'A').formula).toBe('Ve = Cb × Vb / Ca');
  });

  it('l’expérience de pH utilise la réponse de la classe quand elle cherche C', () => {
    const ex = EXERCISES.find(e => e.id === 'ph-acide-fort');
    if (ex?.kind !== 'ph') throw new Error('type');
    const wrong = ex.experiment({ C: 0.01 }, 'B', 0.1);
    expect(wrong.answerIsUsed).toBe(true);
    expect(Math.abs(wrong.measured - wrong.target)).toBeGreaterThan(0.5);
  });
});
