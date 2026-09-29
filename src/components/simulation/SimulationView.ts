import { ModuleConfig, VarianteConfig, VerificationResult, GroupResult } from '../../types';
import { TitrationState } from '../../models/dosageFortFort';
import { createBuretteSVG, createBecherSVG } from '../svg';
import { createCurvePlotterSVG } from './CurvePlotter';
import { createParameterFormHTML, FormState } from './ParameterForm';
import { createMultiGroupHTML } from './MultiGroupResults';

export interface SimulationViewState {
  config: ModuleConfig;
  currentVariante: VarianteConfig;
  formState: FormState;
  titrationState: TitrationState;
  curvePoints: { Vb: number; pH: number }[];
  currentVb: number;
  maxVb: number;
  isPlaying: boolean;
  flowSpeed: number; // mL per second
  verificationResult: VerificationResult | null;
  groups: GroupResult[];
  showSolution: boolean;
}

export function createSimulationViewHTML(state: SimulationViewState): string {
  const { config, currentVariante, formState, titrationState, currentVb, maxVb, isPlaying, verificationResult, groups } = state;

  const targetVe = currentVariante.inconnue === 'Ve'
    ? formState.userAnswer
    : (formState.params.Ca * formState.params.Va) / formState.params.Cb;

  return `
    <div class="simulation-workspace page-fade-in">
      <!-- Barre d'actions supérieure : Titre & Navigation rapide -->
      <div class="sim-header glass-card flex items-center justify-between">
        <div>
          <span class="badge badge-primary">${config.matiere.toUpperCase()} — ${config.niveau.join(', ')}</span>
          <h1 class="text-2xl font-bold mt-1">${config.titre}</h1>
        </div>

        <div class="sim-top-actions flex items-center gap-3">
          <button class="btn-secondary" id="btn-reset-sim" title="Réinitialiser l'exercice">
            🔄 Nouvel exercice (Reset)
          </button>
          <button class="btn-secondary" id="btn-export-sim" title="Exporter l'exercice en JSON / Image">
            📥 Exporter
          </button>
          <button class="btn-primary" id="btn-show-solution-trigger" ${!verificationResult ? 'disabled' : ''}>
            💡 Afficher la Solution
          </button>
        </div>
      </div>

      <!-- Banner de résultat de vérification (F7) -->
      ${verificationResult ? `
        <div class="verification-banner ${verificationResult.isCoherent ? 'coherent-banner' : 'incoherent-banner'}">
          <div class="banner-icon">${verificationResult.isCoherent ? '✅' : '❌'}</div>
          <div class="banner-content">
            <h3 class="banner-title">
              Résultat ${verificationResult.isCoherent ? 'COHÉRENT' : 'INCOHÉRENT'}
            </h3>
            <p class="banner-details">${verificationResult.details}</p>
          </div>
          <div class="banner-stats">
            <div class="stat-item">
              <span class="stat-label">Écart :</span>
              <span class="stat-val">${verificationResult.diffValue > 0 ? '+' : ''}${verificationResult.diffValue.toFixed(2)} mL</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Erreur :</span>
              <span class="stat-val">${verificationResult.diffPercent.toFixed(1)} %</span>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Grille principale de simulation -->
      <div class="sim-main-grid mt-4">
        <!-- Colonne 1: Formulaire des paramètres de l'enseignant -->
        <div class="sim-col-left space-y-4">
          ${createParameterFormHTML(config, currentVariante, formState)}
          ${createMultiGroupHTML(groups, config.grandeurs[currentVariante.inconnue]?.unite || '')}
        </div>

        <!-- Colonne 2: Zone de projection de l'expérience physique (Burette + Bécher) -->
        <div class="sim-col-center glass-card">
          <h2 class="text-lg font-bold mb-2 flex items-center justify-between">
            <span>⚗️ Montage Expérimental</span>
            <span class="text-xs font-normal text-slate-300">Cliquer sur un élément pour ouvrir sa fiche</span>
          </h2>

          <div class="titration-stage">
            <!-- Burette SVG animée avec écoulement -->
            <div class="stage-element clickable-equipment" data-equipment-id="burette" title="Burette graduée (Base Cb)">
              ${createBuretteSVG({
                levelVolume: currentVb,
                maxVolume: maxVb,
                isFlowing: isPlaying,
                fluidColor: 'rgba(59, 130, 246, 0.5)',
                width: 140,
                height: 350,
              })}
            </div>

            <!-- Goutte d'écoulement et Bécher SVG -->
            <div class="stage-element clickable-equipment" data-equipment-id="becher" title="Burette & Bécher (Acide Ca + Indicateur)">
              ${createBecherSVG({
                liquidVolume: formState.params.Va + currentVb,
                maxVolume: 120,
                liquidColor: titrationState.color,
                colorLabel: titrationState.colorLabel,
                currentPH: titrationState.pH,
                width: 190,
                height: 210,
              })}
            </div>
          </div>

          <!-- Panneau de Contrôle de l'Animation (Burette drip / pour controls) -->
          <div class="animation-controls-bar mt-4">
            <div class="flex items-center justify-between mb-2 text-xs font-semibold">
              <span>Volume versé (Vb) : <strong class="text-sky-400 text-sm">${currentVb.toFixed(1)} mL</strong> / ${maxVb} mL</span>
              <span>pH courant : <strong class="text-emerald-400 text-sm">${titrationState.pH.toFixed(2)}</strong></span>
            </div>

            <div class="flex items-center gap-2">
              <button class="btn-control ${isPlaying ? 'btn-pause' : 'btn-play'}" id="btn-toggle-play">
                ${isPlaying ? '⏸ Pause' : '▶ Verser'}
              </button>
              <button class="btn-control" id="btn-add-drop" title="Ajouter 0,1 mL">
                💧 +0,1 mL
              </button>

              <button class="btn-control" id="btn-pour-to-answer" title="Verser rapidement jusqu'au volume théorique">
                ⏩ Verser jusqu'au résultat (${formState.userAnswer} mL)
              </button>

              <button class="btn-control btn-danger" id="btn-empty-burette">
                🧹 Vider
              </button>
            </div>
          </div>
        </div>

        <!-- Colonne 3: Courbe en temps réel pH = f(Vb) -->
        <div class="sim-col-right glass-card">
          <h2 class="text-lg font-bold mb-2 flex items-center justify-between">
            <span>📊 Courbe de Titrage pH = f(Vb)</span>
          </h2>

          <div class="curve-container flex justify-center">
            ${createCurvePlotterSVG({
              points: state.curvePoints,
              currentVb,
              maxVb,
              targetVe,
              width: 360,
              height: 310,
            })}
          </div>

          <!-- Superposition des résultats Multi-groupes sur le graphique -->
          ${groups.length > 0 ? `
            <div class="groups-overlay-legend mt-3 p-2 bg-slate-900/80 rounded border border-slate-700">
              <h4 class="text-xs font-bold text-slate-300 mb-1">Superposition des résultats des groupes :</h4>
              <div class="flex flex-wrap gap-2 text-xs">
                ${groups.map(g => `
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    <span class="w-2 h-2 rounded-full" style="background-color: ${g.color}"></span>
                    ${g.name}: <strong>${g.value}</strong>
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
