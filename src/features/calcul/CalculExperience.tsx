import type { CalculExercise, Params } from '../../exercises';
import { Button } from '../../ui/Button';
import { Check, Pause, Play, Reset } from '../../ui/icons';
import { FigureView } from './FigureView';
import { SCENES } from './sim/scenes';
import { useTimeline } from './sim/useTimeline';

interface Props {
  ex: CalculExercise;
  params: Params;
  variantId: string;
  answer: number;
}

const DURATION_MS = 24000;

/**
 * Simulation de l’expérience : une paillasse animée qui suit le protocole,
 * avec lecture, pause et curseur. Le résultat s’affiche quand la simulation
 * arrive à son terme.
 */
export function CalculExperience({ ex, params, variantId, answer }: Props) {
  const { t, playing, play, pause, replay, seek } = useTimeline(DURATION_MS);
  const steps = ex.protocol(params, variantId, answer);
  const outcome = ex.outcome(params, variantId, answer);
  const Scene = SCENES[ex.id];
  const current = Math.min(steps.length - 1, Math.floor(t * steps.length));
  const done = t >= 0.999;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <section aria-label="Simulation" className="rounded-2xl border border-line bg-surface p-3 sm:p-5">
        <div className="rounded-xl bg-sunken p-2 text-ink">
          <svg viewBox="0 0 520 330" className="h-auto w-full" role="img" aria-label={`Simulation : ${steps[current]}`}>
            {Scene && <Scene ex={ex} params={params} variantId={variantId} answer={answer} t={t} n={steps.length} outcome={outcome} />}
          </svg>
        </div>
        <p className="mt-3 min-h-12 rounded-xl bg-encre-soft px-4 py-2.5 font-semibold text-ink" aria-live="polite">
          Étape {current + 1} sur {steps.length} : {steps[current]}
        </p>
        <div className="mt-3 flex items-center gap-3">
          {playing ? (
            <Button variant="secondary" onClick={pause}><Pause /> Pause</Button>
          ) : done ? (
            <Button onClick={replay}><Reset /> Rejouer</Button>
          ) : (
            <Button onClick={play}><Play /> {t === 0 ? 'Lancer la simulation' : 'Reprendre'}</Button>
          )}
          <input
            type="range" min={0} max={1000} value={Math.round(t * 1000)}
            onChange={event => seek(Number(event.target.value) / 1000)}
            aria-label="Avancement de la simulation"
            className="h-11 min-w-0 flex-1 accent-encre"
          />
        </div>
      </section>

      <div className="grid gap-5">
        <section aria-labelledby="protocole-titre" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h3 id="protocole-titre" className="text-lg font-bold text-ink">Protocole</h3>
          <ol className="mt-4 grid gap-1.5">
            {steps.map((label, i) => {
              const isDone = i < current || done;
              const isCurrent = i === current && !done;
              return (
                <li key={label}>
                  <button type="button" onClick={() => seek(i / steps.length + 0.001)}
                    className={`flex w-full items-start gap-3 rounded-xl p-2 text-left transition-colors duration-200 hover:bg-sunken ${isCurrent ? 'bg-encre-soft' : ''}`}>
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${isDone ? 'bg-vert text-white' : isCurrent ? 'bg-encre text-white' : 'border-2 border-line-strong text-ink-2'}`}>
                      {isDone ? <Check size={16} /> : i + 1}
                    </span>
                    <span className={`pt-1 leading-snug ${isCurrent ? 'font-bold text-ink' : isDone ? 'text-ink-2' : 'text-ink-2'}`}>{label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="resultat-titre" aria-live="polite" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h3 id="resultat-titre" className="text-lg font-bold text-ink">Résultat de l’expérience</h3>
          {done ? (
            <div className="mt-4 grid gap-4">
              <FigureView figure={outcome.figure} />
              <p className="rounded-xl bg-surligneur/60 p-4 font-bold text-ink">{outcome.summary}</p>
            </div>
          ) : (
            <p className="mt-2 text-ink-2">Lancez la simulation jusqu’au bout pour afficher le résultat.</p>
          )}
        </section>
      </div>
    </div>
  );
}
