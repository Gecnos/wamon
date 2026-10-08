import { Link } from 'react-router-dom';
import { Check } from '../../ui/icons';
import { STEPS } from './logic';

interface StepperProps {
  exerciseId: string;
  current: number;
  furthest: number;
}

/** Les quatre temps de la séance, reliés comme une frise. */
export function Stepper({ exerciseId, current, furthest }: StepperProps) {
  return (
    <nav aria-label="Étapes de la séance">
      <ol className="grid grid-cols-4">
        {STEPS.map((step, i) => {
          const active = i === current;
          const done = i < current;
          const reachable = i <= furthest && !active;
          const dot = (
            <span className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-base font-bold transition-colors duration-200 sm:size-10 ${active ? 'bg-encre text-white ring-4 ring-encre-soft' : done ? 'bg-encre-soft text-encre-strong' : 'border-2 border-line-strong bg-surface text-ink-2'}`}>
              {done ? <Check size={18} /> : i + 1}
            </span>
          );
          const label = (
            <span className={`mt-2 hidden text-center text-sm leading-tight sm:block ${active ? 'font-bold text-ink' : 'font-medium text-ink-2'}`}>{step.label}</span>
          );
          return (
            <li key={step.id} className="relative flex flex-col items-center">
              {/* Trait vers l’étape suivante */}
              {i < STEPS.length - 1 && <span aria-hidden="true" className={`absolute left-1/2 top-[1.375rem] h-0.5 w-full sm:top-6 ${i < current ? 'bg-encre' : 'bg-line'}`} />}
              {reachable ? (
                <Link to={`/seance/${exerciseId}/${step.id}`} className="group flex flex-col items-center rounded-xl p-1" aria-label={`Revenir à l’étape ${i + 1} : ${step.label}`}>
                  <span className="rounded-full transition-shadow group-hover:ring-4 group-hover:ring-encre-soft">{dot}</span>{label}
                </Link>
              ) : (
                <div className="flex flex-col items-center p-1" aria-current={active ? 'step' : undefined}>
                  {dot}{label}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-center text-sm font-semibold text-ink sm:hidden">Étape {current + 1} sur 4 : {STEPS[current].label}</p>
    </nav>
  );
}
