import './index.css';

import { ModuleConfig, VerificationResult, GroupResult } from './types';
import dosageConfigData from './data/modules/dosage-fort-fort.json';
import dilutionConfigData from './data/modules/dilution.json';

import { calculateTitrationPoint, IndicatorType } from './models/dosageFortFort';
import { verifyResult } from './core/validator';

import { createCatalogViewHTML, CatalogState, ALL_CATALOG_ITEMS } from './components/catalog/CatalogView';
import { createObjectDetailModalHTML } from './components/catalog/ObjectDetailModal';
import { createSimulationViewHTML, createCanvasHostHTML, SimulationViewState } from './components/simulation/SimulationView';
import { createSolutionModalHTML } from './components/simulation/SolutionModal';
import { generateRandomParams, FormState } from './components/simulation/ParameterForm';
import { exportExerciseJSON } from './core/exporter';
import { animationEngine } from './components/simulation/AnimationEngine';
import { updateStepPanelVolume, syncPlayButton, switchModeTab } from './components/simulation/StepControlPanel';

// ─── Modules disponibles ──────────────────────────────────────────────────────

const MODULES: Record<string, ModuleConfig> = {
  'dosage-fort-fort': dosageConfigData as ModuleConfig,
  'dilution': dilutionConfigData as ModuleConfig,
};

type AppView = 'simulation' | 'catalog' | 'about';

// ─── Contrôleur principal ─────────────────────────────────────────────────────

class AppController {
  private currentView: AppView = 'simulation';
  private currentModuleId = 'dosage-fort-fort';
  private currentVarianteId = 'A';
  private isProjectorMode = false;

  // ── État simulation ─────────────────────────────────────────────
  private formState: FormState = {
    varianteId: 'A',
    params: { Ca: 0.10, Va: 20, Cb: 0.10, Ve: 20 },
    userAnswer: 20,
    tolerance: 0.02,
    indicator: 'btb',
  };

  private currentVb = 0;
  private isPlaying = false;
  private verificationResult: VerificationResult | null = null;
  private groups: GroupResult[] = [];
  private showSolution = false;

  /**
   * Quand true, le canvas SVG est déjà présent dans le DOM.
   * On ne le re-rend pas → zéro scintillement pendant l'animation.
   */
  private canvasMounted = false;

  // Mode du panneau de contrôle paso a paso
  private stepMode: 'step' | 'flow' | 'fast' = 'step';

  // ── État catalogue ──────────────────────────────────────────────
  private catalogState: CatalogState = {
    categoryFilter: 'all',
    isModeNommer: false,
    revealedItemIds: new Set<string>(),
    isModeComparer: false,
    selectedCompareIds: [],
    activeModalItemId: null,
  };

  constructor() {
    this.initPWA();
    this.bindGlobalEvents();
    this.bindAnimationEvents();
    this.render();
  }

  // ─── PWA ────────────────────────────────────────────────────────

