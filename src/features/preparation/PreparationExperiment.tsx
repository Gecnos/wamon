import { useState } from 'react';
import type { PreparationExercise } from '../../exercises';
import { fmt } from '../../lib/format';
import { Button } from '../../ui/Button';
import { Check, Reset } from '../../ui/icons';
import { PreparationBench } from './PreparationBench';

interface Props {
  ex: PreparationExercise;
  params: Record<string, number>;
  variantId: string;
  answer: number;
}

/** Protocole de laboratoire : un geste à la fois, dans l’ordre. */
function protocol(ex: PreparationExercise, amount: number, V: number): string[] {
  return ex.method === 'dilution'
    ? [
        `Prélever ${fmt(amount, 1)} mL de solution mère à la pipette`,
        'Verser le prélèvement dans la fiole jaugée',
        'Compléter à l’eau distillée jusqu’au trait de jauge',
        'Boucher et retourner la fiole pour homogénéiser',
      ]
    : [
        `Peser ${fmt(amount, 2)} g de sulfate de cuivre`,
        'Verser le solide dans la fiole avec un entonnoir, rincer la coupelle',
        'Remplir aux trois quarts d’eau distillée et agiter jusqu’à dissolution',
        `Compléter jusqu’au trait de jauge (${fmt(V)} mL) et homogénéiser`,
      ];
}

export function PreparationExperiment({ ex, params, variantId, answer }: Props) {
  const [stage, setStage] = useState(0);
  const exp = ex.experiment(params, variantId, answer);
  const V = ex.method === 'dilution' ? params.Vfille : params.V;
  const steps = protocol(ex, exp.amount, V);
  const done = stage >= steps.length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <section aria-label="Paillasse" className="rounded-lg border border-line bg-surface p-3 sm:p-5">
        <div className="aspect-[56/40] w-full text-[#4a5260]">
          <PreparationBench
            ex={ex}
            stage={stage}
            amount={exp.amount}
            obtained={exp.obtained}
            expected={exp.expected}
            expectedLabel={exp.answerIsUsed ? 'teinte visée' : 'selon la classe'}
            motherConcentration={params.Cmere}
            pouredFraction={ex.method === 'dilution' ? exp.amount / params.Vfille : undefined}
          />
        </div>
      </section>

      <section aria-labelledby="protocole-titre" className="rounded-lg border border-line bg-surface p-5 sm:p-6">
        <h3 id="protocole-titre" className="text-lg font-bold text-ink">Protocole</h3>
        <p className="mt-1 text-[0.95rem] text-ink-2">
          {exp.answerIsUsed
            ? 'On manipule avec la valeur trouvée par la classe. Si elle est juste, la fiole aura la même teinte que le témoin.'
            : 'Le témoin a la teinte que prévoit la classe. Si sa réponse est juste, la fiole aura la même teinte.'}
        </p>
        <ol className="mt-5 grid gap-3">
          {steps.map((label, i) => {
            const isDone = i < stage;
            const isCurrent = i === stage;
            return (
              <li key={label} className={`flex items-start gap-3 rounded-md p-2 transition-colors duration-200 ${isCurrent ? 'bg-mesure-soft' : ''}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${isDone ? 'bg-vert text-white' : isCurrent ? 'bg-ink text-white' : 'border-2 border-line-strong text-ink-2'}`}>
                  {isDone ? <Check size={16} /> : i + 1}
                </span>
                <span className={`pt-1 text-[1.05rem] leading-snug ${isCurrent ? 'font-bold text-ink' : isDone ? 'text-ink-2 line-through decoration-ink-2/40' : 'text-ink-2'}`}>{label}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-5">
          {!done ? (
            <Button size="lg" className="w-full" onClick={() => setStage(s => s + 1)}>{steps[stage]}</Button>
          ) : (
            <div className="rounded-md bg-surligneur/60 p-4 text-ink">
              <p className="font-bold">Solution prête. Comparez la fiole et le témoin.</p>
              <p className="mt-1 text-[0.95rem]">Même teinte : la réponse tient. Teinte différente : il y a une erreur à trouver.</p>
            </div>
          )}
          {stage > 0 && <Button variant="ghost" className="mt-2 w-full" onClick={() => setStage(0)}><Reset size={18} /> Recommencer la préparation</Button>}
        </div>
      </section>
    </div>
  );
}
