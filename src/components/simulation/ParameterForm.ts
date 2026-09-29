import { ModuleConfig, VarianteConfig } from '../../types';

export interface FormState {
  varianteId: string;
  params: Record<string, number>;
  userAnswer: number;
  tolerance: number;
  indicator: 'btb' | 'phenolphthalein' | 'helianthine';
}

/**
 * Génère un ensemble de paramètres cohérents au hasard pour l'exercice.
 */
export function generateRandomParams(config: ModuleConfig): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [key, g] of Object.entries(config.grandeurs)) {
    const min = g.min ?? 0.01;
    const max = g.max ?? 1.0;
    const step = g.step ?? 0.01;

    // Génération aléatoire arrondie au pas
    const stepsCount = Math.floor((max - min) / step);
    const randomSteps = Math.floor(Math.random() * (stepsCount + 1));
    const val = min + randomSteps * step;

    // Arrondi pour éviter les imprécisions binaires
    result[key] = Number(val.toFixed(key.startsWith('C') ? 2 : 1));
  }

  return result;
}

export function createParameterFormHTML(
  config: ModuleConfig,
  currentVariante: VarianteConfig,
  state: FormState
): string {
  return `
    <div class="parameter-form-card glass-card">
      <div class="form-header">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <span>⚙️</span> Énoncé & Données de l'exercice
          </h2>
          <button type="button" class="btn-random-exercise" id="btn-random-params" title="Tirer de nouvelles valeurs aléatoires">
            🎲 Exercice au hasard
          </button>
        </div>

        <!-- Sélecteur de Variante A ou B -->
        <div class="variant-selector-tabs mt-3">
          ${config.variantes.map(v => `
            <button type="button" class="variant-tab ${v.id === currentVariante.id ? 'active' : ''}" data-variant="${v.id}">
              ${v.nom}
            </button>
          `).join('')}
        </div>
        <p class="text-xs text-slate-300 mt-2 font-mono bg-slate-800/60 p-2 rounded border border-slate-700">
          💡 ${currentVariante.description}
        </p>
      </div>

      <form id="simulation-params-form" class="form-body mt-4">
        <!-- Champs des données de l'énoncé (connues) -->
        <div class="form-grid">
          ${currentVariante.donnees.map(key => {
            const g = config.grandeurs[key];
            const val = state.params[key] ?? g.default ?? 0;
            return `
              <div class="form-group">
                <label for="input-${key}" class="form-label">
                  ${g.label} (${key}) :
                </label>
                <div class="input-with-unit">
                  <input 
                    type="number" 
                    id="input-${key}" 
                    name="${key}" 
                    value="${val}" 
                    min="${g.min ?? 0}" 
                    max="${g.max ?? 100}" 
                    step="${g.step ?? 0.01}" 
                    class="form-input"
                    required
                  />
                  <span class="unit-badge">${g.unite}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Sélecteur d'Indicateur Coloré (au choix du prof) -->
        <div class="form-group mt-3">
          <label for="select-indicator" class="form-label">
            🎨 Indicateur coloré :
          </label>
          <select id="select-indicator" class="form-select">
            <option value="btb" ${state.indicator === 'btb' ? 'selected' : ''}>Bleu de bromothymol (BTB : 6,0 – 7,6)</option>
            <option value="phenolphthalein" ${state.indicator === 'phenolphthalein' ? 'selected' : ''}>Phénolphtaléine (8,2 – 10,0)</option>
            <option value="helianthine" ${state.indicator === 'helianthine' ? 'selected' : ''}>Hélianthine / Méthyl orange (3,1 – 4,4)</option>
          </select>
        </div>

        <hr class="border-slate-700 my-4" />

        <!-- Champ Saisie du Résultat de la Classe -->
        <div class="class-result-box">
          <label for="input-user-answer" class="class-result-label">
            🎯 Résultat trouvé par la classe (${currentVariante.inconnue}) :
          </label>
          <div class="input-with-unit input-large">
            <input 
              type="number" 
              id="input-user-answer" 
              value="${state.userAnswer}" 
              step="0.1" 
              class="form-input input-highlight"
              placeholder="Ex: 20.0"
              required
            />
            <span class="unit-badge font-bold">${config.grandeurs[currentVariante.inconnue]?.unite || ''}</span>
          </div>
        </div>

        <!-- Tolérance réglable -->
        <div class="form-group mt-3 flex items-center justify-between text-xs text-slate-300">
          <label for="input-tolerance">Tolérance d'acceptation :</label>
          <div class="flex items-center gap-1">
            <input 
              type="number" 
              id="input-tolerance" 
              value="${state.tolerance * 100}" 
              min="0.5" 
              max="10" 
              step="0.5" 
              class="w-16 p-1 rounded bg-slate-900 border border-slate-700 text-center"
            /> %
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="form-actions mt-5">
          <button type="submit" class="btn-launch-sim" id="btn-submit-simulation">
            🚀 Lancer la simulation avec ce résultat
          </button>
        </div>
      </form>
    </div>
  `;
}
