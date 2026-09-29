import { describe, it, expect } from 'vitest';
import { calculateTitrationPoint } from '../src/models/dosageFortFort';

describe('Modèle physique Dosage Acide Fort / Base Forte', () => {
  const Ca = 0.10; // mol/L
  const Va = 20.0; // mL
  const Cb = 0.10; // mol/L
  // Ve théorique = 20.0 mL

  it('doit calculer le pH initial à Vb = 0 mL (pH = 1.0)', () => {
    const p = calculateTitrationPoint(Ca, Va, Cb, 0, 'btb');
    expect(p.pH).toBe(1.0);
    expect(p.colorLabel).toContain('Jaune');
  });

  it('doit calculer le pH avant l\'équivalence à Vb = 10 mL (pH = 1.48)', () => {
    // [H3O+] = (0.1*20 - 0.1*10)/(20 + 10) = 1.0 / 30 = 0.0333 mol/L => pH = -log10(0.0333) = 1.48
    const p = calculateTitrationPoint(Ca, Va, Cb, 10, 'btb');
    expect(p.pH).toBeCloseTo(1.48, 2);
  });

  it('doit être exactement à l\'équivalence à Vb = 20 mL (pH = 7.00)', () => {
    const p = calculateTitrationPoint(Ca, Va, Cb, 20, 'btb');
    expect(p.pH).toBe(7.00);
    expect(p.isEquivalence).toBe(true);
    expect(p.colorLabel).toContain('Vert'); // BTB virage vert à pH 7
  });

  it('doit calculer le pH après l\'équivalence à Vb = 30 mL (pH = 12.30)', () => {
    // [HO-] = (0.1*30 - 0.1*20)/(20 + 30) = 1.0 / 50 = 0.020 mol/L => pH = 14 + log10(0.02) = 12.30
    const p = calculateTitrationPoint(Ca, Va, Cb, 30, 'btb');
    expect(p.pH).toBeCloseTo(12.30, 2);
    expect(p.colorLabel).toContain('Bleu');
  });

  it('doit gérer le virage de la phénolphtaléine (incolore -> rose)', () => {
    const pAcid = calculateTitrationPoint(Ca, Va, Cb, 0, 'phenolphthalein');
    expect(pAcid.colorLabel).toContain('Incolore');

    const pBase = calculateTitrationPoint(Ca, Va, Cb, 30, 'phenolphthalein');
    expect(pBase.colorLabel).toContain('Rose');
  });
});
