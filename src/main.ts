import './index.css';

import { ModuleConfig, VerificationResult, GroupResult } from './types';
import dosageConfigData from './data/modules/dosage-fort-fort.json';
import dilutionConfigData from './data/modules/dilution.json';

import { calculateTitrationPoint, IndicatorType } from './models/dosageFortFort';
import { verifyResult } from './core/validator';

import { createCatalogViewHTML, CatalogState, ALL_CATALOG_ITEMS } from './components/catalog/CatalogView';
import { createObjectDetailModalHTML } from './components/catalog/ObjectDetailModal';
import { createSimulationViewHTML, SimulationViewState } from './components/simulation/SimulationView';
import { createSolutionModalHTML } from './components/simulation/SolutionModal';
import { generateRandomParams, FormState } from './components/simulation/ParameterForm';
import { exportExerciseJSON } from './core/exporter';

// Multiples modules disponibles
const MODULES: Record<string, ModuleConfig> = {
  'dosage-fort-fort': dosageConfigData as ModuleConfig,
  'dilution': dilutionConfigData as ModuleConfig,
};

// État global de l'application
type AppView = 'simulation' | 'catalog' | 'about';

class AppController {
  private currentView: AppView = 'simulation';
  private currentModuleId = 'dosage-fort-fort';
  private currentVarianteId = 'A';
  private isProjectorMode = false;

  // État de la simulation
  private formState: FormState = {
    varianteId: 'A',
    params: { Ca: 0.10, Va: 20, Cb: 0.10, Ve: 20 },
    userAnswer: 20,
    tolerance: 0.02,
    indicator: 'btb',
  };

  private currentVb = 0;
  private isPlaying = false;
  private animTimer: any = null;
  private verificationResult: VerificationResult | null = null;
  private groups: GroupResult[] = [];
  private showSolution = false;

