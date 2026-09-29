/**
 * AnimationEngine — Moteur d'animation DOM-direct pour le titrage.
 *
 * Architecture clé :
 * - Manipule UNIQUEMENT les attributs SVG via getElementById/setAttribute.
 * - N'appelle JAMAIS innerHTML → zéro scintillement.
 * - requestAnimationFrame pour les gouttes (60 fps).
 * - Dispatche des CustomEvents pour notifier l'AppController
 *   sans couplage direct.
 *
 * Modes disponibles :
 *   'drop'   — goutte à goutte (0.1 mL / goutte)
 *   'flow'   — flux continu lent (0.3 mL/s)
 *   'fast'   — flux rapide jusqu'à une cible (verser jusqu'au résultat)
 *   'idle'   — arrêté
 */

import { CANVAS_GEOMETRY } from './TitrationCanvas';
import { calculateTitrationPoint, IndicatorType } from '../../models/dosageFortFort';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnimMode = 'idle' | 'drop' | 'flow' | 'fast';

export interface AnimEngineConfig {
  /** Volume initial dans la burette (mL) */
  initialVb: number;
  /** Volume max de la burette (mL) */
  maxVb: number;
  /** Volume initial dans le bécher — acide Va (mL) */
  initialVa: number;
  /** Concentration acide */
  Ca: number;
  /** Volume acide */
  Va: number;
  /** Concentration base */
  Cb: number;
  /** Indicateur coloré sélectionné */
  indicator: IndicatorType;
  /** Couleur du réactif dans la burette */
  buretteFluidColor: string;
}

export interface AnimEngineState {
  currentVb: number;
  mode: AnimMode;
}

// ─── Particule goutte ─────────────────────────────────────────────────────────

interface Drop {
  el: SVGCircleElement;    // élément SVG
  x: number;               // position X dans le viewBox
  y: number;               // position Y courante dans le viewBox
  vy: number;              // vitesse verticale (px / frame viewBox)
  targetY: number;         // Y d'arrivée (surface bécher)
  r: number;               // rayon
  alive: boolean;
}

// ─── Constantes physiques ─────────────────────────────────────────────────────

const GRAVITY          = 0.55;   // accélération par frame (viewBox px)
const DROP_RADIUS      = 4.0;    // rayon de la goutte (viewBox px)
const DROP_START_VY    = 1.2;    // vitesse initiale verticale
const ML_PER_DROP      = 0.1;    // mL ajoutés par goutte
const FLOW_ML_PER_SEC  = 0.40;   // mL/s en mode flux continu
const FAST_ML_PER_SEC  = 4.0;    // mL/s en mode flux rapide

// ─── AnimationEngine ──────────────────────────────────────────────────────────

export class AnimationEngine {
  private config!: AnimEngineConfig;

  // État physique
  private currentVb = 0;
  private mode: AnimMode = 'idle';
  private fastTarget = 0;

  // Boucle animation
  private rafId: number | null = null;
  private lastTs: number | null = null;
  private dropAccum = 0;   // accumulateur mL pour spawner les gouttes

  // Particules
  private drops: Drop[] = [];

  // Conteneur SVG des gouttes
  private dropsContainer: SVGGElement | null = null;
  private streamLine: SVGLineElement | null = null;
  private valveBody: SVGRectElement | null = null;

  // ─── Initialisation ──────────────────────────────────────────────

  constructor() {}

  /**
   * Monte le moteur sur les éléments SVG déjà présents dans le DOM.
   * À appeler après que createTitrationCanvasSVG() a été injecté dans la page.
   */
  mount(config: AnimEngineConfig): void {
    this.config = config;
    this.currentVb = config.initialVb;
    this.mode = 'idle';

    this.dropsContainer = document.getElementById('tc-drops-container') as unknown as SVGGElement;
    this.streamLine     = document.getElementById('tc-stream-line')     as unknown as SVGLineElement;
    this.valveBody      = document.getElementById('tc-valve-body')      as unknown as SVGRectElement;

    // Rendu initial sans animation
    this._updateBuretteSVG();
    this._updateBecherSVG();
    this._syncPhLabel();
    this._updateVbLabel();
    this._syncValveColor();
  }