  private initPWA(): void {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.warn('Service Worker non enregistré:', err);
        });
      });
    }
  }

  // ─── Écoute des événements du moteur d'animation ───────────────

  private bindAnimationEvents(): void {
    // Le moteur dispatche cet événement à chaque frame → on met à jour
    // seulement la barre de progression et le label Vb, PAS le HTML entier.
    document.addEventListener('titration:volumeChanged', (e: Event) => {
      const { currentVb, mode } = (e as CustomEvent).detail;
      this.currentVb = currentVb;
      this.isPlaying = mode !== 'idle';

      // Mise à jour DOM-direct (pas de re-render)
      updateStepPanelVolume(currentVb, this.formState.maxVb ?? 25);
      syncPlayButton(this.isPlaying);

      // La courbe pH ne nécessite pas de re-render en temps réel
      // (trop coûteux) — on la met à jour uniquement à la fin d'une action.
    });
  }

  // ─── Événements globaux (délégation) ───────────────────────────

  private bindGlobalEvents(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // ── Navigation ─────────────────────────────────────────────
      const navBtn = target.closest('[data-nav-view]') as HTMLElement;
      if (navBtn) {
        const view = navBtn.dataset.navView as AppView;
        if (view !== this.currentView) {
          if (this.currentView === 'simulation') {
            animationEngine.stop();
            this.canvasMounted = false;
          }
          this.currentView = view;
          this.render();
        }
        return;
      }

      // ── Mode projecteur ─────────────────────────────────────────
      if (target.closest('#btn-toggle-projector')) {
        this.isProjectorMode = !this.isProjectorMode;
        document.body.classList.toggle('projector-mode', this.isProjectorMode);
        return;
      }

      // ── Variante A / B ──────────────────────────────────────────
      const variantTab = target.closest('[data-variant]') as HTMLElement;
      if (variantTab) {
        this.currentVarianteId = variantTab.dataset.variant!;
        this.formState.varianteId = this.currentVarianteId;
        this.hardReset();
        return;
      }

      // ── Exercice au hasard ──────────────────────────────────────
      if (target.closest('#btn-random-params')) {
        const config = MODULES[this.currentModuleId];
        this.formState.params = generateRandomParams(config);
        const refVe = (this.formState.params.Ca * this.formState.params.Va) / this.formState.params.Cb;
        this.formState.userAnswer = Number(refVe.toFixed(1));
        this.hardReset();
        return;
      }

      // ── Ajouter un groupe ───────────────────────────────────────
      if (target.closest('#btn-add-group')) {
        if (this.groups.length < 6) {
          const colors = ['#34d399', '#f43f5e', '#a78bfa', '#fbbf24', '#38bdf8', '#fb923c'];
          const idx = this.groups.length + 1;
          this.groups.push({
            id: `g${idx}`,
            name: `Groupe ${idx}`,
            value: this.formState.userAnswer,
            color: colors[this.groups.length % colors.length],
          });
          this.render();
        }
        return;
      }

      // ── Supprimer un groupe ─────────────────────────────────────
      const btnRmGrp = target.closest('.btn-remove-group') as HTMLElement;
      if (btnRmGrp) {
        const idx = parseInt(btnRmGrp.dataset.index!, 10);
        this.groups.splice(idx, 1);
        this.render();
        return;
      }

      // ── Contrôles animation paso a paso ────────────────────────

      // Onglets de mode
      const modeTab = target.closest('[data-mode]') as HTMLElement;
      if (modeTab) {
        animationEngine.stop();
        this.isPlaying = false;
        this.stepMode = modeTab.dataset.mode as 'step' | 'flow' | 'fast';
        switchModeTab(this.stepMode);
        syncPlayButton(false);
        return;
      }

      // Pas à pas — +1 goutte (0.1 mL)
      if (target.closest('#btn-add-drop')) {
        animationEngine.addOneDrop();
        this.afterVolumeAction();
        return;
      }

      // Pas à pas — +0.5 mL
      if (target.closest('#btn-add-half')) {
        animationEngine.addVolume(0.5);
        this.afterVolumeAction();
        return;
      }

      // Pas à pas — +1.0 mL
      if (target.closest('#btn-add-one')) {
        animationEngine.addVolume(1.0);
        this.afterVolumeAction();
        return;
      }

      // Pas à pas — +5.0 mL
      if (target.closest('#btn-add-five')) {
        animationEngine.addVolume(5.0);
        this.afterVolumeAction();
        return;
      }

      // Pas à pas — retour −0.5 mL
      if (target.closest('#btn-undo-drop')) {
        const newVb = Math.max(0, this.currentVb - 0.5);
        animationEngine.reconfigure(this.buildEngineConfig(newVb));
        this.currentVb = newVb;
        updateStepPanelVolume(newVb, 25);
        this.refreshCurveOnly();
        return;
      }

      // Flux continu — Play/Pause
      if (target.closest('#btn-toggle-play')) {
        if (this.isPlaying) {
          animationEngine.stop();
          this.isPlaying = false;
          syncPlayButton(false);
          this.refreshCurveOnly();
        } else {
          animationEngine.startFlow();
          this.isPlaying = true;
          syncPlayButton(true);
        }
        return;
      }

      // Résultat direct — verser jusqu'à la cible
      if (target.closest('#btn-pour-to-answer')) {
        animationEngine.pourToTarget(this.formState.userAnswer);
        this.isPlaying = true;
        syncPlayButton(true);
        return;
      }

      // Reset / Vider
      if (target.closest('#btn-empty-burette') || target.closest('#btn-reset-sim')) {
        this.hardReset();
        return;
      }

      // Solution
      if (target.closest('#btn-show-solution-trigger')) {
        this.showSolution = true;
        this.render();
        return;
      }
      if (target.closest('#btn-close-solution') || target.closest('#btn-modal-close-solution')) {
        this.showSolution = false;
        this.renderModalsOnly();
        return;
      }

      // Export JSON
      if (target.closest('#btn-export-sim')) {
        exportExerciseJSON({
          module: this.currentModuleId,
          variante: this.currentVarianteId,
          params: this.formState.params,
          userAnswer: this.formState.userAnswer,
          groups: this.groups,
          verification: this.verificationResult,
        });
        return;
      }

      // Équipement → fiche catalogue
      const eqClick = target.closest('[data-equipment-id]') as HTMLElement;
      if (eqClick) {
        this.catalogState.activeModalItemId = eqClick.dataset.equipmentId!;
        this.renderModalsOnly();
        return;
      }

      // ── Catalogue ───────────────────────────────────────────────
      const catBtn = target.closest('[data-cat]') as HTMLElement;
      if (catBtn) {
        this.catalogState.categoryFilter = catBtn.dataset.cat!;
        this.render();
        return;
      }

      if (target.closest('#btn-toggle-nommer')) {
        this.catalogState.isModeNommer = !this.catalogState.isModeNommer;
        this.render();
        return;
      }
      if (target.closest('#btn-toggle-comparer')) {
        this.catalogState.isModeComparer = !this.catalogState.isModeComparer;
        if (!this.catalogState.isModeComparer) this.catalogState.selectedCompareIds = [];
        this.render();
        return;
      }

      const cardEl = target.closest('.catalog-card') as HTMLElement;
      if (cardEl && !target.closest('.btn-detail-link')) {
        const itemId = cardEl.dataset.id!;
        if (this.catalogState.isModeNommer) {
          this.catalogState.revealedItemIds.has(itemId)
            ? this.catalogState.revealedItemIds.delete(itemId)
            : this.catalogState.revealedItemIds.add(itemId);
          this.render();
          return;
        }
        if (this.catalogState.isModeComparer) {
          this.toggleCompareItem(itemId);
          return;
        }
        this.catalogState.activeModalItemId = itemId;
        this.renderModalsOnly();
        return;
      }

      const detailLink = target.closest('.btn-detail-link') as HTMLElement;
      if (detailLink) {
        const itemId = detailLink.dataset.id!;
        if (this.catalogState.isModeComparer) {
          this.toggleCompareItem(itemId);
        } else {
          this.catalogState.activeModalItemId = itemId;
          this.renderModalsOnly();
        }
        return;
      }

      if (target.closest('#btn-close-modal') || target.closest('#btn-modal-close')) {
        this.catalogState.activeModalItemId = null;
        this.renderModalsOnly();
        return;
      }
    });

    // ── Submit formulaire (lancement simulation) ──────────────────
    document.addEventListener('submit', (e) => {
      const target = e.target as HTMLFormElement;
      if (target.id !== 'simulation-params-form') return;
      e.preventDefault();

      const config = MODULES[this.currentModuleId];
      const variante = config.variantes.find(v => v.id === this.currentVarianteId)!;

      variante.donnees.forEach(key => {
        const input = target.querySelector(`[name="${key}"]`) as HTMLInputElement;
        if (input) this.formState.params[key] = parseFloat(input.value);
      });

      const ansInput = target.querySelector('#input-user-answer') as HTMLInputElement;
      if (ansInput) this.formState.userAnswer = parseFloat(ansInput.value);

      const tolInput = target.querySelector('#input-tolerance') as HTMLInputElement;
      if (tolInput) this.formState.tolerance = parseFloat(tolInput.value) / 100;

      const indSelect = target.querySelector('#select-indicator') as HTMLSelectElement;
      if (indSelect) this.formState.indicator = indSelect.value as IndicatorType;

      // Calcul de vérification théorique
      const refValue = variante.inconnue === 'Ve'
        ? (this.formState.params.Ca * this.formState.params.Va) / this.formState.params.Cb
        : (this.formState.params.Cb * this.formState.userAnswer) / this.formState.params.Va;

      this.verificationResult = verifyResult(
        this.formState.userAnswer,
        refValue,
        this.formState.tolerance
      );

      // Reset du moteur avec les nouveaux paramètres, puis verser jusqu'à la cible
      animationEngine.reconfigure(this.buildEngineConfig(0));
      this.currentVb = 0;

      // Ré-render complet pour afficher la bannière de résultat
      this.canvasMounted = false;
      this.render();

      // Lancer automatiquement le versement direct
      requestAnimationFrame(() => {
        animationEngine.pourToTarget(this.formState.userAnswer);
        this.isPlaying = true;
        syncPlayButton(true);
      });
    });

    // ── Slider vitesse flux ───────────────────────────────────────
    document.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'scp-flow-speed') {
        const speed = parseInt(target.value, 10);
        const labels = ['Lente', 'Normale', 'Rapide'];
        const displayEl = document.getElementById('scp-speed-display');
        if (displayEl) displayEl.textContent = labels[speed - 1];
        // Le slider modifie le débit dans le moteur
        // (pour l'instant, le débit est géré en constante — extensible)
      }
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────

  private get config() { return MODULES[this.currentModuleId]; }

  private buildEngineConfig(initialVb: number) {
    return {
      initialVb,
      maxVb: 25,
      initialVa: this.formState.params.Va ?? 20,
      Ca: this.formState.params.Ca,
      Va: this.formState.params.Va,
      Cb: this.formState.params.Cb,
      indicator: this.formState.indicator,
      buretteFluidColor: 'rgba(59, 130, 246, 0.85)',
    };
  }

  /** Appelé après une action de volume pas-à-pas (pour refresh la courbe) */
  private afterVolumeAction(): void {
    // Le volume est déjà mis à jour par le moteur via CustomEvent.
    // On rafraîchit seulement la courbe après un court délai (fin d'animation).
    setTimeout(() => {
      this.currentVb = animationEngine.state.currentVb;
      this.refreshCurveOnly();
    }, 500);
  }

  /** Rafraîchit seulement la colonne courbe (col-right) sans toucher au canvas */
  private refreshCurveOnly(): void {
    const curveCol = document.querySelector('.sim-col-right');
    if (!curveCol) return;

    const config    = this.config;
    const variante  = config.variantes.find(v => v.id === this.currentVarianteId)!;
    const targetVe  = variante.inconnue === 'Ve'
      ? this.formState.userAnswer
      : (this.formState.params.Ca * this.formState.params.Va) / this.formState.params.Cb;
    const points    = this.calculateAllCurvePoints(25);

    import('./components/simulation/CurvePlotter').then(({ createCurvePlotterSVG }) => {
      const curveEl = curveCol.querySelector('.curve-container');
      if (curveEl) {
        curveEl.innerHTML = createCurvePlotterSVG({
          points,
          currentVb: this.currentVb,
          maxVb: 25,
          targetVe,
          width: 340,
          height: 300,
        });
      }
    });
  }

  private toggleCompareItem(itemId: string): void {
    const idx = this.catalogState.selectedCompareIds.indexOf(itemId);
    if (idx >= 0) {
      this.catalogState.selectedCompareIds.splice(idx, 1);
    } else {
      if (this.catalogState.selectedCompareIds.length >= 2) {
        this.catalogState.selectedCompareIds.shift();
      }
      this.catalogState.selectedCompareIds.push(itemId);
    }
    this.render();
  }

  /** Reset complet : arrêt moteur, remise à zéro, re-render total */
  private hardReset(): void {
    animationEngine.stop();
    this.currentVb = 0;
    this.isPlaying = false;
    this.verificationResult = null;
    this.showSolution = false;
    this.canvasMounted = false;
    this.render();
  }

  private calculateAllCurvePoints(maxVb = 25): { Vb: number; pH: number }[] {
    const pts: { Vb: number; pH: number }[] = [];
    const { Ca, Va, Cb } = this.formState.params;
    for (let v = 0; v <= maxVb; v += 0.5) {
      const p = calculateTitrationPoint(Ca, Va, Cb, v, this.formState.indicator);
      pts.push({ Vb: v, pH: p.pH });
    }
    return pts;
  }

  // ─── Rendu ──────────────────────────────────────────────────────

  private render(): void {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    // ── Header ──────────────────────────────────────────────────
    const headerHTML = `
      <header class="app-header">
        <div class="brand-title">
          <span>🧪</span> Wamon Simu
          <span class="brand-version">v0.2</span>
        </div>

        <nav class="nav-tabs">
          <button class="nav-tab-btn ${this.currentView === 'simulation' ? 'active' : ''}" data-nav-view="simulation">
            ⚡ Simulations
          </button>
          <button class="nav-tab-btn ${this.currentView === 'catalog' ? 'active' : ''}" data-nav-view="catalog">
            🔬 Catalogue
          </button>
          <button class="nav-tab-btn ${this.currentView === 'about' ? 'active' : ''}" data-nav-view="about">
            📖 Guide Prof
          </button>
        </nav>

        <button class="btn-secondary text-xs flex items-center gap-1" id="btn-toggle-projector">
          <span>📺</span> ${this.isProjectorMode ? 'Mode Normal' : 'Rétroprojecteur'}
        </button>
      </header>
    `;

    // ── Contenu selon la vue ─────────────────────────────────────
    let contentHTML = '';

    if (this.currentView === 'simulation') {
      const config        = this.config;
      const currentVariante = config.variantes.find(v => v.id === this.currentVarianteId)!;
      const titrationState  = calculateTitrationPoint(
        this.formState.params.Ca, this.formState.params.Va,
        this.formState.params.Cb, this.currentVb,
        this.formState.indicator
      );

      const simViewState: SimulationViewState = {
        config,
        currentVariante,
        formState: this.formState,
        titrationState,
        curvePoints: this.calculateAllCurvePoints(25),
        currentVb: this.currentVb,
        maxVb: 25,
        isPlaying: this.isPlaying,
        flowSpeed: 1,
        verificationResult: this.verificationResult,
        groups: this.groups,
        showSolution: this.showSolution,
        canvasMounted: this.canvasMounted,
      };

      contentHTML = createSimulationViewHTML(simViewState);

      if (this.showSolution && this.verificationResult) {
        contentHTML += createSolutionModalHTML(
          this.verificationResult,
          this.currentVarianteId,
          this.formState.params
        );
      }
    } else if (this.currentView === 'catalog') {
      contentHTML = createCatalogViewHTML(this.catalogState);
    } else {
      contentHTML = this.renderAboutView();
    }

    // Modales d'équipement
    if (this.catalogState.activeModalItemId) {
      const item = ALL_CATALOG_ITEMS.find(i => i.id === this.catalogState.activeModalItemId);
      if (item) contentHTML += createObjectDetailModalHTML(item);
    }

    appEl.innerHTML = headerHTML + `<main>${contentHTML}</main>`;

    // ── Montage du canvas après le rendu initial ─────────────────
    if (this.currentView === 'simulation' && !this.canvasMounted) {
      this.mountCanvas();
    }
  }

  /**
   * Monte le canvas SVG dans son hôte et initialise le moteur.
   * Appelé UNE SEULE FOIS par session de simulation.
   */
  private mountCanvas(): void {
    const host = document.getElementById('titration-canvas-host');
    if (!host) return;

    const config        = this.config;
    const currentVariante = config.variantes.find(v => v.id === this.currentVarianteId)!;
    const titrationState  = calculateTitrationPoint(
      this.formState.params.Ca, this.formState.params.Va,
      this.formState.params.Cb, this.currentVb,
      this.formState.indicator
    );

    // Injecter le SVG
    const simState: SimulationViewState = {
      config, currentVariante,
      formState: this.formState,
      titrationState,
      curvePoints: [],
      currentVb: this.currentVb,
      maxVb: 25,
      isPlaying: false,
      flowSpeed: 1,
      verificationResult: null,
      groups: [],
      showSolution: false,
    };
    host.innerHTML = createCanvasHostHTML(simState);

    // Monter le moteur sur les éléments SVG
    animationEngine.mount(this.buildEngineConfig(this.currentVb));
    this.canvasMounted = true;
  }

  /** Rend seulement les modales superposées (sans re-rendre tout l'app) */
  private renderModalsOnly(): void {
    // Supprimer les anciennes modales
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());

    if (this.catalogState.activeModalItemId) {
      const item = ALL_CATALOG_ITEMS.find(i => i.id === this.catalogState.activeModalItemId);
      if (item) {
        const div = document.createElement('div');
        div.innerHTML = createObjectDetailModalHTML(item);
        document.body.appendChild(div.firstElementChild!);
      }
    }

    if (this.showSolution && this.verificationResult) {
      const div = document.createElement('div');
      div.innerHTML = createSolutionModalHTML(
        this.verificationResult,
        this.currentVarianteId,
        this.formState.params
      );
      document.body.appendChild(div.firstElementChild!);
    }
  }

  private renderAboutView(): string {
    return `
      <div class="catalog-container page-fade-in" style="max-width: 800px">
        <div class="glass-card">
          <h1 class="text-3xl font-bold text-emerald" style="margin-bottom:1rem">
            📖 Guide d'Utilisation en Classe
          </h1>
          <p style="margin-bottom:1rem; color: var(--text-muted)">
            Ce simulateur a été conçu pour les établissements scolaires fonctionnant
            sur ordinateur avec projecteur et sans connexion Internet requise.
          </p>

          <h3 class="text-xl font-bold text-cyan" style="margin-bottom:0.5rem">
            Scénario de cours type :
          </h3>
          <ol style="margin-left:1.25rem; display:flex; flex-direction:column; gap:0.6rem; color: var(--text-muted)">
            <li>Le professeur choisit la variante et saisit les données ou clique sur <strong>« Exercice au hasard »</strong>.</li>
            <li>Il projette l'écran. La classe réalise les calculs individuellement ou par groupe.</li>
            <li>Le professeur saisit le résultat proposé par la classe (ou jusqu'à 6 groupes).</li>
            <li>Au clic sur <strong>« Lancer »</strong>, le panneau paso-à-paso permet de verser <em>goutte à goutte</em> devant la classe.</li>
            <li>Le virage de l'indicateur se produit exactement au bon volume. L'écart est affiché en % si le résultat est incorrect.</li>
          </ol>

          <div class="mode-banner info-banner" style="margin-top:1.5rem">
            💡 <strong>Nouveau :</strong> Trois modes de versement disponibles : pas-à-pas (goutte à goutte), flux continu
            avec pause, ou versement direct au résultat calculé.
          </div>
        </div>
      </div>
    `;
  }
}

// ─── Démarrage ────────────────────────────────────────────────────────────────
new AppController();
