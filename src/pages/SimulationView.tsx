import { useState, useRef, useEffect, useCallback } from 'react';
import dosageConfig from '../data/modules/dosage-fort-fort.json';
import { calculateTitrationPoint, type IndicatorType } from '../models/dosageFortFort';
import { verifyResult } from '../core/validator';
import type { ModuleConfig, VerificationResult, GroupResult } from '../types';
import { animationEngine } from '../engine/AnimationEngine';
import { createTitrationCanvasSVG } from '../engine/TitrationCanvas';
import CurvePlotter from '../components/CurvePlotter';
import ParameterForm from '../components/ParameterForm';
import StepControlPanel from '../components/StepControlPanel';
import MultiGroupPanel from '../components/MultiGroupPanel';
import SolutionModal from '../components/SolutionModal';

const config = dosageConfig as ModuleConfig;

// ─── State Types ──────────────────────────────────────────────

export interface FormState {
  varianteId: string;
  params: Record<string, number>;
  userAnswer: number;
  tolerance: number;
  indicator: IndicatorType;
}

const DEFAULT_FORM: FormState = {
  varianteId: 'A',
  params: { Ca: 0.10, Va: 20, Cb: 0.10, Ve: 20 },
  userAnswer: 20,
  tolerance: 0.02,
  indicator: 'btb',
};

// ─── Component ───────────────────────────────────────────────

