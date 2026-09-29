import type { ReactNode } from 'react';

interface StepControlPanelProps {
  currentVb: number;
  maxVb: number;
  isPlaying: boolean;
  targetAnswer: number;
  answerUnit: string;
  stepMode: 'step' | 'flow' | 'fast';
  onModeChange: (mode: 'step' | 'flow' | 'fast') => void;
  onDrop: () => void;
  onAdd: (ml: number) => void;
  onUndo: () => void;
  onTogglePlay: () => void;
  onFast: () => void;
  onReset: () => void;
  titrationColor: string;
  titrationLabel: string;
  currentPH: number;
  children: ReactNode;
}

export default function StepControlPanel({
  currentVb,
  maxVb,
  isPlaying,
  targetAnswer,
  answerUnit,
  stepMode,
  onModeChange,
  onDrop,
  onAdd,
  onUndo,
  onTogglePlay,
  onFast,
  onReset,
  titrationColor,
  titrationLabel,
  currentPH,
  children,
}: StepControlPanelProps) {
  const progressPercent = Math.min(100, Math.max(0, (currentVb / maxVb) * 100));

  return (
    <div className="glass-card step-panel">
      {/* Header avec état du pH et couleur */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold flex items-center gap-2">
            <span>⚗️</span> Montage & Contrôle Pas-à-Pas
          </span>
        </div>
        <div className="ph-live-pill flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border">
          <span className="color-indicator-dot" style={{ background: titrationColor }} />
          <span className="font-mono font-bold text-xs text-emerald">
            pH {currentPH.toFixed(2)}
          </span>
          <span className="text-2xs text-muted">({titrationLabel})</span>
        </div>
      </div>

      {/* Zone Canvas SVG */}
      <div className="canvas-wrapper relative flex items-center justify-center p-2 rounded-xl bg-slate-950/40 border border-border">
        {children}
      </div>

      {/* Barre de progression du volume versé Vb */}
      <div className="volume-progress-wrap mt-3">
        <div className="flex justify-between text-2xs font-mono text-muted mb-1">
          <span>0 mL</span>
          <span className="font-bold text-emerald">
            Vb versé : {currentVb.toFixed(1)} / {maxVb} mL
          </span>
          <span>{maxVb} mL</span>
        </div>
        <div className="progress-bar-track h-2 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="progress-bar-fill h-full bg-emerald transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mode de contrôle (Pas-à-pas / Flux continu / Auto rapide) */}
      <div className="control-mode-tabs grid grid-cols-3 gap-1 p-1 mt-3 bg-surface-2 rounded-lg border border-border">
        <button
          className={`mode-tab-btn ${stepMode === 'step' ? 'active' : ''}`}
          onClick={() => onModeChange('step')}
        >
          💧 Pas à Pas
        </button>
        <button
          className={`mode-tab-btn ${stepMode === 'flow' ? 'active' : ''}`}
          onClick={() => onModeChange('flow')}
        >
          🌊 Flux Continu
        </button>
        <button
          className={`mode-tab-btn ${stepMode === 'fast' ? 'active' : ''}`}
          onClick={() => onModeChange('fast')}
        >
          ⚡ Cible Auto
        </button>
      </div>

      {/* Panneau de boutons de contrôle selon le mode choisi */}
      <div className="control-actions mt-3">
        {stepMode === 'step' && (
          <div className="grid grid-cols-4 gap-2">
            <button
              className="btn btn-emerald btn-touch flex-col py-2"
              onClick={onDrop}
              title="Ajouter exactement une goutte (0.1 mL)"
            >
              <span className="text-base">💧</span>
              <span className="text-2xs font-bold">+1 Goutte</span>
            </button>
            <button
              className="btn btn-secondary btn-touch flex-col py-2"
              onClick={() => onAdd(0.5)}
              title="Ajouter 0.5 mL"
            >
              <span className="text-base">🧪</span>
              <span className="text-2xs font-bold">+0.5 mL</span>
            </button>
            <button
              className="btn btn-secondary btn-touch flex-col py-2"
              onClick={() => onAdd(1.0)}
              title="Ajouter 1.0 mL"
            >
              <span className="text-base">🧪</span>
              <span className="text-2xs font-bold">+1.0 mL</span>
            </button>
            <button
              className="btn btn-danger btn-touch flex-col py-2"
              onClick={onUndo}
              title="Annuler le dernier versement"
              disabled={currentVb <= 0}
            >
              <span className="text-base">↩️</span>
              <span className="text-2xs font-bold">-0.5 mL</span>
            </button>
          </div>
        )}

        {stepMode === 'flow' && (
          <div className="flex items-center gap-2">
            <button
              className={`btn flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 ${
                isPlaying ? 'btn-danger' : 'btn-emerald btn-glow'
              }`}
              onClick={onTogglePlay}
            >
              <span>{isPlaying ? '⏸️ Pause Flow' : '▶️ Démarrer le Versement'}</span>
            </button>
            <button className="btn btn-secondary py-3 px-4" onClick={onReset}>
              🔄 Reset
            </button>
          </div>
        )}

        {stepMode === 'fast' && (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-emerald btn-glow flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2"
              onClick={onFast}
            >
              <span>⚡ Verser directement jusqu'à {targetAnswer} {answerUnit}</span>
            </button>
            <button className="btn btn-secondary py-3 px-4" onClick={onReset}>
              🔄 Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
