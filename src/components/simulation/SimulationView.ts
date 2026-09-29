import { ModuleConfig, VarianteConfig, VerificationResult, GroupResult } from '../../types';
import { TitrationState } from '../../models/dosageFortFort';
import { createCurvePlotterSVG } from './CurvePlotter';
import { createParameterFormHTML, FormState } from './ParameterForm';
import { createMultiGroupHTML } from './MultiGroupResults';
import { createStepControlPanelHTML } from './StepControlPanel';
import { createTitrationCanvasSVG } from './TitrationCanvas';

export interface SimulationViewState {
  config: ModuleConfig;
  currentVariante: VarianteConfig;
  formState: FormState;
  titrationState: TitrationState;
  curvePoints: { Vb: number; pH: number }[];
  currentVb: number;
  maxVb: number;
  isPlaying: boolean;
  flowSpeed: number;
  verificationResult: VerificationResult | null;
  groups: GroupResult[];
  showSolution: boolean;
  /** Si vrai, le canvas SVG est déjà monté dans le DOM (pas de re-render) */
  canvasMounted?: boolean;
}

export function createSimulationViewHTML(state: SimulationViewState): string {
  const {
    config, currentVariante, formState,
    currentVb, maxVb, isPlaying,
    verificationResult, groups, curvePoints,
  } = state;

  const targetVe = currentVariante.inconnue === 'Ve'
    ? formState.userAnswer
    : (formState.params.Ca * formState.params.Va) / formState.params.Cb;

  const answerUnit = config.grandeurs[currentVariante.inconnue]?.unite || 'mL';

  return `
    <div class="simulation-workspace page-fade-in">

      <!-- ── En-tête de la simulation ── -->
      <div class="sim-header glass-card flex items-center justify-between">
        <div>
          <span class="badge badge-primary">${config.matiere.toUpperCase()} — ${config.niveau.join(', ')}</span>
          <h1 class="text-2xl font-bold mt-1">${config.titre}</h1>
        </div>
        <div class="sim-top-actions flex items-center gap-3">
          <button class="btn-secondary" id="btn-reset-sim">🔄 Reset</button>
          <button class="btn-secondary" id="btn-export-sim">📥 Exporter</button>
          <button class="btn-primary" id="btn-show-solution-trigger"
                  ${!verificationResult ? 'disabled' : ''}>
            💡 Solution
          </button>
        </div>
      </div>

      <!-- ── Bannière de vérification ── -->
      ${verificationResult ? `
        <div class="verification-banner ${verificationResult.isCoherent ? 'coherent-banner' : 'incoherent-banner'}">
          <div class="banner-icon">${verificationResult.isCoherent ? '✅' : '❌'}</div>
          <div class="banner-content">
            <h3 class="banner-title">
              Résultat ${verificationResult.isCoherent ? 'COHÉRENT ✓' : 'INCOHÉRENT ✗'}
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

      <!-- ── Grille principale ── -->
      <div class="sim-main-grid mt-4">

        <!-- Col 1 : Formulaire paramètres -->
        <div class="sim-col-left space-y-4">
          ${createParameterFormHTML(config, currentVariante, formState)}
          ${createMultiGroupHTML(groups, answerUnit)}
        </div>

        <!-- Col 2 : Canvas expérimental + contrôles paso a paso -->
        <div class="sim-col-center">

          ${createStepControlPanelHTML({
            currentVb,
            maxVb,
            isPlaying,
            targetAnswer: formState.userAnswer,
            answerUnit,
            flowSpeed: 1,
          })}

        </div>

        <!-- Col 3 : Courbe pH = f(Vb) -->
        <div class="sim-col-right glass-card">
          <h2 class="text-base font-bold mb-3 flex items-center gap-2">
            <span>📊</span> Courbe pH = f(V<sub>b</sub>)
          </h2>

          <div class="curve-container flex justify-center">
            ${createCurvePlotterSVG({
              points: curvePoints,
              currentVb,
              maxVb,
              targetVe,
              width: 340,
              height: 300,
            })}
          </div>

          ${groups.length > 0 ? `
            <div class="groups-overlay-legend mt-3">
              <h4 class="text-xs font-bold text-muted mb-1">Résultats des groupes :</h4>
              <div class="flex flex-wrap gap-2 text-xs">
                ${groups.map(g => `
                  <span class="group-legend-item">
                    <span class="group-dot" style="background:${g.color}"></span>
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

/**
 * Génère le HTML du canvas SVG à injecter dans #titration-canvas-host.
 * Appelé UNE SEULE FOIS lors du montage, ou lors d'un reset complet.
 */
export function createCanvasHostHTML(state: SimulationViewState): string {
  return createTitrationCanvasSVG({
    initialVb:         state.currentVb,
    maxVb:             state.maxVb,
    initialVa:         state.formState.params.Va ?? 20,
    initialColor:      state.titrationState.color,
    width:             340,
    height:            520,
    buretteFluidColor: 'rgba(59, 130, 246, 0.80)',
  });
}
