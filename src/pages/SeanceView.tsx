import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_EXERCISE, findExercise, LEVEL_LABELS, type Exercise } from '../exercises';
import { Button } from '../ui/Button';
import { ArrowLeft, ArrowRight, Dice, Reset } from '../ui/icons';
import { useSeance } from '../features/seance/SeanceContext';
import { ActionBar } from '../features/seance/ActionBar';
import { Stepper } from '../features/seance/Stepper';
import { StepEnonce } from '../features/seance/StepEnonce';
import { StepReponse } from '../features/seance/StepReponse';
import { StepExperience } from '../features/seance/StepExperience';
import { StepComparer } from '../features/seance/StepComparer';
import { STEPS, stepIndex } from '../features/seance/logic';

const HEADINGS = [
  { title: 'Faites calculer la classe', lead: 'Projetez l’énoncé et laissez les élèves chercher. Ajustez les données dans « Préparer l’exercice » si besoin.' },
  { title: 'Notez la réponse de la classe', lead: 'Une seule valeur suffit. Ajoutez les groupes si vous voulez comparer leurs résultats.' },
  { title: 'Faites l’expérience devant la classe', lead: 'Manipulez avec la valeur trouvée, puis observez : le résultat de l’expérience donne-t-il raison à la classe ?' },
  { title: 'Comparez et discutez', lead: 'Le modèle donne la valeur exacte. Les écarts sont une occasion de revenir sur le raisonnement.' },
];

/** Anciennes adresses : /seance/enonce → /seance/<exercice par défaut>/enonce. */
export function SeanceRedirect() {
  const { exo } = useParams();
  if (exo && findExercise(exo)) return <Navigate to={`/seance/${exo}/enonce`} replace />;
  if (exo && stepIndex(exo) >= 0) return <Navigate to={`/seance/${DEFAULT_EXERCISE}/${exo}`} replace />;
  return <Navigate to="/exercices" replace />;
}

export default function SeanceView() {
  const { exo, etape } = useParams();
  const ex = findExercise(exo);
  if (!ex) return <Navigate to="/exercices" replace />;
  return <Seance ex={ex} etape={etape} />;
}

function Seance({ ex, etape }: { ex: Exercise; etape: string | undefined }) {
  const navigate = useNavigate();
  const { state, update, restart } = useSeance(ex);
  const index = stepIndex(etape);

  // Mémorise l’étape la plus avancée pour autoriser les retours depuis la frise.
  useEffect(() => {
    if (index > state.furthest) update({ furthest: index });
  }, [index, state.furthest, update]);

  if (index < 0) return <Navigate to={`/seance/${ex.id}/enonce`} replace />;
  // On ne peut pas lancer l’expérience sans réponse de la classe.
  if (index >= 2 && state.classAnswer === null) return <Navigate to={`/seance/${ex.id}/reponse`} replace />;

  const go = (i: number) => navigate(`/seance/${ex.id}/${STEPS[i].id}`);
  const heading = HEADINGS[index];
  const back = index > 0
    ? <Button variant="ghost" onClick={() => go(index - 1)} className="shrink-0" aria-label="Étape précédente"><ArrowLeft /><span className="hidden sm:inline">Précédent</span></Button>
    : null;

  let action;
  if (index === 0) {
    const blocked = ex.warning(state.params) !== null;
    action = <ActionBar back={back} hint="Quand la classe a trouvé un résultat, passez à la saisie."><Button size="lg" className="w-full md:w-auto" onClick={() => go(1)} disabled={blocked}>La classe a une réponse <ArrowRight /></Button></ActionBar>;
  } else if (index === 1) {
    action = <ActionBar back={back} hint={state.classAnswer === null ? 'Saisissez d’abord la valeur trouvée par la classe.' : 'Le matériel est prêt.'}><Button size="lg" className="w-full md:w-auto" onClick={() => go(2)} disabled={state.classAnswer === null}>Lancer l’expérience <ArrowRight /></Button></ActionBar>;
  } else if (index === 2) {
    action = <ActionBar back={back} hint="Une fois le résultat observé, affichez le bilan."><Button size="lg" className="w-full md:w-auto" onClick={() => go(3)}>Voir le bilan <ArrowRight /></Button></ActionBar>;
  } else {
    action = (
      <ActionBar back={back}>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Button variant="secondary" size="lg" onClick={() => { restart(); update({ params: ex.random() }); go(0); }}><Dice /> Nouvelles données</Button>
          <Button size="lg" onClick={() => { restart(); go(0); }}><Reset /> Rejouer ces données</Button>
        </div>
      </ActionBar>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="projection:hidden">
        <Link to="/exercices" className="inline-flex min-h-11 items-center gap-2 text-[0.95rem] font-semibold text-ink-2 hover:text-ink"><ArrowLeft size={18} /> Tous les exercices</Link>
        <p className="mt-2 text-[0.95rem] text-ink-2">{ex.levels.map(l => LEVEL_LABELS[l]).join(', ')}, environ {ex.duration}</p>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{ex.title}</h1>
      </div>

      <div className="mt-6 rounded-2xl bg-surface px-2 py-4 sm:px-6">
        <Stepper exerciseId={ex.id} current={index} furthest={Math.max(state.furthest, index)} />
      </div>

      <header className="mt-8 mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-balance text-ink sm:text-4xl">{heading.title}</h2>
        <p className="mt-2 max-w-3xl text-lg text-ink-2 projection:hidden">{heading.lead}</p>
      </header>

      <div key={`${ex.id}-${index}`} className="motion-safe:animate-enter">
        {index === 0 && <StepEnonce ex={ex} />}
        {index === 1 && <StepReponse ex={ex} />}
        {index === 2 && <StepExperience ex={ex} />}
        {index === 3 && <StepComparer ex={ex} />}
      </div>

      {action}
    </div>
  );
}
