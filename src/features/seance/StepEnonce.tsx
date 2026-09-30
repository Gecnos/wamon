import { useState } from 'react';
import type { Exercise } from '../../exercises';
import { findVariant } from '../../exercises';
import { useProjection } from '../../lib/projection';
import { fmt } from '../../lib/format';
import { Button } from '../../ui/Button';
import { NumberField } from '../../ui/NumberField';
import { Close, Dice, Eye } from '../../ui/icons';
import { IndicatorPicker } from '../titration/IndicatorPicker';
import { useSeance } from './SeanceContext';

/**
 * L’énoncé est présenté comme une copie d’élève (marge rouge, lignes bleues) :
 * un support que toute la classe reconnaît, lisible depuis le fond de la salle.
 */
function ProjectedStatement({ ex }: { ex: Exercise }) {
  const { state } = useSeance(ex);
  const v = findVariant(ex, state.variantId);
  const unknown = ex.quantities[v.unknown];
  return (
    <section
      aria-labelledby="enonce-titre"
      className="relative overflow-hidden rounded-2xl border border-line bg-surface bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_2.25rem,#edf1f8_2.25rem,#edf1f8_calc(2.25rem+1px))] py-8 pr-6 pl-12 shadow-[0_1px_0_#d2d9e4,0_12px_32px_-24px_rgba(19,32,58,0.35)] sm:py-10 sm:pr-10 sm:pl-20"
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-8 w-px bg-rouge/60 sm:left-14" />
      <p className="text-lg text-ink-2">{ex.context}</p>
      <h2 id="enonce-titre" className="mt-4 text-2xl font-bold leading-snug text-balance text-ink sm:text-3xl lg:text-[2.5rem] lg:leading-tight">{v.question}</h2>
      <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
        {v.given.map(key => {
          const q = ex.quantities[key];
          return (
            <div key={key}>
              <dt className="text-base text-ink-2">{q.name}</dt>
              <dd className="mt-1 flex items-baseline gap-2 whitespace-nowrap">
                <span className="font-mono text-xl text-encre">{q.symbol} =</span>
                <span className="font-mono text-3xl font-bold tabular-nums text-ink sm:text-4xl">{fmt(ex.value(state.params, key), q.digits)}</span>
                <span className="text-lg font-semibold text-ink-2">{q.unit}</span>
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-10 text-xl font-bold text-ink">
        Que vaut <span className="font-mono text-encre">{unknown.symbol}</span>&nbsp;? Donnez le résultat en {unknown.unit}.
      </p>
    </section>
  );
}

function Settings({ ex, onClose }: { ex: Exercise; onClose?: () => void }) {
  const { state, update } = useSeance(ex);
  const v = findVariant(ex, state.variantId);
  const warning = ex.warning(state.params);
  const reset = { classAnswer: null, furthest: 0 };

  const setParam = (key: string) => (value: number | null) => {
    if (value === null) return;
    update(s => ({ ...reset, params: { ...s.params, [key]: value }, groups: s.groups.map(g => ({ ...g, value: null })) }));
  };

  return (
    <section aria-labelledby="reglages-titre" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="reglages-titre" className="text-lg font-bold text-ink">Préparer l’exercice</h2>
          <p className="mt-0.5 text-[0.95rem] text-ink-2">L’énoncé se met à jour à mesure.</p>
        </div>
        {onClose && <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-xl hover:bg-sunken" aria-label="Fermer les réglages"><Close /></button>}
      </div>

      <fieldset className="mt-5 min-w-0">
        <legend className="font-semibold text-ink">Ce que la classe doit trouver</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {ex.variants.map(item => {
            const selected = item.id === v.id;
            const q = ex.quantities[item.unknown];
            return (
              <button key={item.id} type="button" aria-pressed={selected} onClick={() => update({ ...reset, variantId: item.id })}
                className={`min-h-14 rounded-xl border-2 px-3 py-2 text-left transition-colors duration-150 active:scale-[0.98] ${selected ? 'border-encre bg-encre-soft' : 'border-line hover:border-line-strong'}`}>
                <span className="block font-mono text-sm text-encre">{q.symbol}</span>
                <span className="block font-semibold leading-tight text-ink">{q.name}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4">
        {ex.paramKeys.map(key => {
          const q = ex.quantities[key];
          const secret = v.unknown === key;
          return (
            <NumberField key={key} symbol={q.symbol} label={secret ? `${q.name} (cachée aux élèves)` : q.name} unit={q.unit}
              value={state.params[key]} onChange={setParam(key)} min={q.min} max={q.max} step={q.step}
              hint={secret ? 'C’est la vraie valeur, celle que l’expérience va révéler.' : undefined} />
          );
        })}
      </div>

      {warning && <p role="alert" className="mt-4 rounded-xl bg-rouge-soft p-3 text-[0.95rem] font-semibold text-rouge">{warning}</p>}

      {ex.kind === 'titration' && (
        <div className="mt-5">
          <IndicatorPicker value={state.indicator} onChange={indicator => update({ indicator })} />
        </div>
      )}

      <Button variant="secondary" className="mt-5 w-full" onClick={() => update({ ...reset, params: ex.random() })}>
        <Dice /> Tirer d’autres valeurs
      </Button>
    </section>
  );
}

export function StepEnonce({ ex }: { ex: Exercise }) {
  const [projection] = useProjection();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // En projection, les réglages s’effacent pour laisser toute la place à l’énoncé.
  if (projection) {
    return (
      <div className="grid gap-5">
        {settingsOpen ? <Settings ex={ex} onClose={() => setSettingsOpen(false)} /> : (
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setSettingsOpen(true)}><Eye /> Modifier les données</Button>
          </div>
        )}
        <ProjectedStatement ex={ex} />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
      <ProjectedStatement ex={ex} />
      <Settings ex={ex} />
    </div>
  );
}