  // État du catalogue
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
    this.render();
  }

  private initPWA(): void {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('Enregistrement du Service Worker hors-ligne échoué:', err);
        });
      });
    }
  }

  private bindGlobalEvents(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Navigation globale
      const navBtn = target.closest('[data-nav-view]') as HTMLElement;
      if (navBtn) {
        const view = navBtn.dataset.navView as AppView;
        this.currentView = view;
        this.render();
        return;
      }

      // Mode projection
      if (target.closest('#btn-toggle-projector')) {
        this.isProjectorMode = !this.isProjectorMode;
        document.body.classList.toggle('projector-mode', this.isProjectorMode);
        this.render();
        return;
      }

      // Sélecteur de Variante A / B
      const variantTab = target.closest('[data-variant]') as HTMLElement;
      if (variantTab) {
        this.currentVarianteId = variantTab.dataset.variant!;
        this.formState.varianteId = this.currentVarianteId;
        this.resetSimulationState();
        this.render();
        return;
      }

      // Bouton "Exercice au hasard"
      if (target.closest('#btn-random-params')) {
        const config = MODULES[this.currentModuleId];
        this.formState.params = generateRandomParams(config);
        // Si Variante A, proposer la valeur exacte par défaut dans le champ
        const refVe = (this.formState.params.Ca * this.formState.params.Va) / this.formState.params.Cb;
        this.formState.userAnswer = Number(refVe.toFixed(1));
        this.resetSimulationState();
        this.render();
        return;
      }

      // Action "Ajouter un groupe"
      if (target.closest('#btn-add-group')) {
        if (this.groups.length < 6) {
          const colors = ['#38bdf8', '#f43f5e', '#10b981', '#a855f7', '#f59e0b', '#06b6d4'];
          const newIdx = this.groups.length + 1;
          this.groups.push({
            id: `g${newIdx}`,
            name: `Groupe ${newIdx}`,
            value: this.formState.userAnswer,
            color: colors[this.groups.length % colors.length],
          });
          this.render();
        }
        return;
      }

      // Action "Supprimer un groupe"
      const btnRemoveGrp = target.closest('.btn-remove-group') as HTMLElement;
      if (btnRemoveGrp) {
        const idx = parseInt(btnRemoveGrp.dataset.index!, 10);
        this.groups.splice(idx, 1);
        this.render();
        return;
      }

      // Contrôles de simulation (Play/Pause, Drop, Pour, Clear)
      if (target.closest('#btn-toggle-play')) {
        this.togglePlay();
        return;
      }
      if (target.closest('#btn-add-drop')) {
        this.addVolume(0.1);
        return;
      }
      if (target.closest('#btn-pour-to-answer')) {
        this.pourToAnswer();
        return;
      }
      if (target.closest('#btn-empty-burette')) {
        this.resetSimulationState();
        this.render();
        return;
      }
      if (target.closest('#btn-reset-sim')) {
        this.resetSimulationState();
        this.render();
        return;
      }

      // Solution popover
      if (target.closest('#btn-show-solution-trigger')) {
        this.showSolution = true;
        this.render();
        return;
      }
      if (target.closest('#btn-close-solution') || target.closest('#btn-modal-close-solution')) {
        this.showSolution = false;
        this.render();
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

      // Équipement cliquable depuis la simulation -> Ouvre fiche catalogue
      const equipmentClick = target.closest('[data-equipment-id]') as HTMLElement;
      if (equipmentClick) {
        const eqId = equipmentClick.dataset.equipmentId!;
        this.catalogState.activeModalItemId = eqId;
        this.render();
        return;
      }

      // Catalogue : Filtres de catégories
      const catBtn = target.closest('[data-cat]') as HTMLElement;
      if (catBtn) {
        this.catalogState.categoryFilter = catBtn.dataset.cat!;
        this.render();
        return;
      }

      // Catalogue : Toggles Mode Nommer / Mode Comparer
      if (target.closest('#btn-toggle-nommer')) {
        this.catalogState.isModeNommer = !this.catalogState.isModeNommer;
        this.render();
        return;
      }
      if (target.closest('#btn-toggle-comparer')) {
        this.catalogState.isModeComparer = !this.catalogState.isModeComparer;
        if (!this.catalogState.isModeComparer) {
          this.catalogState.selectedCompareIds = [];
        }
        this.render();
        return;
      }

      // Catalogue : Clic sur une carte pour révéler en mode Nommer ou Sélectionner pour Comparer
      const cardEl = target.closest('.catalog-card') as HTMLElement;
      if (cardEl && !target.closest('.btn-detail-link')) {
        const itemId = cardEl.dataset.id!;
        if (this.catalogState.isModeNommer) {
          if (this.catalogState.revealedItemIds.has(itemId)) {
            this.catalogState.revealedItemIds.delete(itemId);
          } else {
            this.catalogState.revealedItemIds.add(itemId);
          }
          this.render();
          return;
        }

        if (this.catalogState.isModeComparer) {
          this.toggleCompareItem(itemId);
          return;
        }

        // Sinon ouvrir la fiche
        this.catalogState.activeModalItemId = itemId;
        this.render();
        return;
      }

      // Catalogue : Bouton fiche détail
      const detailLink = target.closest('.btn-detail-link') as HTMLElement;
      if (detailLink) {
        const itemId = detailLink.dataset.id!;
        if (this.catalogState.isModeComparer) {
          this.toggleCompareItem(itemId);
        } else {
          this.catalogState.activeModalItemId = itemId;
        }
        this.render();
        return;
      }

      // Fermeture des modales
      if (target.closest('#btn-close-modal') || target.closest('#btn-modal-close')) {
        this.catalogState.activeModalItemId = null;
        this.render();
        return;
      }
    });

    // Form Submit Event (Lancement de la simulation avec vérification)
    document.addEventListener('submit', (e) => {
      const target = e.target as HTMLFormElement;
      if (target.id === 'simulation-params-form') {
        e.preventDefault();

        // Récupération des valeurs saisies
        const config = MODULES[this.currentModuleId];
        const variante = config.variantes.find(v => v.id === this.currentVarianteId)!;

        variante.donnees.forEach(key => {
          const input = target.querySelector(`[name="${key}"]`) as HTMLInputElement;
          if (input) {
            this.formState.params[key] = parseFloat(input.value);
          }
        });

        const ansInput = target.querySelector('#input-user-answer') as HTMLInputElement;
        if (ansInput) {
          this.formState.userAnswer = parseFloat(ansInput.value);
        }

        const tolInput = target.querySelector('#input-tolerance') as HTMLInputElement;
        if (tolInput) {
          this.formState.tolerance = parseFloat(tolInput.value) / 100.0;
        }

        const indSelect = target.querySelector('#select-indicator') as HTMLSelectElement;
        if (indSelect) {
          this.formState.indicator = indSelect.value as IndicatorType;
        }

        // Calcul de la vérification théorique
        let refValue = 0;
        if (variante.inconnue === 'Ve') {
          refValue = (this.formState.params.Ca * this.formState.params.Va) / this.formState.params.Cb;
        } else {
          refValue = (this.formState.params.Cb * this.formState.userAnswer) / this.formState.params.Va;
        }

        this.verificationResult = verifyResult(
          this.formState.userAnswer,
          refValue,
          this.formState.tolerance
        );

        // Réinitialiser le volume versé et animer
        this.currentVb = 0;
        this.pourToAnswer();
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

  private resetSimulationState(): void {
    this.stopPlay();
    this.currentVb = 0;
    this.verificationResult = null;
    this.showSolution = false;
  }

  private togglePlay(): void {
    if (this.isPlaying) {
      this.stopPlay();
    } else {
      this.startPlay();
    }
    this.render();
  }

  private startPlay(): void {
    this.isPlaying = true;
    if (this.animTimer) clearInterval(this.animTimer);

    const maxV = 40;
    this.animTimer = setInterval(() => {
      if (this.currentVb >= maxV) {
        this.stopPlay();
        this.render();
        return;
      }
      this.currentVb = Math.min(this.currentVb + 0.2, maxV);
      this.render();
    }, 100);
  }

  private stopPlay(): void {
    this.isPlaying = false;
    if (this.animTimer) {
      clearInterval(this.animTimer);
      this.animTimer = null;
    }
  }

  private addVolume(amount: number): void {
    this.currentVb = Math.min(this.currentVb + amount, 40);
    this.render();
  }

  private pourToAnswer(): void {
    this.stopPlay();
    const targetVal = this.formState.userAnswer;
    let count = 0;

    this.isPlaying = true;
    this.animTimer = setInterval(() => {
      count++;
      this.currentVb = Math.min((targetVal * count) / 25, targetVal);
      if (count >= 25) {
        this.stopPlay();
      }
      this.render();
    }, 40);
  }

  private calculateAllCurvePoints(maxVb: number = 40): { Vb: number; pH: number }[] {
    const points: { Vb: number; pH: number }[] = [];
    const { Ca, Va, Cb } = this.formState.params;

    for (let v = 0; v <= maxVb; v += 0.5) {
      const p = calculateTitrationPoint(Ca, Va, Cb, v, this.formState.indicator);
      points.push({ Vb: v, pH: p.pH });
    }
    return points;
  }

  private render(): void {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    // Rendu du Header Global
    const headerHTML = `
      <header class="app-header">
        <div class="brand-title">
          <span>🧪</span> Wamon Simu <span class="text-xs text-sky-400 font-mono">v0.1</span>
        </div>

        <nav class="nav-tabs">
          <button class="nav-tab-btn ${this.currentView === 'simulation' ? 'active' : ''}" data-nav-view="simulation">
            ⚡ Simulations
          </button>
          <button class="nav-tab-btn ${this.currentView === 'catalog' ? 'active' : ''}" data-nav-view="catalog">
            🔬 Catalogue du Matériel
          </button>
          <button class="nav-tab-btn ${this.currentView === 'about' ? 'active' : ''}" data-nav-view="about">
            📖 Guide Prof
          </button>
        </nav>

        <button class="btn-secondary text-xs flex items-center gap-1" id="btn-toggle-projector">
          <span>📺</span> ${this.isProjectorMode ? 'Mode Normal' : 'Mode Rétroprojecteur'}
        </button>
      </header>
    `;

    let contentHTML = '';

    if (this.currentView === 'simulation') {
      const config = MODULES[this.currentModuleId];
      const currentVariante = config.variantes.find(v => v.id === this.currentVarianteId)!;
      const titrationState = calculateTitrationPoint(
        this.formState.params.Ca,
        this.formState.params.Va,
        this.formState.params.Cb,
        this.currentVb,
        this.formState.indicator
      );

      const simViewState: SimulationViewState = {
        config,
        currentVariante,
        formState: this.formState,
        titrationState,
        curvePoints: this.calculateAllCurvePoints(40),
        currentVb: this.currentVb,
        maxVb: 40,
        isPlaying: this.isPlaying,
        flowSpeed: 1,
        verificationResult: this.verificationResult,
        groups: this.groups,
        showSolution: this.showSolution,
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
      contentHTML = `
        <div class="catalog-container page-fade-in max-w-3xl">
          <div class="glass-card p-6 space-y-4">
            <h1 class="text-3xl font-bold text-sky-400">📖 Guide d'Utilisation en Classe</h1>
            <p>
              Ce simulateur a été conçu pour les établissements scolaires fonctionnant sur ordinateur avec projecteur et sans connexion Internet requise.
            </p>
            <h3 class="text-xl font-semibold text-emerald-400">Scénario de cours type :</h3>
            <ol class="list-decimal ml-6 space-y-2 text-slate-200">
              <li>Le professeur choisit la variante de l'exercice et saisit les données ou clique sur <strong>"Exercice au hasard"</strong>.</li>
              <li>Il projette l'écran. La classe réalise les calculs individuellement ou par groupe.</li>
              <li>Le professeur saisit le résultat proposé par la classe ou les résultats de jusqu'à 6 groupes.</li>
              <li>Au clic sur <strong>"Lancer la simulation"</strong>, l'expérience se déroule sous leurs yeux.</li>
              <li>La simulation confirme si le calcul est juste (virage de l'indicateur pile au bon volume). Sinon, l'écart en % est analysé.</li>
            </ol>
          </div>
        </div>
      `;
    }

    // Affichage des modales d'équipement si actives
    if (this.catalogState.activeModalItemId) {
      const item = ALL_CATALOG_ITEMS.find(i => i.id === this.catalogState.activeModalItemId);
      if (item) {
        contentHTML += createObjectDetailModalHTML(item);
      }
    }

    appEl.innerHTML = headerHTML + `<main>${contentHTML}</main>`;
  }
}

// Démarrage de l'application
new AppController();
