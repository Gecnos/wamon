import type { Exercise } from '../../exercises';
import { findVariant } from '../../exercises';
import { Button } from '../../ui/Button';
import { NumberField } from '../../ui/NumberField';
import { Plus, Trash, Users } from '../../ui/icons';
import { useSeance } from './SeanceContext';
import { GROUP_COLORS } from './logic';

const MAX_GROUPS = 6;

export function StepReponse({ ex }: { ex: Exercise }) {
  const { state, update } = useSeance(ex);
  const v = findVariant(ex, state.variantId);
  const q = ex.quantities[v.unknown];

  const addGroup = () => update(s => ({
    groups: [...s.groups, { id: crypto.randomUUID?.() ?? String(Date.now()), name: `Groupe ${s.groups.length + 1}`, value: null }],
  }));
  const setGroup = (id: string, value: number | null) => update(s => ({ groups: s.groups.map(g => (g.id === id ? { ...g, value } : g)) }));
  const removeGroup = (id: string) => update(s => ({
    groups: s.groups.filter(g => g.id !== id).map((g, i) => ({ ...g, name: `Groupe ${i + 1}` })),
  }));

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <section className="rounded-lg border border-line bg-surface p-6 sm:p-10">
        <NumberField size="xl" symbol={q.symbol} label={q.name} unit={q.unit} value={state.classAnswer} onChange={classAnswer => update({ classAnswer })}
          min={0} max={q.max} step={q.step} placeholder="?" autoFocus={state.classAnswer === null}
          hint="La correction ne s’affichera qu’après l’expérience." />
      </section>

      <section aria-labelledby="groupes-titre" className="rounded-lg border border-dashed border-line-strong p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Users className="shrink-0 text-ink-2" />
            <div>
              <h3 id="groupes-titre" className="text-lg font-bold text-ink">Les groupes ne sont pas d’accord&nbsp;?</h3>
              <p className="text-[0.95rem] text-ink-2">Notez leurs réponses : elles seront toutes comparées à la fin.</p>
            </div>
          </div>
          <Button variant="secondary" onClick={addGroup} disabled={state.groups.length >= MAX_GROUPS}><Plus /> Ajouter un groupe</Button>
        </div>
        {state.groups.length > 0 && (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {state.groups.map((g, i) => (
              <li key={g.id} className="flex items-end gap-2">
                <span className="mb-4 size-3 shrink-0 rounded-full" style={{ background: GROUP_COLORS[i % GROUP_COLORS.length] }} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <NumberField label={g.name} unit={q.unit} value={g.value} onChange={value => setGroup(g.id, value)} min={0} max={q.max} step={q.step} placeholder="?" />
                </div>
                <button type="button" onClick={() => removeGroup(g.id)} className="grid size-12 shrink-0 place-items-center rounded-md text-ink-2 transition-colors hover:bg-rouge-soft hover:text-rouge active:scale-95" aria-label={`Retirer ${g.name}`}><Trash /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