export default function SimulationView() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [varianteId, setVarianteId] = useState('A');
  const [currentVb, setCurrentVb] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [groups, setGroups] = useState<GroupResult[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [stepMode, setStepMode] = useState<'step' | 'flow' | 'fast'>('step');
  const [canvasMounted, setCanvasMounted] = useState(false);

  const canvasHostRef = useRef<HTMLDivElement>(null);

  const variante = config.variantes.find(v => v.id === varianteId)!;
  const MAX_VB = 25;

  // ── Calcul courbe ─────────────────────────────────────────
  const curvePoints = useCallback(() => {
    const pts: { Vb: number; pH: number }[] = [];
    const { Ca, Va, Cb } = form.params;
    for (let v = 0; v <= MAX_VB; v += 0.5) {
      const s = calculateTitrationPoint(Ca, Va, Cb, v, form.indicator);
      pts.push({ Vb: v, pH: s.pH });
    }
    return pts;
  }, [form]);

  const targetVe = variante.inconnue === 'Ve'
    ? form.userAnswer
    : (form.params.Ve ?? (form.params.Ca * form.params.Va) / form.params.Cb);
  const answerUnit = config.grandeurs[variante.inconnue]?.unite ?? 'mL';

  // ── Montage du canvas SVG ────────────────────────────────
  const mountCanvas = useCallback(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const titState = calculateTitrationPoint(
      form.params.Ca, form.params.Va, form.params.Cb, 0, form.indicator
    );

    host.innerHTML = createTitrationCanvasSVG({
      initialVb:         0,
      maxVb:             MAX_VB,
      initialVa:         form.params.Va,
      initialColor:      titState.color,
      width:             320,
      height:            500,
      buretteFluidColor: 'rgba(196, 119, 61, 0.82)',
    });

    animationEngine.mount({
      initialVb:         0,
      maxVb:             MAX_VB,
      initialVa:         form.params.Va ?? 20,
      Ca:                form.params.Ca,
      Va:                form.params.Va,
      Cb:                form.params.Cb,
      indicator:         form.indicator,
      buretteFluidColor: 'rgba(196, 119, 61, 0.82)',
    });

    setCanvasMounted(true);
    setCurrentVb(0);
  }, [form]);

  // Monte le canvas au premier rendu de la vue simulation
  useEffect(() => {
    if (!canvasMounted) {
      // Petit délai pour laisser le DOM se peindre
      const t = setTimeout(mountCanvas, 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [canvasMounted, mountCanvas]);

  // ── Écoute volume changes du moteur ──────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { currentVb: vb, mode } = (e as CustomEvent).detail;
      setCurrentVb(vb);
      setIsPlaying(mode !== 'idle');
    };
    document.addEventListener('titration:volumeChanged', handler);
    return () => document.removeEventListener('titration:volumeChanged', handler);
  }, []);

  // ── Handlers ────────────────────────────────────────────

  const handleLaunch = useCallback((newForm: FormState) => {
    setForm(newForm);

    // Calcul résultat théorique
    const varianteConf = config.variantes.find(v => v.id === varianteId)!;
    const refValue = varianteConf.inconnue === 'Ve'
      ? (newForm.params.Ca * newForm.params.Va) / newForm.params.Cb
      : (newForm.params.Cb * newForm.params.Ve) / newForm.params.Va;

    const res = verifyResult(newForm.userAnswer, refValue, newForm.tolerance);
    setVerification(res);
    setShowSolution(false);

    // Reconfigurer le moteur et verser jusqu'à la cible
    animationEngine.reconfigure({
      initialVb:         0,
      maxVb:             MAX_VB,
      initialVa:         newForm.params.Va ?? 20,
      Ca:                newForm.params.Ca,
      Va:                newForm.params.Va,
      Cb:                newForm.params.Cb,
      indicator:         newForm.indicator,
      buretteFluidColor: 'rgba(196, 119, 61, 0.82)',
    });

    setCurrentVb(0);
    setIsPlaying(false);
    setCanvasMounted(true); // déjà monté

    // Verser automatiquement en mode "fast"
    requestAnimationFrame(() => {
      animationEngine.pourToTarget(varianteConf.inconnue === 'Ve' ? newForm.userAnswer : newForm.params.Ve);
      setIsPlaying(true);
    });
  }, [varianteId]);

  const handleFormChange = (newForm: FormState) => setForm(newForm);

  const handleVarianteChange = (id: string) => {
    setVarianteId(id);
    setForm(current => ({ ...current, varianteId: id, userAnswer: id === 'A' ? current.userAnswer : 0 }));
    handleReset();
  };

  const handleReset = () => {
    animationEngine.stop();
    animationEngine.reset();
    setCurrentVb(0);
    setIsPlaying(false);
    setVerification(null);
    setShowSolution(false);
    setCanvasMounted(false);
  };

  const handleAddGroup = () => {
    if (groups.length >= 6) return;
    const colors = ['#386c51','#b8624d','#8869a0','#c28b47','#4e7a8a','#826c57'];
    const idx = groups.length;
    setGroups(g => [...g, {
      id: `g${idx + 1}`,
      name: `Groupe ${idx + 1}`,
      value: form.userAnswer,
      color: colors[idx % colors.length],
    }]);
  };

  const handleRemoveGroup = (idx: number) => {
    setGroups(g => g.filter((_, i) => i !== idx));
  };

  // ── Step actions ────────────────────────────────────────

  const handleDrop      = () => animationEngine.addOneDrop();
  const handleAdd       = (ml: number) => animationEngine.addVolume(ml);
  const handleUndo      = () => {
    const newVb = Math.max(0, currentVb - 0.5);
    animationEngine.reconfigure({
      initialVb: newVb,
      maxVb: MAX_VB,
      initialVa: form.params.Va,
      Ca: form.params.Ca,
      Va: form.params.Va,
      Cb: form.params.Cb,
      indicator: form.indicator,
      buretteFluidColor: 'rgba(196, 119, 61, 0.82)',
    });
    setCurrentVb(newVb);
  };
  const handleTogglePlay = () => {
    if (isPlaying) {
      animationEngine.stop();
      setIsPlaying(false);
    } else {
      animationEngine.startFlow();
      setIsPlaying(true);
    }
  };
  const handleFast      = () => {
    animationEngine.pourToTarget(targetVe);
    setIsPlaying(true);
  };

  const titState = calculateTitrationPoint(
    form.params.Ca, form.params.Va, form.params.Cb, currentVb, form.indicator
  );

  return (
    <div className="sim-workspace page-in">
      <header className="sim-page-header">
        <div>
          <p className="sim-page-kicker">CHIMIE <span>/</span> DOSAGE ACIDO-BASIQUE <span>/</span> {config.niveau.join(' · ').toUpperCase()}</p>
          <h1>{config.titre}</h1>
          <p className="sim-page-intro">La classe calcule le résultat, puis on observe ensemble ce qu’il change pendant l’expérience.</p>
        </div>
        <div className="sim-header-actions">
          <button className="sim-reset-button" onClick={handleReset}>Réinitialiser</button>
          <button
            className="sim-solution-button"
            onClick={() => setShowSolution(true)}
            disabled={!verification}
          >
            Voir la correction
          </button>
        </div>
      </header>

      {/* ── Bannière de vérification ─────────────────────── */}
      {verification && (
        <div className={`result-banner ${verification.isCoherent ? 'result-ok' : 'result-err'}`}>
          <div className="banner-icon">{verification.isCoherent ? '✅' : '❌'}</div>
          <div className="banner-body">
            <div className="banner-title">
              Résultat {verification.isCoherent ? 'COHÉRENT ✓' : 'INCOHÉRENT ✗'}
            </div>
            <div className="banner-detail">{verification.details}</div>
          </div>
          <div className="banner-stats">
            <div className="stat">
              <span className="stat-lbl">Écart</span>
              <span className="stat-val">
                {verification.diffValue > 0 ? '+' : ''}{verification.diffValue.toFixed(2)} {answerUnit}
              </span>
            </div>
            <div className="stat">
              <span className="stat-lbl">Erreur</span>
              <span className="stat-val">{verification.diffPercent.toFixed(1)} %</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Grille principale ────────────────────────────── */}
      <div className="sim-grid mt-4">

        {/* Col 1 — Formulaire */}
        <div className="sim-preparation">
          <ParameterForm
            config={config}
            variante={variante}
            form={form}
            onChange={handleFormChange}
            onSubmit={handleLaunch}
            onVarianteChange={handleVarianteChange}
          />
          <MultiGroupPanel
            groups={groups}
            unit={answerUnit}
            onAdd={handleAddGroup}
            onRemove={handleRemoveGroup}
          />
        </div>

        {/* Col 2 — Canvas + Contrôles */}
        <div className="simulation-dashboard">
          <StepControlPanel
            currentVb={currentVb}
            maxVb={MAX_VB}
            isPlaying={isPlaying}
            targetAnswer={targetVe}
            answerUnit="mL"
            stepMode={stepMode}
            onModeChange={setStepMode}
            onDrop={handleDrop}
            onAdd={handleAdd}
            onUndo={handleUndo}
            onTogglePlay={handleTogglePlay}
            onFast={handleFast}
            onReset={handleReset}
            titrationColor={titState.color}
            titrationLabel={titState.colorLabel}
            currentPH={titState.pH}
          >
            {/* Canvas SVG monté via ref */}
            <div
              ref={canvasHostRef}
              className="canvas-stage"
              id="titration-canvas-host"
            />
          </StepControlPanel>

          <section className="curve-card">
            <div className="curve-heading"><div><p>ÉVOLUTION DU MILIEU</p><h2>Courbe de titrage</h2></div><span>pH = f(V<sub>b</sub>)</span></div>
            <CurvePlotter
              points={curvePoints()}
              currentVb={currentVb}
              maxVb={MAX_VB}
              targetVe={targetVe}
              width={420}
              height={330}
            />
            {groups.length > 0 && (
              <div className="grp-legend">
                <p className="group-results-label">Résultats des groupes</p>
                <div className="flex flex-wrap gap-2">
                  {groups.map(g => (
                    <span key={g.id} className="grp-item">
                      <span className="grp-dot" style={{ background: g.color }} />
                      {g.name}: <strong>{g.value}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

      </div>

      {/* Modales */}
      {showSolution && verification && (
        <SolutionModal
          result={verification}
          varianteId={varianteId}
          params={form.params}
          onClose={() => setShowSolution(false)}
        />
      )}
    </div>
  );
}
