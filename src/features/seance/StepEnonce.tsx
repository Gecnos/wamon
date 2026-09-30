import { useState } from 'react';
import { useProjection } from '../../lib/projection';
import { fmt } from '../../lib/format';
import { Button } from '../../ui/Button';
import { NumberField } from '../../ui/NumberField';
import { Close, Dice, Eye } from '../../ui/icons';
import { IndicatorPicker } from '../titration/IndicatorPicker';
import { useSeance } from './SeanceContext';
import { config, equivalenceVolume, projectedData, quantity, randomParams, variante, type Params } from './logic';

export const MAX_EQUIVALENCE = 45;

/** Énoncé en grand, pensé pour être lu depuis le fond de la classe. */
function ProjectedStatement() {
  const { state } = useSeance();
  const v = variante(state);
  return (
    <section aria-labelledby="enonce-titre" className="rounded-3xl border border-line bg-surface p-6 sm:p-10">
      <p className="text-sm font-bold uppercase tracking-wider text-accent">Énoncé à projeter</p>
      <h2 id="enonce-titre" className="mt-3 text-2xl font-bold leading-snug text-ink sm:text-3xl lg:text-4xl">{v.description}</h2>
      <p className="mt-4 text-lg text-ink-2">
        On dose une solution d’acide chlorhydrique par une solution d’hydroxyde de sodium (soude).
      </p>
      <dl className="mt-8 grid gap-3 sm:grid-cols-3">
        {projectedData(state).map(d => (
          <div key={d.key} className="rounded-2xl bg-sunken p-4 sm:p-5">
            <dt className="text-base font-semibold text-ink-2">{d.name}</dt>
            <dd className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-lg text-brand">{d.key}&nbsp;=</span>
              <span className="text-3xl font-bold tabular-nums text-ink sm:text-4xl">{fmt(d.value, 3)}</span>
              <span className="text-lg font-semibold text-ink-2">{d.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 border-t border-line pt-5 text-lg font-semibold text-ink">
        Question : que vaut <span className="font-mono text-brand">{v.inconnue}</span> ? Donnez le résultat en {quantity(v.inconnue).unite}.
      </p>
    </section>
  );
}

function Settings({ onClose }: { onClose?: () => void }) {
  const { state, update } = useSeance();
  const v = variante(state);
  const setParam = (key: keyof Params) => (value: number | null) => {
    if (value === null) return;
    update(s => ({ params: { ...s.params, [key]: value }, classAnswer: null, groups: s.groups.map(g => ({ ...g, value: null })), furthest: 0 }));
  };
  const ve = equivalenceVolume(state.params);
  const fields: (keyof Params)[] = v.inconnue === 'Ve' ? ['Ca', 'Va', 'Cb'] : ['Va', 'Cb', 'Ca'];

  return (
    <section aria-labelledby="reglages-titre" className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="reglages-titre" className="text-lg font-bold text-ink">Préparer l’exercice</h2>
          <p className="mt-0.5 text-sm text-ink-2">L’énoncé se met à jour à mesure. En mode projection, ce panneau est masqué.</p>
        </div>
        {onClose && <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-xl hover:bg-sunken" aria-label="Fermer les réglages"><Close /></button>}
      </div>

      <fieldset className="mt-5 min-w-0">
        <legend className="text-[0.95rem] font-semibold text-ink">Ce que la classe doit trouver</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {config.variantes.map(item => {
            const selected = item.id === v.id;
            return (
              <button key={item.id} type="button" aria-pressed={selected} onClick={() => update({ varianteId: item.id, classAnswer: null, furthest: 0 })}
                className={`min-h-14 rounded-xl border-2 px-3 py-2 text-left transition-colors ${selected ? 'border-brand bg-brand-soft' : 'border-line hover:border-line-strong'}`}>
                <span className="block font-mono text-sm text-brand">{item.inconnue}</span>
                <span className="block font-semibold leading-tight text-ink">{quantity(item.inconnue).name}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4">
        {fields.map(key => {
          const q = quantity(key);
          const secret = v.inconnue === key;
          return (
            <NumberField key={key} symbol={key} label={secret ? `${q.name} (réelle, cachée)` : q.name} unit={q.unite} value={state.params[key]} onChange={setParam(key)} min={q.min} max={q.max} step={q.step}
              hint={secret ? `Fixe le vrai résultat. Les élèves verront seulement Ve = ${fmt(ve, 2)} mL.` : undefined} />
          );
        })}
      </div>

      {ve > MAX_EQUIVALENCE && (
        <p role="alert" className="mt-4 rounded-xl bg-bad-soft p-3 text-sm font-semibold text-bad">
          Avec ces données, l’équivalence est à {fmt(ve, 1)} mL : c’est plus que la burette (50 mL). Diminuez Ca ou Va, ou augmentez Cb.
        </p>
      )}

      <div className="mt-5">
        <IndicatorPicker value={state.indicator} onChange={indicator => update({ indicator })} />
      </div>

      <Button variant="secondary" className="mt-5 w-full" onClick={() => update({ params: randomParams(), classAnswer: null, furthest: 0 })}>
        <Dice /> Tirer d’autres valeurs
      </Button>
    </section>
  );
}

export function StepEnonce() {
  const [projection] = useProjection();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // En projection, les réglages s’effacent pour laisser toute la place à l’énoncé.
  if (projection) {
    return (
      <div className="grid gap-5">
        {settingsOpen ? <Settings onClose={() => setSettingsOpen(false)} /> : (
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setSettingsOpen(true)}><Eye /> Modifier les données</Button>
          </div>
        )}
        <ProjectedStatement />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <ProjectedStatement />
      <Settings />
    </div>
  );
}
