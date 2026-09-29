import { describe, it, expect } from 'vitest';
import { ALL_CATALOG_ITEMS, createCatalogViewHTML } from '../src/components/catalog/CatalogView';
import { renderEquipmentSVG } from '../src/components/svg';
import { createObjectDetailModalHTML } from '../src/components/catalog/ObjectDetailModal';

describe('Catalogue du Matériel (Phase 2)', () => {
  it('doit contenir les 6 objets initiaux du MVP', () => {
    expect(ALL_CATALOG_ITEMS.length).toBe(6);
    const ids = ALL_CATALOG_ITEMS.map(i => i.id);
    expect(ids).toContain('burette');
    expect(ids).toContain('pipette-jaugee');
    expect(ids).toContain('fiole-jaugee');
    expect(ids).toContain('becher');
    expect(ids).toContain('erlenmeyer');
    expect(ids).toContain('statif');
  });

  it('doit générer les rendus SVG pour tous les schémas du catalogue', () => {
    for (const item of ALL_CATALOG_ITEMS) {
      const svg = renderEquipmentSVG(item.schema);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    }
  });

  it('doit afficher correctement le HTML de la fiche d\'objet en mode projection', () => {
    const buretteItem = ALL_CATALOG_ITEMS.find(i => i.id === 'burette')!;
    const html = createObjectDetailModalHTML(buretteItem);
    expect(html).toContain('Burette graduée');
    expect(html).toContain('Consignes de Sécurité');
    expect(html).toContain('Rincer la burette avec la solution titrante.');
  });

  it('doit masquer les noms en mode "Nommer" s\'ils ne sont pas révélés', () => {
    const html = createCatalogViewHTML({
      categoryFilter: 'all',
      isModeNommer: true,
      revealedItemIds: new Set(),
      isModeComparer: false,
      selectedCompareIds: [],
      activeModalItemId: null,
    });
    expect(html).toContain('❓ ??? (Cliquer pour révéler)');
  });
});
