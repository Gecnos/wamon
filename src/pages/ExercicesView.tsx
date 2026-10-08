import { Link, useSearchParams } from 'react-router-dom';
import { EXERCISES, LEVEL_LABELS, type Exercise, type Level } from '../exercises';
import { CONTACT_EMAIL, mailto } from '../lib/contact';
import { PageHeader } from '../ui/PageHeader';

const FILTERS: { id: Level | 'tous'; label: string }[] = [
  { id: 'tous', label: 'Tous les niveaux' },
  { id: '2de', label: 'Seconde' },
  { id: '1re', label: 'Première' },
  { id: 'Tle', label: 'Terminale' },
];

function unknownList(ex: Exercise) {
  return ex.variants.map(v => ex.quantities[v.unknown].name.toLowerCase()).join(' ou ');
}

export default function ExercicesView() {
  const [params, setParams] = useSearchParams();
  const level = (params.get('niveau') ?? 'tous') as Level | 'tous';
  const list = level === 'tous' ? EXERCISES : EXERCISES.filter(ex => ex.levels.includes(level));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader title="Choisir un exercice">
        Chaque exercice se déroule en quatre temps : la classe calcule, vous notez sa réponse, vous faites l’expérience, puis vous comparez.
      </PageHeader>

      <div role="group" aria-label="Filtrer par niveau" className="mt-8 inline-flex flex-wrap overflow-hidden rounded-md border-2 border-ink">
        {FILTERS.map(f => (
          <button key={f.id} type="button" aria-pressed={level === f.id}
            onClick={() => setParams(f.id === 'tous' ? {} : { niveau: f.id }, { replace: true })}
            className={`min-h-11 border-ink px-4 font-bold transition-colors duration-150 not-first:border-l-2 ${level === f.id ? 'bg-ink text-white' : 'bg-surface text-ink hover:bg-sunken'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <ol className="mt-6 divide-y divide-line overflow-hidden rounded-lg border-2 border-ink bg-surface">
        {list.map(ex => (
          <li key={ex.id}>
            <Link to={`/seance/${ex.id}/enonce`} className="group grid gap-2 p-5 transition-colors hover:bg-sunken sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:p-6">
              <span className="font-bold text-mesure">{ex.levels.map(l => LEVEL_LABELS[l]).join(', ')}</span>
              <span>
                <span className="block text-xl font-bold text-ink">{ex.title}</span>
                <span className="mt-1 block text-ink-2">{ex.summary}</span>
                <span className="mt-2 block text-[0.95rem] text-ink-2">La classe calcule : {unknownList(ex)}. Environ {ex.duration}.</span>
              </span>
              <span className="inline-flex min-h-11 items-center rounded-md border-2 border-ink px-4 font-bold text-ink transition-colors group-hover:bg-signal">Préparer</span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-lg text-ink-2">
        Il vous manque un exercice&nbsp;? Écrivez-nous à <a href={mailto('Wamon : idée d’exercice')} className="font-bold text-mesure underline underline-offset-4">{CONTACT_EMAIL}</a>.
      </p>
    </div>
  );
}