  /** Recharge la configuration (nouveaux paramètres) sans démonter */
  reconfigure(config: AnimEngineConfig): void {
    this.stop();
    this.config = config;
    this.currentVb = config.initialVb;
    this.drops = [];
    if (this.dropsContainer) this.dropsContainer.innerHTML = '';
    this._updateBuretteSVG();
    this._updateBecherSVG();
    this._syncPhLabel();
    this._updateVbLabel();
    this._syncValveColor();
  }

  // ─── API publique ─────────────────────────────────────────────────

  get state(): AnimEngineState {
    return { currentVb: this.currentVb, mode: this.mode };
  }

  /** Ajoute exactement 0.1 mL (une goutte) — mode pas à pas */
  addOneDrop(): void {
    if (this.currentVb >= this.config.maxVb) return;
    this.stop();
    // Spawne une goutte visuelle et ajoute le volume
    this._spawnDrop();
    this.currentVb = Math.min(this.currentVb + ML_PER_DROP, this.config.maxVb);
    this._updateBuretteSVG();
    this._updateBecherSVG();
    this._syncPhLabel();
    this._updateVbLabel();
    this._dispatchVolumeChange();
    // Lancer une mini-boucle pour animer la goutte jusqu'à son atterrissage
    this._startDropOnlyLoop();
  }

  /** Ajoute un volume précis (multi-gouttes instantanées) */
  addVolume(ml: number): void {
    if (this.currentVb >= this.config.maxVb) return;
    this.stop();
    const n = Math.max(1, Math.round(ml / ML_PER_DROP));
    for (let i = 0; i < n; i++) this._spawnDrop();
    this.currentVb = Math.min(this.currentVb + ml, this.config.maxVb);
    this._updateBuretteSVG();
    this._updateBecherSVG();
    this._syncPhLabel();
    this._updateVbLabel();
    this._dispatchVolumeChange();
    this._startDropOnlyLoop();
  }

  /** Démarre le flux continu (mode ▶ Verser) */
  startFlow(): void {
    if (this.mode === 'flow') return;
    this.stop();
    this.mode = 'flow';
    this._syncValveColor();
    this._showStream(false);
    this._startLoop();
  }

  /** Démarre le versement rapide jusqu'à une cible en mL */
  pourToTarget(targetMl: number): void {
    if (this.currentVb >= targetMl) return;
    this.stop();
    this.fastTarget = Math.min(targetMl, this.config.maxVb);
    this.mode = 'fast';
    this._syncValveColor();
    this._showStream(true);
    this._startLoop();
  }

