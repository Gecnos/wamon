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
 * L’énoncé est projeté comme une fiche de TP : le contexte en bandeau, la
 * question en grand, les données en grille, lisible depuis le fond de la salle.
 */
function ProjectedStatement({ ex }: { ex: Exercise }) {
  const { state } = useSeance(ex);
  const v = findVariant(ex, state.variantId);
  const unknown = ex.quantities[v.unknown];
  return (
    <section aria-labelledby="enonce-titre" className="overflow-hidden rounded-lg border-2 border-ink bg-surface">
      <p className="border-b-2 border-ink bg-sunken px-5 py-3 text-lg text-ink-2 sm:px-8">{ex.context}</p>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <h2 id="enonce-titre" className="text-2xl font-bold leading-snug text-balance text-ink sm:text-3xl lg:text-[2.25rem] lg:leading-tight">{v.question}</h2>
        <dl className="mt-8 flex flex-wrap gap-3">
          {v.given.map(key => {
            const q = ex.quantities[key];
            return (
              <div key={key} className="min-w-[12rem] flex-1 rounded-md border border-line p-4 sm:p-5">
                <dt className="text-base text-ink-2">{q.name}</dt>
                <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 whitespace-nowrap">
                  <span className="font-mono text-xl text-mesure">{q.symbol} =</span>
                  <span className="font-mono text-3xl font-bold tabular-nums text-ink sm:text-4xl">{fmt(ex.value(state.params, key), q.digits)}</span>
                  <span className="text-lg font-semibold text-ink-2">{q.unit}</span>
                </dd>
              </div>
            );
          })}
        </dl>
        <p className="mt-8 flex flex-wrap items-baseline gap-x-3 border-t-2 border-ink pt-6 text-xl font-bold text-ink sm:text-2xl">
          <span>Que vaut</span>
          <span className="rounded-md bg-signal px-2.5 py-0.5 font-mono">{unknown.symbol}</span>
          <span>? {unknown.unit ? `Donnez le résultat en ${unknown.unit}.` : 'Donnez le résultat sans unité.'}</span>
        </p>
      </div>
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
    <section aria-labelledby="reglages-titre" className="rounded-lg border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="reglages-titre" className="text-lg font-bold text-ink">Préparer l’exercice</h2>
          <p className="mt-0.5 text-[0.95rem] text-ink-2">L’énoncé se met à jour à mesure.</p>
        </div>
        {onClose && <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-md hover:bg-sunken" aria-label="Fermer les réglages"><Close /></button>}
      </div>

      <fieldset className="mt-5 min-w-0">
        <legend className="font-semibold text-ink">Ce que la classe doit trouver</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {ex.variants.map(item => {
            const selected = item.id === v.id;
            const q = ex.quantities[item.unknown];
            return (
              <button key={item.id} type="button" aria-pressed={selected} onClick={() => update({ ...reset, variantId: item.id })}
                className={`min-h-14 rounded-md border-2 px-3 py-2 text-left transition-colors duration-150 active:scale-[0.98] ${selected ? 'border-ink bg-signal-soft' : 'border-line hover:border-line-strong'}`}>
                <span className="block font-mono text-sm text-mesure">{q.symbol}</span>
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

      {warning && <p role="alert" className="mt-4 rounded-md bg-rouge-soft p-3 text-[0.95rem] font-semibold text-rouge">{warning}</p>}

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
