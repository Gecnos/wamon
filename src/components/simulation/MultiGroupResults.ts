import { GroupResult } from '../../types';

export const GROUP_COLORS = [
  '#38bdf8', // Groupe 1 (Bleu céleste)
  '#f43f5e', // Groupe 2 (Rose rouge)
  '#10b981', // Groupe 3 (Vert émeraude)
  '#a855f7', // Groupe 4 (Violet)
  '#f59e0b', // Groupe 5 (Ambre)
  '#06b6d4', // Groupe 6 (Cyan)
];

export function createMultiGroupHTML(groups: GroupResult[], targetUnit: string): string {
  return `
    <div class="multi-group-card glass-card">
      <div class="group-header">
        <h3 class="text-lg font-bold flex items-center justify-between">
          <span>👥 Comparaison Multi-Groupes (max 6)</span>
          <button type="button" class="btn-add-group" id="btn-add-group" ${groups.length >= 6 ? 'disabled' : ''}>
            + Ajouter un Groupe
          </button>
        </h3>
        <p class="text-xs text-slate-300 mt-1">
          Saisissez les résultats trouvés par différentes tables/groupes d'élèves pour les afficher superposés sur la simulation.
        </p>
      </div>

      <div class="groups-list mt-3">
        ${groups.map((g, index) => `
          <div class="group-item flex items-center gap-2 mb-2 p-2 rounded bg-slate-900/60 border border-slate-700">
            <span class="group-color-dot" style="background-color: ${g.color}"></span>
            <input 
              type="text" 
              class="group-name-input" 
              data-index="${index}" 
              value="${g.name}" 
              placeholder="Nom du groupe"
            />
            <div class="input-with-unit flex-1">
              <input 
                type="number" 
                class="group-val-input form-input text-right" 
                data-index="${index}" 
                value="${g.value}" 
                step="0.1" 
              />
              <span class="unit-badge text-xs">${targetUnit}</span>
            </div>
            ${groups.length > 1 ? `
              <button type="button" class="btn-remove-group text-red-400 hover:text-red-300" data-index="${index}" title="Supprimer">
                ✕
              </button>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
