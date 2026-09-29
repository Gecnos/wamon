/**
 * StepControlPanel — Panneau de contrôle paso-à-paso de l'animation de titrage.
 *
 * Ce composant génère du HTML STATIQUE (onglets, boutons, sliders).
 * Il est rendu UNE SEULE FOIS avec la simulation et ne se re-rend PAS lors
 * des mises à jour de volume/pH (ces données sont mises à jour directement
 * via AnimationEngine dans les éléments SVG du canvas).
 *
 * Seule exception : quand l'état play/pause change, on met à jour
 * l'apparence du bouton Play via un sélecteur direct.
 */

export function createStepControlPanelHTML(opts: {
  currentVb: number;
  maxVb: number;
  isPlaying: boolean;
  targetAnswer: number;
  answerUnit: string;
  flowSpeed: number;
}): string {
  const { currentVb, maxVb, isPlaying, targetAnswer, answerUnit } = opts;
  const progressPct = (currentVb / maxVb) * 100;

  return `
<div class="step-control-panel glass-card" id="step-control-panel">

  <!-- Titre + indicateurs live -->
  <div class="scp-header">
    <h2 class="text-base font-bold flex items-center gap-2">
      <span class="scp-title-icon">⚗️</span>
      Montage expérimental
    </h2>
    <div class="scp-live-badges">
      <div class="scp-live-badge">
        <span class="scp-badge-label">Vb versé</span>
        <span class="scp-badge-val scp-vb-display">${currentVb.toFixed(1)} mL</span>
      </div>
      <div class="scp-live-badge">
        <span class="scp-badge-label">Cible</span>
        <span class="scp-badge-val scp-target-val">${targetAnswer} ${answerUnit}</span>
      </div>
    </div>
  </div>

  <!-- Barre de progression de la burette -->
  <div class="scp-progress-wrap">
    <div class="scp-progress-track">
      <div class="scp-progress-fill" id="scp-progress-bar"
           style="width: ${progressPct.toFixed(2)}%"></div>
      <!-- Marqueur cible -->
      <div class="scp-progress-target-marker"
           style="left: ${Math.min((targetAnswer / maxVb) * 100, 100).toFixed(2)}%"
           title="Cible: ${targetAnswer} mL">
        <div class="scp-target-pin"></div>
      </div>
    </div>
    <div class="scp-progress-labels">
      <span>0 mL</span>
      <span>${maxVb} mL</span>
    </div>
  </div>

  <!-- Zone SVG canvas (injectée séparément, mais réservée ici) -->
  <div id="titration-canvas-host" class="scp-canvas-host">
    <!-- Le canvas SVG sera monté ici par SimulationController -->
  </div>

  <!-- ─── Onglets de mode ───────────────────────────────── -->
  <div class="scp-mode-tabs" role="tablist" aria-label="Mode de versement">

    <button class="scp-mode-tab active" id="scp-tab-step"
            data-mode="step" role="tab" title="Contrôle goutte à goutte">
      <span class="scp-tab-icon">💧</span>
      <span class="scp-tab-label">Pas à pas</span>
    </button>

    <button class="scp-mode-tab" id="scp-tab-flow"
            data-mode="flow" role="tab" title="Flux continu pilotable">
      <span class="scp-tab-icon">🌊</span>
      <span class="scp-tab-label">Flux continu</span>
    </button>

    <button class="scp-mode-tab" id="scp-tab-fast"
            data-mode="fast" role="tab" title="Verser directement au résultat">
      <span class="scp-tab-icon">⚡</span>
      <span class="scp-tab-label">Résultat direct</span>
    </button>

  </div>

  <!-- ─── Panneaux de contrôle ─────────────────────────── -->

  <!-- MODE PAS À PAS -->
  <div class="scp-panel scp-panel-step active-panel" id="scp-panel-step">

    <p class="scp-panel-hint">
      Chaque bouton ajoute exactement le volume indiqué. Idéal pour observer
      le virage de l'indicateur <strong>goutte à goutte</strong>.
    </p>

    <div class="scp-step-btns">

      <button class="scp-step-btn scp-drop-btn" id="btn-add-drop"
              title="Ajouter une goutte (0.1 mL)">
        <span class="scp-drop-icon">💧</span>
        <span class="scp-btn-main">+1 goutte</span>
        <span class="scp-btn-sub">0.1 mL</span>
      </button>

      <button class="scp-step-btn scp-small-btn" id="btn-add-half"
              title="Ajouter 0.5 mL">
        <span class="scp-drop-icon">💧💧</span>
        <span class="scp-btn-main">+0.5 mL</span>
        <span class="scp-btn-sub">5 gouttes</span>
      </button>

      <button class="scp-step-btn scp-medium-btn" id="btn-add-one"
              title="Ajouter 1 mL">
        <span class="scp-drop-icon">⬇️</span>
        <span class="scp-btn-main">+1.0 mL</span>
        <span class="scp-btn-sub">10 gouttes</span>
      </button>

      <button class="scp-step-btn scp-five-btn" id="btn-add-five"
              title="Ajouter 5 mL">
        <span class="scp-drop-icon">🫙</span>
        <span class="scp-btn-main">+5.0 mL</span>
        <span class="scp-btn-sub">flux rapide</span>
      </button>

    </div>

    <!-- Bouton Retour en arrière (−0.5 mL) -->
    <div class="scp-undo-row">
      <button class="scp-undo-btn" id="btn-undo-drop"
              title="Revenir en arrière de 0.5 mL">
        ↩ −0.5 mL
      </button>
      <span class="scp-hint-text">Correction possible avant vérification</span>
    </div>
  </div>

  <!-- MODE FLUX CONTINU -->
  <div class="scp-panel scp-panel-flow" id="scp-panel-flow">

    <p class="scp-panel-hint">
      Le robinet est ouvert : la base coule en continu.
      Appuyez sur <strong>Pause</strong> dès que vous voyez le virage de couleur.
    </p>

    <div class="scp-flow-controls">
      <button class="scp-big-play-btn ${isPlaying ? 'playing' : ''}"
              id="btn-toggle-play">
        <span class="play-icon">${isPlaying ? '⏸' : '▶'}</span>
        <span class="play-label">${isPlaying ? 'Pause' : 'Ouvrir le robinet'}</span>
      </button>
    </div>

    <!-- Vitesse d'écoulement -->
    <div class="scp-speed-row">
      <label class="scp-speed-label" for="scp-flow-speed">
        🐢 Vitesse : <strong id="scp-speed-display">Normale</strong>
      </label>
      <input type="range" id="scp-flow-speed"
             min="1" max="3" step="1" value="1"
             class="scp-speed-slider"/>
      <div class="scp-speed-steps">
        <span>Lente</span><span>Normale</span><span>Rapide</span>
      </div>
    </div>

  </div>

  <!-- MODE RÉSULTAT DIRECT -->
  <div class="scp-panel scp-panel-fast" id="scp-panel-fast">

    <p class="scp-panel-hint">
      La simulation verse automatiquement jusqu'au volume exact que
      la classe a calculé (<strong>${targetAnswer} ${answerUnit}</strong>).
      Le virage de l'indicateur se produit au bon moment.
    </p>

    <button class="scp-fast-launch-btn" id="btn-pour-to-answer">
      <span>⚡</span>
      Verser jusqu'à <strong>${targetAnswer} ${answerUnit}</strong>
    </button>

    <div class="scp-fast-note">
      ⚠️ Utiliser ce mode <em>après</em> avoir montré la démarche pas à pas.
    </div>

  </div>

  <!-- ─── Barre d'action commune ────────────────────────── -->
  <div class="scp-footer-actions">
    <button class="scp-reset-btn" id="btn-empty-burette"
            title="Vider la burette et remettre à zéro">
      🗑️ Vider &amp; Réinitialiser
    </button>
    <div class="scp-equipment-hint">
      💡 Cliquer sur un instrument pour ouvrir sa fiche
    </div>
  </div>

</div>
  `;
}

