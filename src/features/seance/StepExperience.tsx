import { useRef } from 'react';
import type { Exercise, TitrationExercise } from '../../exercises';
import { findVariant } from '../../exercises';
import { fmt } from '../../lib/format';
import { Button } from '../../ui/Button';
import { Drop, Pause, Play, Reset } from '../../ui/icons';
import { CalculExperience } from '../calcul/CalculExperience';
import { PhExperience } from '../ph/PhExperience';
import { PreparationExperiment } from '../preparation/PreparationExperiment';
import { BenchStage } from '../titration/BenchStage';
import { Readout } from '../titration/Readout';
import { TitrationCurve } from '../titration/TitrationCurve';
import { useTitration } from '../titration/useTitration';
import { useSeance } from './SeanceContext';
import { buretteCapacity } from './logic';

function TitrationExperiment({ ex }: { ex: TitrationExercise }) {
  const { state } = useSeance(ex);
  const host = useRef<HTMLDivElement>(null);
  const { Ca, Va, Cb } = state.params;
  const pKa = ex.acid.pKa;
  const answer = state.classAnswer ?? 0;
  const predicted = ex.predictedVolume(state.params, state.variantId, answer);
  const maxVb = buretteCapacity(ex.value(state.params, 'Ve'), predicted);
  const target = Math.min(maxVb, Number(predicted.toFixed(2)));
  const t = useTitration(host, { Ca, Va, Cb, pKa, mirror: ex.mirror, indicator: state.indicator, maxVb });
  const reachedTarget = t.volume >= target - 1e-6;
  const v = findVariant(ex, state.variantId);
  const q = ex.quantities[v.unknown];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
      <section aria-label="Paillasse" className="grid gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <BenchStage ref={host} className="h-[22rem] sm:h-[28rem] projection:h-[30rem]" />

        {/* Action principale : vérifier la prédiction de la classe. */}
        {t.pouring ? (
          <Button size="lg" variant="secondary" onClick={t.stop}><Pause /> Arrêter le versement</Button>
        ) : !reachedTarget ? (
          <Button size="lg" onClick={() => t.pourTo(target)}><Play /> Verser jusqu’à {fmt(target, 2)} mL</Button>
        ) : (
          <p className="rounded-xl border border-line bg-encre-soft p-3 text-center font-bold text-ink">
            {fmt(target, 2)} mL versés. La couleur a-t-elle changé&nbsp;? Ajustez à la main.
          </p>
        )}

        <div>
          <p className="mb-2 text-[0.95rem] font-semibold text-ink-2">Verser à la main</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={t.addDrop} disabled={t.pouring}><Drop size={18} /> Goutte</Button>
            <Button variant="secondary" onClick={() => t.addVolume(0.5)} disabled={t.pouring}>+0,5 mL</Button>
            <Button variant="secondary" onClick={() => t.addVolume(1)} disabled={t.pouring}>+1 mL</Button>
          </div>
          <Button variant="ghost" className="mt-2 w-full" onClick={t.reset} disabled={t.volume === 0 && !t.pouring}><Reset size={18} /> Remplir à nouveau la burette</Button>
        </div>
      </section>

      <div className="grid gap-5">
        <p className="rounded-2xl border border-line bg-encre-soft px-5 py-4 text-lg text-ink">
          La classe a trouvé <mark className="rounded bg-surligneur px-1 font-bold text-ink tabular-nums">{q.symbol} = {fmt(answer, q.digits)} {q.unit}</mark>.{' '}
          {v.unknown === 'Ve'
            ? <>Si c’est juste, l’indicateur doit changer de couleur vers <strong>{fmt(target, 2)} mL</strong>.</>
            : <>Si c’est juste, l’équivalence doit arriver vers <strong>{fmt(target, 2)} mL</strong> {/^[aeiouéèh]/i.test(ex.base.name) ? 'd’' : 'de '}{ex.base.name}.</>}
        </p>
        <Readout volume={t.volume} maxVb={maxVb} pH={t.reading.pH} color={t.reading.color} colorLabel={t.reading.colorLabel} />
        <section aria-labelledby="courbe-titre" className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
          <h3 id="courbe-titre" className="text-lg font-bold text-ink">La courbe se trace pendant le versement</h3>
          <p className="text-[0.95rem] text-ink-2">Le saut de pH signale l’équivalence. Tombe-t-il sur la ligne de la classe&nbsp;?</p>
          <div className="mt-3">
            <TitrationCurve title="pH en fonction du volume versé" Ca={Ca} Va={Va} Cb={Cb} pKa={pKa} mirror={ex.mirror} titrant={ex.base.name} maxVb={maxVb} currentVb={t.volume} showTheory={false}
              markers={[{ value: target, label: 'Prédiction de la classe', color: '#1e44c4', dashed: true }]} />
          </div>
        </section>
      </div>
    </div>
  );
}

export function StepExperience({ ex }: { ex: Exercise }) {
  const { state } = useSeance(ex);
  if (ex.kind === 'titration') return <TitrationExperiment ex={ex} />;
  if (ex.kind === 'calcul') return <CalculExperience ex={ex} params={state.params} variantId={state.variantId} answer={state.classAnswer ?? 0} />;
  if (ex.kind === 'ph') return <PhExperience ex={ex} params={state.params} variantId={state.variantId} answer={state.classAnswer ?? 0} />;
  return <PreparationExperiment ex={ex} params={state.params} variantId={state.variantId} answer={state.classAnswer ?? 0} />;
}
