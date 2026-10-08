import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../src/exercises';
import { fmt, parseDecimal } from '../src/lib/format';

const get = (id: string) => {
  const ex = EXERCISES.find(e => e.id === id);
  if (!ex) throw new Error(`exercice introuvable : ${id}`);
  return ex;
};

describe('Valeurs du guide du programme (Terminale D)', () => {
  it('dilution commerciale : 8,5 mL de HCl à 37 % (d = 1,16) pour 200 mL à 0,50 mol/L', () => {
    expect(get('dilution-commerciale').reference({ C: 0.5, V: 200 }, 'A')).toBeCloseTo(8.5, 1);
  });

  it('vin à 10 % vol : V₄ théorique ≈ 25,8 mL de sel de Mohr', () => {
    expect(get('dosage-ethanol-vin').reference({ pct: 10 }, 'A')).toBeCloseTo(25.75, 1);
  });

  it('vin : retrouver le degré alcoolique depuis V₄ arrondi', () => {
    const ex = get('dosage-ethanol-vin');
    const V4 = ex.value({ pct: 12 }, 'V4');
    const pct = (((10 * (6 * 0.1 * 20 - 0.2 * V4)) / (4 * 10)) * 46.07 * 100) / 789;
    expect(ex.verify({ pct: 12 }, 'B', pct).isCoherent).toBe(true);
  });

  it('produit ionique : pH 3 → [H₃O⁺] = 10⁻³ et [HO⁻] = 10⁻¹¹', () => {
    const ex = get('produit-ionique');
    expect(ex.reference({ pH: 3 }, 'A')).toBeCloseTo(1e-3, 6);
    expect(ex.reference({ pH: 3 }, 'B')).toBeCloseTo(1e-11, 14);
  });

  it('tampon : pH = pKa quand acide et base sont en quantités égales', () => {
    expect(get('solution-tampon').reference({ Ca: 0.1, Va: 50, Cb: 0.1, Vb: 50 }, 'A')).toBeCloseTo(4.76, 2);
  });

  it('cinétique : la vitesse de formation diminue au cours du temps', () => {
    const ex = get('vitesse-formation');
    expect(ex.reference({ t1: 0, t2: 10 }, 'A')).toBeGreaterThan(ex.reference({ t1: 20, t2: 30 }, 'A'));
  });

  it('vitesses : v(H₂C₂O₄) = 5/2 v(MnO₄⁻) et v(CO₂) = 5 v(MnO₄⁻)', () => {
    const ex = get('vitesses-stoechiometrie');
    expect(ex.reference({ vMnO4: 0.4 }, 'A')).toBeCloseTo(1, 5);
    expect(ex.reference({ vMnO4: 0.4 }, 'C')).toBeCloseTo(2, 5);
  });

  it('estérification : rendement de 67 % pour un mélange équimolaire', () => {
    const ex = get('rendement-esterification');
    expect(ex.reference({ n0: 0.5 }, 'A')).toBe(67);
    expect(ex.reference({ n0: 0.5 }, 'B')).toBeCloseTo(0.67 * 0.5 * 88.11, 2);
  });

  it('saponification : 3 mol de soude par mole d’huile, la soude limite avec 20 mL + 20 mL', () => {
    const ex = get('saponification');
    expect(ex.reference({ Vh: 20, Vs: 20 }, 'A')).toBeCloseTo(0.0617, 3);
    expect(ex.reference({ Vh: 20, Vs: 20 }, 'B')).toBeCloseTo(0.06 * 304.4, 1);
  });

  it('permanganate : Ve = 2 Cox Vox / (5 Cm)', () => {
    expect(get('dosage-permanganate').reference({ Cox: 0.05, Vox: 10 }, 'A')).toBeCloseTo(10, 1);
  });

  it('dosage de la méthylamine : Vae = Cb × Vb / Ca', () => {
    expect(get('dosage-amine-fort').reference({ Ca: 0.1, Va: 20, Cb: 0.08 }, 'A')).toBeCloseTo(25);
  });
});

describe('Notation scientifique', () => {
  it('formate les très petits nombres', () => {
    expect(fmt(3.16e-12, -3)).toBe('3,16 × 10⁻¹²');
    expect(fmt(1e-14, -2)).toBe('1 × 10⁻¹⁴');
    expect(fmt(9.999e-4, -2)).toBe('1 × 10⁻³');
  });

  it('lit « 1,5e-3 », « 1,5 × 10^-3 » et « 1,5 x 10⁻³ »', () => {
    expect(parseDecimal('1,5e-3')).toBeCloseTo(0.0015, 8);
    expect(parseDecimal('1,5 × 10^-3')).toBeCloseTo(0.0015, 8);
    expect(parseDecimal('1,5 x 10⁻³')).toBeCloseTo(0.0015, 8);
  });

  it('lit toujours les nombres ordinaires', () => {
    expect(parseDecimal('12,5')).toBe(12.5);
    expect(parseDecimal('abc')).toBeNull();
  });
});
