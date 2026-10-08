import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../src/exercises';
import { SCENES } from '../src/features/calcul/sim/scenes';

const calculs = EXERCISES.filter(ex => ex.kind === 'calcul');

describe('Simulations des exercices de calcul', () => {
  it('il y a des exercices de calcul', () => {
    expect(calculs.length).toBeGreaterThanOrEqual(11);
  });

  it.each(calculs.map(ex => [ex.id, ex] as const))('%s a une simulation', id => {
    expect(SCENES[id]).toBeTypeOf('function');
  });

  it.each(calculs.map(ex => [ex.id, ex] as const))('%s : la simulation se dessine à chaque instant, pour chaque variante', (_, ex) => {
    if (ex.kind !== 'calcul') return;
    const Scene = SCENES[ex.id];
    for (const variant of ex.variants) {
      const answer = ex.reference(ex.defaults, variant.id);
      const n = ex.protocol(ex.defaults, variant.id, answer).length;
      const outcome = ex.outcome(ex.defaults, variant.id, answer);
      for (const t of [0, 0.15, 0.4, 0.7, 0.99, 1]) {
        const html = renderToStaticMarkup(createElement('svg', null, createElement(Scene, { ex, params: ex.defaults, variantId: variant.id, answer, t, n, outcome })));
        expect(html).toContain('<g');
        expect(html).not.toContain('NaN');
      }
    }
  });

  it('une réponse fausse change ce que la simulation montre', () => {
    const vin = calculs.find(ex => ex.id === 'dosage-ethanol-vin');
    if (vin?.kind !== 'calcul') throw new Error('exercice introuvable');
    const juste = vin.outcome(vin.defaults, 'A', vin.reference(vin.defaults, 'A'));
    const faux = vin.outcome(vin.defaults, 'A', 12);
    expect(juste.agrees).toBe(true);
    expect(faux.agrees).toBe(false);
    expect(faux.figure.type === 'reading' && faux.figure.value).toBe('Vert');
  });
});
