import { Button } from '../../ui/Button';
import { NumberField } from '../../ui/NumberField';
import { Plus, Trash, Users } from '../../ui/icons';
import { useSeance } from './SeanceContext';
import { GROUP_COLORS, quantity, variante } from './logic';

const MAX_GROUPS = 6;

export function StepReponse() {
  const { state, update } = useSeance();
  const v = variante(state);
  const q = quantity(v.inconnue);

  const addGroup = () => update(s => ({
    groups: [...s.groups, { id: crypto.randomUUID?.() ?? String(Date.now()), name: `Groupe ${s.groups.length + 1}`, value: null }],
  }));
  const setGroup = (id: string, value: number | null) => update(s => ({ groups: s.groups.map(g => (g.id === id ? { ...g, value } : g)) }));
  const removeGroup = (id: string) => update(s => ({
    groups: s.groups.filter(g => g.id !== id).map((g, i) => ({ ...g, name: `Groupe ${i + 1}` })),
  }));

  return (
    <div className="mx-auto grid max-w-3xl gap-5">
      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-10">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">Quelle valeur la classe a-t-elle trouvée&nbsp;?</h2>
        <p className="mt-2 text-lg text-ink-2">Saisissez la réponse retenue par la classe. La correction ne s’affichera qu’après l’expérience.</p>
        <div className="mt-8">
          <NumberField size="xl" symbol={v.inconnue} label={q.name} unit={q.unite} value={state.classAnswer} onChange={classAnswer => update({ classAnswer })} min={0} max={q.max} step={q.step} placeholder="?" autoFocus={state.classAnswer === null} />
        </div>
      </section>

      <section aria-labelledby="groupes-titre" className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Users className="text-ink-2" />
            <div>
              <h3 id="groupes-titre" className="text-lg font-bold text-ink">Réponses par groupe <span className="font-normal text-ink-2">(facultatif)</span></h3>
              <p className="text-sm text-ink-2">Utile quand les groupes n’ont pas trouvé la même chose.</p>
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
                  <NumberField label={g.name} unit={q.unite} value={g.value} onChange={value => setGroup(g.id, value)} min={0} max={q.max} step={q.step} placeholder="?" />
                </div>
                <button type="button" onClick={() => removeGroup(g.id)} className="grid size-12 shrink-0 place-items-center rounded-xl text-ink-2 hover:bg-bad-soft hover:text-bad" aria-label={`Retirer ${g.name}`}><Trash /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
