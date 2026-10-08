import { useState } from 'react';
import type { CalculExercise, Params } from '../../exercises';
import { Button } from '../../ui/Button';
import { Check, Reset } from '../../ui/icons';
import { FigureView } from './FigureView';

interface Props {
  ex: CalculExercise;
  params: Params;
  variantId: string;
  answer: number;
}

/** Protocole pas à pas, puis résultat visible : la classe voit si sa réponse tient. */
export function CalculExperience({ ex, params, variantId, answer }: Props) {
  const [stage, setStage] = useState(0);
  const steps = ex.protocol(params, variantId, answer);
  const outcome = ex.outcome(params, variantId, answer);
  const done = stage >= steps.length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section aria-labelledby="protocole-titre" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h3 id="protocole-titre" className="text-lg font-bold text-ink">Protocole</h3>
        <p className="mt-1 text-[0.95rem] text-ink-2">Un geste à la fois, dans l’ordre. Le résultat apparaît à la dernière étape.</p>
        <ol className="mt-5 grid gap-3">
          {steps.map((label, i) => {
            const isDone = i < stage;
            const isCurrent = i === stage;
            return (
              <li key={label} className={`flex items-start gap-3 rounded-xl p-2 transition-colors duration-200 ${isCurrent ? 'bg-encre-soft' : ''}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${isDone ? 'bg-vert text-white' : isCurrent ? 'bg-encre text-white' : 'border-2 border-line-strong text-ink-2'}`}>
                  {isDone ? <Check size={16} /> : i + 1}
                </span>
                <span className={`pt-1 text-[1.05rem] leading-snug ${isCurrent ? 'font-bold text-ink' : isDone ? 'text-ink-2 line-through decoration-ink-2/40' : 'text-ink-2'}`}>{label}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-5">
          {!done && <Button size="lg" className="w-full" onClick={() => setStage(s => s + 1)}>{steps[stage]}</Button>}
          {stage > 0 && <Button variant="ghost" className="mt-2 w-full" onClick={() => setStage(0)}><Reset size={18} /> Recommencer</Button>}
        </div>
      </section>

      <section aria-labelledby="resultat-titre" aria-live="polite" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h3 id="resultat-titre" className="text-lg font-bold text-ink">Résultat de l’expérience</h3>
        {done ? (
          <div className="mt-4 grid gap-4">
            <FigureView figure={outcome.figure} />
            <p className="rounded-xl bg-surligneur/60 p-4 font-bold text-ink">{outcome.summary}</p>
          </div>
        ) : (
          <p className="mt-2 text-ink-2">Terminez le protocole pour afficher le résultat.</p>
        )}
      </section>
    </div>
  );
}
