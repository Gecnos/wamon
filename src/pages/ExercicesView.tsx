import { Link, useSearchParams } from 'react-router-dom';
import { EXERCISES, LEVEL_LABELS, type Exercise, type Level } from '../exercises';
import { ArrowRight } from '../ui/icons';

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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Choisir un exercice</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">Chaque exercice se déroule en quatre temps : la classe calcule, vous notez sa réponse, vous faites l’expérience, puis vous comparez.</p>

      <div role="group" aria-label="Filtrer par niveau" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button key={f.id} type="button" aria-pressed={level === f.id}
            onClick={() => setParams(f.id === 'tous' ? {} : { niveau: f.id }, { replace: true })}
            className={`min-h-11 rounded-full border-2 px-4 font-semibold transition-colors duration-150 active:scale-[0.97] ${level === f.id ? 'border-encre bg-encre text-white' : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <ol className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {list.map(ex => (
          <li key={ex.id}>
            <Link to={`/seance/${ex.id}/enonce`} className="group grid gap-2 p-5 transition-colors hover:bg-paper sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:p-6">
              <span className="text-[0.95rem] font-semibold text-encre">{ex.levels.map(l => LEVEL_LABELS[l]).join(', ')}</span>
              <span>
                <span className="block text-xl font-bold text-ink">{ex.title}</span>
                <span className="mt-1 block text-ink-2">{ex.summary}</span>
                <span className="mt-2 block text-[0.95rem] text-ink-2">La classe calcule : {unknownList(ex)}. Environ {ex.duration}.</span>
              </span>
              <span className="inline-flex items-center gap-2 font-bold text-encre">
                Préparer <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-lg text-ink-2">
        Il vous manque un exercice&nbsp;? <Link to="/contribuer" className="font-bold text-encre underline underline-offset-4">Décrivez-le-nous</Link>, sans rien installer ni programmer.
      </p>
    </div>
  );
}
