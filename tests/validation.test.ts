import { describe, it, expect } from 'vitest';
import { calculateDilution } from '../src/models/dilution';

import dilutionConfig from '../src/data/modules/dilution.json';
import { ModuleConfig } from '../src/types';

describe('Second module de validation : Dilution (Phase 5)', () => {
  const config = dilutionConfig as ModuleConfig;

  it('doit posséder une configuration valide conforme au schéma §6', () => {
    expect(config.id).toBe('dilution');
    expect(config.variantes.length).toBe(2);
    expect(config.grandeurs.Cmere).toBeDefined();
    expect(config.grandeurs.Vmere).toBeDefined();
  });

  it('doit calculer le volume de mère Vmere à prélever pour la variante A', () => {
    // Cmere = 1.0 mol/L, Cfille = 0.1 mol/L, Vfille = 100 mL => Vmere = 10 mL
    const res = calculateDilution({ Cmere: 1.0, Cfille: 0.1, Vfille: 100 });
    expect(res.Vmere).toBe(10);
    expect(res.facteurDilution).toBe(10);
  });

  it('doit calculer la concentration fille Cfille pour la variante B', () => {
    // Cmere = 2.0 mol/L, Vmere = 20 mL, Vfille = 200 mL => Cfille = 0.2 mol/L
    const res = calculateDilution({ Cmere: 2.0, Vmere: 20, Vfille: 200 });
    expect(res.Cfille).toBe(0.2);
    expect(res.facteurDilution).toBe(10);
  });
});
