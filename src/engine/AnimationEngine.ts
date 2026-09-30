import { CANVAS_GEOMETRY } from './TitrationCanvas';
import type { IndicatorType } from '../models/dosageFortFort';
import { titrationPoint } from '../models/titration';

export type AnimMode = 'idle' | 'drop' | 'flow' | 'fast';

export interface AnimEngineConfig {
  initialVb: number;
  maxVb: number;
  initialVa: number;
  Ca: number;
  Va: number;
  Cb: number;
  indicator: IndicatorType;
  buretteFluidColor: string;
  /** Absent : acide fort. */
  pKa?: number;
}

export interface AnimEngineState {
  currentVb: number;
  mode: AnimMode;
}

interface Drop {
  el: SVGCircleElement;
  x: number;
  y: number;
  vy: number;
  targetY: number;
  r: number;
  alive: boolean;
}

const GRAVITY = 0.55;
const DROP_RADIUS = 4.0;
const DROP_START_VY = 1.2;
const ML_PER_DROP = 0.1;
const FLOW_ML_PER_SEC = 0.40;
const FAST_ML_PER_SEC = 4.0;

export class AnimationEngine {
  private config!: AnimEngineConfig;
  private currentVb = 0;
  private mode: AnimMode = 'idle';
  private fastTarget = 0;

  private rafId: number | null = null;
  private lastTs: number | null = null;
  private dropAccum = 0;
  private drops: Drop[] = [];

  private dropsContainer: SVGGElement | null = null;
  private streamLine: SVGLineElement | null = null;
  private valveBody: SVGRectElement | null = null;

  constructor() {}

  mount(config: AnimEngineConfig): void {
    this.config = config;
    this.currentVb = config.initialVb;
    this.mode = 'idle';

    this.dropsContainer = document.getElementById('tc-drops-container') as unknown as SVGGElement;
    this.streamLine = document.getElementById('tc-stream-line') as unknown as SVGLineElement;
    this.valveBody = document.getElementById('tc-valve-body') as unknown as SVGRectElement;

    this._updateBuretteSVG();
    this._updateBecherSVG();
    this._syncPhLabel();
    this._updateVbLabel();
    this._syncValveColor();
  }

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

  get state(): AnimEngineState {
    return { currentVb: this.currentVb, mode: this.mode };
  }

  addOneDrop(): void {
    if (this.currentVb >= this.config.maxVb) return;
    this.stop();
    this._spawnDrop();
    this.currentVb = Math.min(this.currentVb + ML_PER_DROP, this.config.maxVb);
    this._updateBuretteSVG();
    this._updateBecherSVG();
    this._syncPhLabel();
    this._updateVbLabel();
    this._dispatchVolumeChange();
    this._startDropOnlyLoop();
  }

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

  startFlow(): void {
    if (this.mode === 'flow') return;
    this.stop();
    this.mode = 'flow';
    this._syncValveColor();
    this._showStream(false);
    this._startLoop();
  }

  pourToTarget(targetMl: number): void {
    if (this.currentVb >= targetMl) return;
    this.stop();
    this.fastTarget = Math.min(targetMl, this.config.maxVb);
    this.mode = 'fast';
    this._syncValveColor();
    this._showStream(true);
    this._startLoop();
  }

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

