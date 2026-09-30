import { Link } from 'react-router-dom';
import { Check } from '../../ui/icons';
import { STEPS } from './logic';

interface StepperProps {
  current: number;
  furthest: number;
}

export function Stepper({ current, furthest }: StepperProps) {
  return (
    <nav aria-label="Étapes de la séance">
      {/* Mobile : une ligne de progression et le nom de l’étape. */}
      <div className="sm:hidden">
        <p className="text-sm font-semibold text-ink-2">Étape {current + 1} sur {STEPS.length}</p>
        <div className="mt-2 flex gap-1.5">
          {STEPS.map((step, i) => <span key={step.id} className={`h-1.5 flex-1 rounded-full ${i <= current ? 'bg-brand' : 'bg-line'}`} />)}
        </div>
      </div>

      <ol className="hidden gap-2 sm:grid sm:grid-cols-4">
        {STEPS.map((step, i) => {
          const active = i === current;
          const done = i < current;
          const reachable = i <= furthest && !active;
          const content = (
            <>
              <span className={`grid size-9 shrink-0 place-items-center rounded-full text-base font-bold ${active ? 'bg-white text-brand-strong' : done ? 'bg-brand text-white' : 'border-2 border-line-strong text-ink-2'}`}>
                {done ? <Check size={18} /> : i + 1}
              </span>
              <span className="min-w-0 font-semibold leading-tight">{step.label}</span>
            </>
          );
          const cls = `flex min-h-16 items-center gap-3 rounded-2xl border-2 px-3 py-2 transition-colors ${active ? 'border-brand bg-brand text-white' : done ? 'border-brand/30 bg-brand-soft text-brand-strong' : 'border-line bg-surface text-ink-2'}`;
          return (
            <li key={step.id}>
              {reachable
                ? <Link to={`/seance/${step.id}`} className={`${cls} hover:border-brand`}>{content}</Link>
                : <div className={cls} aria-current={active ? 'step' : undefined}>{content}</div>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