/**
 * Met à jour l'affichage du volume Vb et la barre de progression
 * SANS re-rendre le composant entier.
 */
export function updateStepPanelVolume(currentVb: number, maxVb: number): void {
  const progressBar = document.getElementById('scp-progress-bar');
  const vbDisplays  = document.querySelectorAll('.scp-vb-display');

  if (progressBar) {
    progressBar.style.width = `${Math.min((currentVb / maxVb) * 100, 100).toFixed(2)}%`;
  }
  vbDisplays.forEach(el => {
    el.textContent = `${currentVb.toFixed(1)} mL`;
  });
}

/**
 * Met à jour l'apparence du bouton Play/Pause sans re-render.
 */
export function syncPlayButton(isPlaying: boolean): void {
  const btn = document.getElementById('btn-toggle-play');
  if (!btn) return;
  const icon  = btn.querySelector('.play-icon');
  const label = btn.querySelector('.play-label');
  if (icon)  icon.textContent  = isPlaying ? '⏸' : '▶';
  if (label) label.textContent = isPlaying ? 'Pause' : 'Ouvrir le robinet';
  btn.classList.toggle('playing', isPlaying);
}

/**
 * Active le bon onglet de mode (step / flow / fast).
 */
export function switchModeTab(mode: 'step' | 'flow' | 'fast'): void {
  document.querySelectorAll('.scp-mode-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.scp-panel').forEach(el => el.classList.remove('active-panel'));

  const tab   = document.getElementById(`scp-tab-${mode}`);
  const panel = document.getElementById(`scp-panel-${mode}`);
  if (tab)   tab.classList.add('active');
  if (panel) panel.classList.add('active-panel');
}
