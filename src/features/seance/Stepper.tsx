import { Link } from 'react-router-dom';
import { Ruler } from '../../ui/Ruler';
import { Check } from '../../ui/icons';
import { STEPS } from './logic';

interface StepperProps {
  exerciseId: string;
  current: number;
  furthest: number;
}

/** Les quatre temps de la séance, posés sur une règle graduée qui se remplit. */
export function Stepper({ exerciseId, current, furthest }: StepperProps) {
  return (
    <nav aria-label="Étapes de la séance">
      <ol className="grid grid-cols-4">
        {STEPS.map((step, i) => {
          const active = i === current;
          const done = i < current;
          const reachable = i <= furthest && !active;
          const plate = (
            <span className={`grid size-11 shrink-0 place-items-center rounded-md text-xl font-bold tabular-nums transition-colors duration-200 sm:size-12 sm:text-2xl ${active ? 'bg-ink text-white' : done ? 'bg-signal text-ink' : 'border-2 border-line-strong text-ink-2'}`}>
              {done ? <Check size={22} /> : i + 1}
            </span>
          );
          const label = (
            <span className={`hidden text-left text-base leading-tight sm:block ${active ? 'font-bold text-ink' : 'font-semibold text-ink-2'}`}>{step.label}</span>
          );
          return (
            <li key={step.id} className="min-w-0">
              {reachable ? (
                <Link to={`/seance/${exerciseId}/${step.id}`} className="group flex items-center gap-3 rounded-md pr-2 hover:bg-sunken" aria-label={`Revenir à l’étape ${i + 1} : ${step.label}`}>
                  {plate}{label}
                </Link>
              ) : (
                <div className="flex items-center gap-3 pr-2" aria-current={active ? 'step' : undefined}>
                  {plate}{label}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <Ruler className="mt-3" majors={4} minors={8} progress={(current + 1) / STEPS.length} />
      <p className="mt-2 text-sm font-bold text-ink sm:hidden">Étape {current + 1} sur 4 : {STEPS[current].label}</p>
    </nav>
  );
}
