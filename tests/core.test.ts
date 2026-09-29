import { describe, it, expect } from 'vitest';
import { evaluateFormula } from '../src/core/formulaEvaluator';
import { verifyResult } from '../src/core/validator';

describe('Évaluateur de formules (formulaEvaluator)', () => {
  it('doit calculer correctement la formule du volume équivalent Ve = Ca * Va / Cb', () => {
    const scope = { Ca: 0.1, Va: 20, Cb: 0.1 };
    const res = evaluateFormula('Ca * Va / Cb', scope);
    expect(res).toBeCloseTo(20.0, 5);
  });

  it('doit calculer correctement la formule de la concentration Ca = Cb * Ve / Va', () => {
    const scope = { Cb: 0.2, Ve: 15, Va: 10 };
    const res = evaluateFormula('Cb * Ve / Va', scope);
    expect(res).toBeCloseTo(0.3, 5);
  });

  it('doit gérer les parenthèses et les priorités', () => {
    const scope = { A: 10, B: 2, C: 3 };
    const res = evaluateFormula('(A + B) * C', scope);
    expect(res).toBe(36);
  });

  it('doit lever une erreur en cas de division par zéro', () => {
    const scope = { Ca: 0.1, Va: 20, Cb: 0 };
    expect(() => evaluateFormula('Ca * Va / Cb', scope)).toThrow('Division par zéro');
  });
});

describe('Vérificateur de résultats (validator)', () => {
  it('doit valider un résultat exact avec 0% d\'erreur', () => {
    const res = verifyResult(20.0, 20.0, 0.02);
    expect(res.isCoherent).toBe(true);
    expect(res.diffPercent).toBe(0);
  });

  it('doit valider un résultat dans la marge de tolérance de 2%', () => {
    // 20.3 mL pour 20.0 mL => 1.5% d'écart
    const res = verifyResult(20.3, 20.0, 0.02);
    expect(res.isCoherent).toBe(true);
    expect(res.diffPercent).toBeCloseTo(1.5, 1);
  });

  it('doit rejeter un résultat hors tolérance (> 2%)', () => {
    // 21.0 mL pour 20.0 mL => 5% d'écart
    const res = verifyResult(21.0, 20.0, 0.02);
    expect(res.isCoherent).toBe(false);
    expect(res.diffPercent).toBeCloseTo(5.0, 1);
  });
});
