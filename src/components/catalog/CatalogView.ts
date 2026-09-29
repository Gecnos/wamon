import { CatalogItem } from '../../types';
import { renderEquipmentSVG } from '../svg';

import buretteData from '../../data/catalog/burette.json';
import pipetteData from '../../data/catalog/pipette-jaugee.json';
import fioleData from '../../data/catalog/fiole-jaugee.json';
import becherData from '../../data/catalog/becher.json';
import erlenmeyerData from '../../data/catalog/erlenmeyer.json';
import statifData from '../../data/catalog/statif.json';

export const ALL_CATALOG_ITEMS: CatalogItem[] = [
  buretteData as CatalogItem,
  pipetteData as CatalogItem,
  fioleData as CatalogItem,
  becherData as CatalogItem,
  erlenmeyerData as CatalogItem,
  statifData as CatalogItem,
];

export interface CatalogState {
  categoryFilter: string;
  isModeNommer: boolean;
  revealedItemIds: Set<string>;
  isModeComparer: boolean;
  selectedCompareIds: string[];
  activeModalItemId: string | null;
}

export function createCatalogViewHTML(state: CatalogState): string {
  const categories = [
    { id: 'all', label: 'Tout le matériel' },
    { id: 'mesure-volume', label: 'Mesure de volume' },
    { id: 'contenants-reaction', label: 'Contenants & Réaction' },
    { id: 'supports-accessoires', label: 'Supports & Accessoires' },
  ];

  const filteredItems = ALL_CATALOG_ITEMS.filter(item => {
    if (state.categoryFilter === 'all') return true;
    return item.categorie === state.categoryFilter;
  });

  return `
    <div class="catalog-container page-fade-in">
      <!-- En-tête et contrôles du catalogue -->
      <div class="catalog-header glass-card">
        <div>
          <h1 class="text-3xl font-extrabold flex items-center gap-3">
            <span>🔬</span> Catalogue du Matériel de Chimie
          </h1>
          <p class="text-slate-300 text-sm mt-1">
            Découvrez la verrerie et les accessoires de laboratoire. Cliquez sur un objet pour afficher sa fiche en plein écran (mode projection).
          </p>
        </div>

        <div class="catalog-actions-bar">
          <!-- Filtres par catégorie -->
          <div class="category-tabs">
            ${categories.map(cat => `
              <button class="cat-btn ${state.categoryFilter === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                ${cat.label}
              </button>
            `).join('')}
          </div>

          <!-- Modes interactifs -->
          <div class="mode-toggles">
            <button class="mode-btn ${state.isModeNommer ? 'active-mode' : ''}" id="btn-toggle-nommer">
              <span class="icon">🏷️</span> Mode "Nommer" ${state.isModeNommer ? '(Actif)' : ''}
            </button>
            <button class="mode-btn ${state.isModeComparer ? 'active-mode' : ''}" id="btn-toggle-comparer">
              <span class="icon">⚖️</span> Mode "Comparer" ${state.isModeComparer ? '(Actif)' : ''}
            </button>
          </div>
        </div>
      </div>

      <!-- Instruction du mode actif -->
      ${state.isModeNommer ? `
        <div class="mode-banner info-banner">
          <span>💡 <strong>Mode "Nommer" actif :</strong> Les noms du matériel sont masqués. Cliquez sur une carte pour révéler son nom à la classe !</span>
        </div>
      ` : ''}

      ${state.isModeComparer ? `
        <div class="mode-banner warning-banner">
          <span>⚖️ <strong>Mode "Comparer" actif :</strong> Sélectionnez 2 objets pour afficher leur comparaison côte-à-côte (ex: Verrerie de mesure vs Verrerie de contenance).</span>
        </div>
      ` : ''}

      <!-- Grille des équipements -->
      <div class="catalog-grid">
        ${filteredItems.map(item => {
          const isRevealed = state.revealedItemIds.has(item.id);
          const isSelectedForCompare = state.selectedCompareIds.includes(item.id);
          const displayName = (state.isModeNommer && !isRevealed) ? '❓ ??? (Cliquer pour révéler)' : item.nom;

          return `
            <div class="catalog-card ${isSelectedForCompare ? 'selected-compare' : ''}" data-id="${item.id}">
              <div class="card-svg-wrapper">
                ${renderEquipmentSVG(item.schema, { width: 140, height: 200 })}
              </div>
              <div class="card-body">
                <h3 class="card-title ${state.isModeNommer && !isRevealed ? 'hidden-name' : ''}">
                  ${displayName}
                </h3>
                <p class="card-role">${item.role}</p>
                <div class="card-footer">
                  <span class="badge badge-category">${item.categorie}</span>
                  <button class="btn-detail-link" data-id="${item.id}">
                    ${state.isModeComparer ? (isSelectedForCompare ? 'Désélectionner' : 'Comparer +') : 'Fiche Plein Écran ↗'}
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Vue comparaison si active -->
      ${state.isModeComparer && state.selectedCompareIds.length === 2 ? `
        <div class="compare-drawer glass-card">
          <div class="compare-header">
            <h2>⚖️ Comparaison directe côte-à-côte</h2>
            <button class="btn-close-compare" id="btn-close-compare">✕ Fermer</button>
          </div>
          <div class="compare-body">
            ${renderCompareBody(state.selectedCompareIds)}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderCompareBody(ids: string[]): string {
  const item1 = ALL_CATALOG_ITEMS.find(i => i.id === ids[0]);
  const item2 = ALL_CATALOG_ITEMS.find(i => i.id === ids[1]);

  if (!item1 || !item2) return '';

  return `
    <div class="compare-grid">
      <div class="compare-col">
        <h3>${item1.nom}</h3>
        <div class="svg-container">${renderEquipmentSVG(item1.schema, { width: 160, height: 240 })}</div>
        <div class="compare-detail">
          <p><strong>Catégorie:</strong> ${item1.categorie}</p>
          <p><strong>Précision:</strong> ${item1.precision}</p>
          <p><strong>Rôle principal:</strong> ${item1.role}</p>
        </div>
      </div>

      <div class="compare-vs">VS</div>

      <div class="compare-col">
        <h3>${item2.nom}</h3>
        <div class="svg-container">${renderEquipmentSVG(item2.schema, { width: 160, height: 240 })}</div>
        <div class="compare-detail">
          <p><strong>Catégorie:</strong> ${item2.categorie}</p>
          <p><strong>Précision:</strong> ${item2.precision}</p>
          <p><strong>Rôle principal:</strong> ${item2.role}</p>
        </div>
      </div>
    </div>

    <!-- Note pédagogique du professeur -->
    <div class="pedagogical-note">
      <h4>📌 Remarque pédagogique (Verrerie de mesure vs de contenance) :</h4>
      <p>
        Pour un prélèvement précis (ex: volume d'acide $V_a$), utiliser la verrerie de <strong>mesure</strong> (pipette jaugée ou burette graduée). 
        Ne jamais prélever avec un <strong>bécher</strong> ou un <strong>erlenmeyer</strong> qui ne sont que de la verrerie de contenance !
      </p>
    </div>
  `;
}
