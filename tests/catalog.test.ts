import { describe, expect, it } from 'vitest';
import { CATALOG } from '../src/data/catalog';
import { renderEquipmentSVG } from '../src/components/svg';

describe('Catalogue du matériel', () => {
  it('contient les six instruments de base', () => {
    expect(CATALOG.map(i => i.id).sort()).toEqual(['becher', 'burette', 'erlenmeyer', 'fiole-jaugee', 'pipette-jaugee', 'statif']);
  });

  it('a des identifiants uniques', () => {
    expect(new Set(CATALOG.map(i => i.id)).size).toBe(CATALOG.length);
  });

  it.each(CATALOG.map(i => [i.id, i] as const))('%s : fiche complète et schéma SVG', (_, item) => {
    expect(item.role.length).toBeGreaterThan(10);
    expect(item.utilisation.length).toBeGreaterThan(0);
    const svg = renderEquipmentSVG(item.schema);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });
});
