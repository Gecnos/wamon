import { useRef } from 'react';
import { fmt } from '../../lib/format';
import { Button } from '../../ui/Button';
import { Drop, Pause, Play, Reset } from '../../ui/icons';
import { BenchStage } from '../titration/BenchStage';
import { Readout } from '../titration/Readout';
import { TitrationCurve } from '../titration/TitrationCurve';
import { useTitration } from '../titration/useTitration';
import { useSeance } from './SeanceContext';
import { buretteCapacity, predictedVolume, quantity, variante } from './logic';

export function StepExperience() {
  const { state } = useSeance();
  const host = useRef<HTMLDivElement>(null);
  const maxVb = buretteCapacity(state);
  const { Ca, Va, Cb } = state.params;
  const t = useTitration(host, { Ca, Va, Cb, indicator: state.indicator, maxVb });

  const v = variante(state);
  const answer = state.classAnswer ?? 0;
  const target = Math.min(maxVb, Number(predictedVolume(state, answer).toFixed(2)));
  const reachedTarget = t.volume >= target - 1e-6;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <section aria-label="Paillasse" className="grid gap-4 rounded-3xl border border-line bg-surface p-4 sm:p-5">
        <BenchStage ref={host} className="h-[22rem] sm:h-[28rem] projection:h-[30rem]" />

        {/* Action principale : vérifier la prédiction de la classe. */}
        {t.pouring ? (
          <Button size="lg" variant="secondary" onClick={t.stop}><Pause /> Arrêter le versement</Button>
        ) : !reachedTarget ? (
          <Button size="lg" onClick={() => t.pourTo(target)}><Play /> Verser jusqu’à {fmt(target, 2)} mL</Button>
        ) : (
          <p className="rounded-xl bg-accent-soft p-3 text-center font-semibold text-accent">
            {fmt(target, 2)} mL versés. La couleur a-t-elle changé&nbsp;? Ajustez à la main.
          </p>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold text-ink-2">Verser à la main</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={t.addDrop} disabled={t.pouring}><Drop size={18} /> Goutte</Button>
            <Button variant="secondary" onClick={() => t.addVolume(0.5)} disabled={t.pouring}>+0,5 mL</Button>
            <Button variant="secondary" onClick={() => t.addVolume(1)} disabled={t.pouring}>+1 mL</Button>
          </div>
          <Button variant="ghost" className="mt-2 w-full" onClick={t.reset} disabled={t.volume === 0 && !t.pouring}><Reset size={18} /> Remplir à nouveau la burette</Button>
        </div>
      </section>

      <div className="grid gap-5">
        <div className="rounded-2xl border-2 border-brand/30 bg-brand-soft px-5 py-4">
          <p className="text-lg text-brand-strong">
            La classe a trouvé <strong className="tabular-nums">{v.inconnue} = {fmt(answer, 3)} {quantity(v.inconnue).unite}</strong>.
            {v.inconnue === 'Ve'
              ? <> Si c’est juste, l’indicateur doit changer de couleur vers <strong>{fmt(target, 2)} mL</strong>.</>
              : <> Si c’est juste, l’équivalence doit arriver vers <strong>{fmt(target, 2)} mL</strong> de soude.</>}
          </p>
        </div>
        <Readout volume={t.volume} maxVb={maxVb} pH={t.reading.pH} color={t.reading.color} colorLabel={t.reading.colorLabel} />
        <section aria-labelledby="courbe-titre" className="rounded-3xl border border-line bg-surface p-4 sm:p-6">
          <h2 id="courbe-titre" className="text-lg font-bold text-ink">Courbe du dosage, tracée en direct</h2>
          <p className="text-sm text-ink-2">Le saut de pH se produit à l’équivalence. Arrive-t-il sur la ligne de la classe&nbsp;?</p>
          <div className="mt-3">
            <TitrationCurve title="pH en fonction du volume versé" Ca={Ca} Va={Va} Cb={Cb} maxVb={maxVb} currentVb={t.volume} showTheory={false}
              markers={[{ value: target, label: 'Prédiction de la classe', color: '#1b5a3d', dashed: true }]} />
          </div>
        </section>
      </div>
    </div>
  );
}
