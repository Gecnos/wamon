import { describe, it, expect } from 'vitest';
import { generateRandomParams, createParameterFormHTML } from '../src/components/simulation/ParameterForm';
import { createSolutionModalHTML } from '../src/components/simulation/SolutionModal';
import { verifyResult } from '../src/core/validator';

import dosageConfig from '../src/data/modules/dosage-fort-fort.json';
import { ModuleConfig } from '../src/types';

describe('Composants Enseignant et Simulation (Phase 4)', () => {
  const config = dosageConfig as ModuleConfig;
  const varianteA = config.variantes[0];

  it('doit générer des paramètres aléatoires cohérents dans les plages min/max', () => {
    const params = generateRandomParams(config);
    expect(params.Ca).toBeGreaterThanOrEqual(config.grandeurs.Ca.min!);
    expect(params.Ca).toBeLessThanOrEqual(config.grandeurs.Ca.max!);

    expect(params.Va).toBeGreaterThanOrEqual(config.grandeurs.Va.min!);
    expect(params.Va).toBeLessThanOrEqual(config.grandeurs.Va.max!);

    expect(params.Cb).toBeGreaterThanOrEqual(config.grandeurs.Cb.min!);
    expect(params.Cb).toBeLessThanOrEqual(config.grandeurs.Cb.max!);
  });

  it('doit rendre le formulaire HTML avec les grandeurs et les boutons d\'action', () => {
    const html = createParameterFormHTML(config, varianteA, {
      varianteId: 'A',
      params: { Ca: 0.1, Va: 20, Cb: 0.1, Ve: 20 },
      userAnswer: 20,
      tolerance: 0.02,
      indicator: 'btb'
    });

    expect(html).toContain('Concentration de l\'acide (Ca)');
    expect(html).toContain('Exercice au hasard');
    expect(html).toContain('Lancer la simulation avec ce résultat');
  });

  it('doit afficher la modale de solution détaillée avec les calculs pas-à-pas', () => {
    const verif = verifyResult(20.0, 20.0, 0.02);
    const html = createSolutionModalHTML(verif, 'A', { Ca: 0.1, Va: 20, Cb: 0.1 });

    expect(html).toContain('Solution Détaillée de l\'Exercice');
    expect(html).toContain('Ca × Va = Cb × Ve');
    expect(html).toContain('20.00 mL');
  });
});