  private _startLoop(): void {
    const loop = (ts: number) => {
      if (this.lastTs === null) this.lastTs = ts;
      const dtSec = Math.min((ts - this.lastTs) / 1000, 0.08);
      this.lastTs = ts;

      let mlRate = 0;
      if (this.mode === 'flow') mlRate = FLOW_ML_PER_SEC;
      if (this.mode === 'fast') mlRate = FAST_ML_PER_SEC;

      const mlThisFrame = mlRate * dtSec;

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

        this.dropAccum += mlThisFrame;
        const dropsToSpawn = this.mode === 'fast'
          ? Math.floor(this.dropAccum / (ML_PER_DROP * 2))
          : Math.floor(this.dropAccum / ML_PER_DROP);

        for (let i = 0; i < dropsToSpawn; i++) {
          this._spawnDrop();
          this.dropAccum -= (this.mode === 'fast' ? ML_PER_DROP * 2 : ML_PER_DROP);
        }

        if (this.mode === 'fast' && this.currentVb >= this.fastTarget) {
          this._showStream(false);
          this.mode = 'idle';
          this.rafId = null;
          this._syncValveColor();
          this._dispatchVolumeChange();
          this._startDropOnlyLoop();
          return;
        }

        if (this.currentVb >= this.config.maxVb) {
          this.stop();
          this._dispatchVolumeChange();
          this._startDropOnlyLoop();
          return;
        }
      }

      this._tickDrops();

      if (this.mode !== 'idle') {
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(loop);
  }

  private _startDropOnlyLoop(): void {
    if (this.rafId !== null) return;
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

  private _spawnDrop(): void {
    if (!this.dropsContainer) return;

    const GEO = CANVAS_GEOMETRY;
    const x = GEO.burette.tipX + (Math.random() - 0.5) * 2;
    const y = GEO.burette.tipY;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', String(DROP_RADIUS));
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
    for (const d of this.drops) {
      if (!d.alive) continue;

      d.vy += GRAVITY;
      d.y += d.vy;
      d.x += Math.sin(d.y * 0.12) * 0.15;

      d.el.setAttribute('cx', String(d.x));
      d.el.setAttribute('cy', String(d.y));

      if (d.y >= d.targetY) {
        this._splash(d.x, d.targetY);
        d.el.remove();
        d.alive = false;
      }
    }

    this.drops = this.drops.filter(d => d.alive);
  }

  private _splash(x: number, y: number): void {
    if (!this.dropsContainer) return;

    const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ripple.setAttribute('cx', String(x));
    ripple.setAttribute('cy', String(y));
    ripple.setAttribute('r', '4');
    ripple.setAttribute('fill', 'none');
    ripple.setAttribute('stroke', this.config.buretteFluidColor);
    ripple.setAttribute('stroke-width', '1.5');
    ripple.setAttribute('opacity', '0.85');
    this.dropsContainer.appendChild(ripple);

    ripple.innerHTML = `
      <animate attributeName="r" from="4" to="22" dur="0.4s" fill="freeze"/>
      <animate attributeName="opacity" from="0.85" to="0" dur="0.4s" fill="freeze"/>
    `;

    setTimeout(() => ripple.remove(), 420);
  }

  private _updateBuretteSVG(): void {
    const GEO = CANVAS_GEOMETRY.burette;
    const maxVb = this.config.maxVb;

    const poured = Math.min(Math.max(this.currentVb / maxVb, 0), 1);
    const gradH = GEO.tubeBottom - GEO.tubeTop;
    const liqTopY = GEO.tubeTop + poured * gradH;
    const liqH = GEO.tubeBottom - liqTopY;

    const liqEl = document.getElementById('tc-bur-liquid');
    const menEl = document.getElementById('tc-bur-meniscus');

    if (liqEl) {
      liqEl.setAttribute('y', String(liqTopY));
      liqEl.setAttribute('height', String(Math.max(liqH, 0)));
    }
    if (menEl) {
      menEl.setAttribute('cy', String(liqTopY));
    }
  }

  private _updateBecherSVG(): void {
    const GEO = CANVAS_GEOMETRY.becher;
    const { Ca, Va, Cb, indicator, pKa } = this.config;

    const totalVol = Va + this.currentVb;
    const maxVol = 120;
    const totalH = GEO.bottom - GEO.top + 10;
    const fillFrac = Math.min(Math.max(totalVol / maxVol, 0), 1);
    const liqTopY = GEO.bottom - fillFrac * totalH;
    const liqH = GEO.bottom - liqTopY + 4;

    const titState = titrationPoint({ Ca, Va, Cb, pKa }, this.currentVb, indicator);
    const color = titState.color;

    const liqEl = document.getElementById('tc-bch-liquid');
    const menEl = document.getElementById('tc-bch-meniscus');

    if (liqEl) {
      liqEl.setAttribute('y', String(liqTopY));
      liqEl.setAttribute('height', String(Math.max(liqH, 0)));
      liqEl.setAttribute('fill', color);
    }
    if (menEl) {
      menEl.setAttribute('cy', String(liqTopY));
      menEl.setAttribute('fill', color);
    }
  }

  private _syncPhLabel(): void {
    const { Ca, Va, Cb, indicator, pKa } = this.config;
    const titState = titrationPoint({ Ca, Va, Cb, pKa }, this.currentVb, indicator);

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

  private _dispatchVolumeChange(): void {
    document.dispatchEvent(new CustomEvent('titration:volumeChanged', {
      detail: { currentVb: this.currentVb, mode: this.mode }
    }));
  }
}

export const animationEngine = new AnimationEngine();