  /** Pause / Stop */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastTs = null;
    this.dropAccum = 0;
    this.mode = 'idle';
    this._syncValveColor();
    this._showStream(false);
  }

  /** Réinitialise la simulation (Vider) */
  reset(): void {
    this.stop();
    this.currentVb = 0;
    this.drops = [];
    if (this.dropsContainer) this.dropsContainer.innerHTML = '';
    this._updateBuretteSVG();
    this._updateBecherSVG();
    this._syncPhLabel();
    this._updateVbLabel();
    this._dispatchVolumeChange();
  }

  // ─── Boucle principale ────────────────────────────────────────────

  private _startLoop(): void {
    const loop = (ts: number) => {
      if (this.lastTs === null) this.lastTs = ts;
      const dtSec = Math.min((ts - this.lastTs) / 1000, 0.08); // cap 80ms
      this.lastTs = ts;

      let mlRate = 0;
      if (this.mode === 'flow') mlRate = FLOW_ML_PER_SEC;
      if (this.mode === 'fast') mlRate = FAST_ML_PER_SEC;

      const mlThisFrame = mlRate * dtSec;

      // Avancer le volume
      if (this.mode === 'flow' || this.mode === 'fast') {
        const before = this.currentVb;
        this.currentVb = Math.min(
          this.mode === 'fast' ? this.fastTarget : this.config.maxVb,
          this.currentVb + mlThisFrame
        );

        if (this.currentVb !== before) {
          this._updateBuretteSVG();
          this._updateBecherSVG();
          this._syncPhLabel();
          this._updateVbLabel();
          this._dispatchVolumeChange();
        }

        // Spawner des gouttes proportionnellement au débit
        this.dropAccum += mlThisFrame;
        const dropsToSpawn = this.mode === 'fast'
          ? Math.floor(this.dropAccum / (ML_PER_DROP * 2))
          : Math.floor(this.dropAccum / ML_PER_DROP);

        for (let i = 0; i < dropsToSpawn; i++) {
          this._spawnDrop();
          this.dropAccum -= (this.mode === 'fast' ? ML_PER_DROP * 2 : ML_PER_DROP);
        }

        // Fin de cible fast
        if (this.mode === 'fast' && this.currentVb >= this.fastTarget) {
          this._showStream(false);
          this.mode = 'idle';
          this._syncValveColor();
          // Laisser la boucle de gouttes se finir
          this._startDropOnlyLoop();
          return;
        }

        // Burette vide
        if (this.currentVb >= this.config.maxVb) {
          this.stop();
          this._startDropOnlyLoop();
          return;
        }
      }

      // Animer les gouttes existantes
      this._tickDrops();

      if (this.mode !== 'idle') {
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(loop);
  }

  /** Boucle légère qui ne fait qu'animer les gouttes en vol jusqu'à leur atterrissage */
  private _startDropOnlyLoop(): void {
    if (this.rafId !== null) return; // déjà une boucle active
    const loop = () => {
      if (this.drops.length === 0) {
        this.rafId = null;
        return;
      }
      this._tickDrops();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  // ─── Physique des gouttes ──────────────────────────────────────────

  private _spawnDrop(): void {
    if (!this.dropsContainer) return;

    const GEO = CANVAS_GEOMETRY;
    const x = GEO.burette.tipX + (Math.random() - 0.5) * 2; // légère variation X
    const y = GEO.burette.tipY;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r',  String(DROP_RADIUS));
    circle.setAttribute('fill', this.config.buretteFluidColor);
    circle.setAttribute('filter', 'url(#tc-drop-glow)');
    circle.style.transition = 'none';

    this.dropsContainer.appendChild(circle);

    const drop: Drop = {
      el: circle,
      x,
      y,
      vy: DROP_START_VY,
      targetY: GEO.becher.top + 8,
      r: DROP_RADIUS,
      alive: true,
    };
    this.drops.push(drop);
  }

  private _tickDrops(): void {
    const toRemove: Drop[] = [];

    for (const d of this.drops) {
      if (!d.alive) continue;

      d.vy += GRAVITY;
      d.y  += d.vy;

      // Légère oscillation horizontale (réalisme)
      d.x += Math.sin(d.y * 0.12) * 0.15;

      d.el.setAttribute('cx', String(d.x));
      d.el.setAttribute('cy', String(d.y));

      // La goutte arrive dans le bécher → splash + disparaît
      if (d.y >= d.targetY) {
        this._splash(d.x, d.targetY);
        d.el.remove();
        d.alive = false;
        toRemove.push(d);
      }
    }

    this.drops = this.drops.filter(d => d.alive);
  }

  private _splash(x: number, y: number): void {
    if (!this.dropsContainer) return;

    // Cercle de ripple
    const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ripple.setAttribute('cx', String(x));
    ripple.setAttribute('cy', String(y));
    ripple.setAttribute('r', '4');
    ripple.setAttribute('fill', 'none');
    ripple.setAttribute('stroke', this.config.buretteFluidColor);
    ripple.setAttribute('stroke-width', '1.5');
    ripple.setAttribute('opacity', '0.85');
    this.dropsContainer.appendChild(ripple);

    // Animation CSS via SMIL (aucun JS de style, compatible SVG)
    ripple.innerHTML = `
      <animate attributeName="r"    from="4" to="22" dur="0.4s" fill="freeze"/>
      <animate attributeName="opacity" from="0.85" to="0" dur="0.4s" fill="freeze"/>
    `;

    // Nettoyer après l'animation
    setTimeout(() => ripple.remove(), 420);
  }

  // ─── Mise à jour éléments SVG ──────────────────────────────────────

  private _updateBuretteSVG(): void {
    const GEO = CANVAS_GEOMETRY.burette;
    const maxVb = this.config.maxVb;

    const poured = Math.min(Math.max(this.currentVb / maxVb, 0), 1);
    const gradH  = GEO.tubeBottom - GEO.tubeTop;
    const liqTopY = GEO.tubeTop + poured * gradH;
    const liqH    = GEO.tubeBottom - liqTopY;

    const liqEl = document.getElementById('tc-bur-liquid');
    const menEl = document.getElementById('tc-bur-meniscus');

    if (liqEl) {
      liqEl.setAttribute('y',      String(liqTopY));
      liqEl.setAttribute('height', String(Math.max(liqH, 0)));
    }
    if (menEl) {
      menEl.setAttribute('cy', String(liqTopY));
    }
  }

  private _updateBecherSVG(): void {
    const GEO = CANVAS_GEOMETRY.becher;
    const { Ca, Va, Cb, indicator } = this.config;

    // Volume total dans le bécher = Va + Vb
    const totalVol = Va + this.currentVb;
    const maxVol   = 120;
    const totalH   = GEO.bottom - GEO.top + 10;
    const fillFrac = Math.min(Math.max(totalVol / maxVol, 0), 1);
    const liqTopY  = GEO.bottom - fillFrac * totalH;
    const liqH     = GEO.bottom - liqTopY + 4;

    // Couleur selon le pH
    const titState = calculateTitrationPoint(Ca, Va, Cb, this.currentVb, indicator);
    const color    = titState.color;

    const liqEl = document.getElementById('tc-bch-liquid');
    const menEl = document.getElementById('tc-bch-meniscus');

    if (liqEl) {
      liqEl.setAttribute('y',      String(liqTopY));
      liqEl.setAttribute('height', String(Math.max(liqH, 0)));
      liqEl.setAttribute('fill',   color);
    }
    if (menEl) {
      menEl.setAttribute('cy',   String(liqTopY));
      menEl.setAttribute('fill', color);
    }
  }

  private _syncPhLabel(): void {
    const { Ca, Va, Cb, indicator } = this.config;
    const titState = calculateTitrationPoint(Ca, Va, Cb, this.currentVb, indicator);

    const textEl = document.getElementById('tc-ph-text');
    if (textEl) {
      textEl.textContent = `pH: ${titState.pH.toFixed(2)}  |  ${titState.colorLabel}`;
    }
  }

  private _updateVbLabel(): void {
    const el = document.getElementById('tc-vb-label');
    if (el) el.textContent = `Vb = ${this.currentVb.toFixed(1)} mL`;
  }

  private _syncValveColor(): void {
    if (!this.valveBody) return;
    const isOpen = this.mode !== 'idle';
    this.valveBody.setAttribute('fill', isOpen ? '#10b981' : '#ef4444');
  }

  private _showStream(show: boolean): void {
    if (!this.streamLine) return;
    this.streamLine.setAttribute('opacity', show ? '0.65' : '0');
  }

  // ─── Events ───────────────────────────────────────────────────────

  private _dispatchVolumeChange(): void {
    document.dispatchEvent(new CustomEvent('titration:volumeChanged', {
      detail: { currentVb: this.currentVb, mode: this.mode }
    }));
  }
}

/** Instance singleton du moteur — réutilisée à travers toute l'application */
export const animationEngine = new AnimationEngine();
