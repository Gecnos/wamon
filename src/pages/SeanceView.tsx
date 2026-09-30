import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button, LinkButton } from '../ui/Button';
import { ArrowLeft, ArrowRight, Dice, Reset } from '../ui/icons';
import { useSeance } from '../features/seance/SeanceContext';
import { ActionBar } from '../features/seance/ActionBar';
import { Stepper } from '../features/seance/Stepper';
import { MAX_EQUIVALENCE, StepEnonce } from '../features/seance/StepEnonce';
import { StepReponse } from '../features/seance/StepReponse';
import { StepExperience } from '../features/seance/StepExperience';
import { StepComparer } from '../features/seance/StepComparer';
import { config, equivalenceVolume, randomParams, STEPS, stepIndex } from '../features/seance/logic';

const HEADINGS = [
  { title: 'Faites calculer la classe', lead: 'Projetez l’énoncé et laissez les élèves chercher. Ajustez les données dans « Préparer l’exercice » si besoin.' },
  { title: 'Notez la réponse de la classe', lead: 'Une seule valeur suffit. Ajoutez les groupes si vous voulez comparer leurs résultats.' },
  { title: 'Réalisez le dosage devant la classe', lead: 'Versez jusqu’à la valeur trouvée, puis observez : l’indicateur change-t-il de couleur à ce moment-là ?' },
  { title: 'Comparez et discutez', lead: 'Le modèle donne la valeur exacte. Les écarts sont une occasion de revenir sur le raisonnement.' },
];

export default function SeanceView() {
  const { etape } = useParams();
  const navigate = useNavigate();
  const { state, update, restart } = useSeance();
  const index = stepIndex(etape);

  // Mémorise l’étape la plus avancée pour autoriser les retours en arrière depuis l’indicateur d’étapes.
  useEffect(() => {
    if (index > state.furthest) update({ furthest: index });
  }, [index, state.furthest, update]);

  if (index < 0) return <Navigate to="/seance/enonce" replace />;
  // On ne peut pas lancer l’expérience sans réponse de la classe.
  if (index >= 2 && state.classAnswer === null) return <Navigate to="/seance/reponse" replace />;

  const go = (i: number) => navigate(`/seance/${STEPS[i].id}`);
  const heading = HEADINGS[index];
  const back = index > 0
    ? <Button variant="ghost" onClick={() => go(index - 1)} className="shrink-0" aria-label="Étape précédente"><ArrowLeft /><span className="hidden sm:inline">Précédent</span></Button>
    : null;

  let action;
  if (index === 0) {
    const tooLarge = equivalenceVolume(state.params) > MAX_EQUIVALENCE;
    action = <ActionBar back={back} hint="Quand la classe a trouvé un résultat, passez à la saisie."><Button size="lg" className="w-full md:w-auto" onClick={() => go(1)} disabled={tooLarge}>La classe a une réponse <ArrowRight /></Button></ActionBar>;
  } else if (index === 1) {
    action = <ActionBar back={back} hint={state.classAnswer === null ? 'Saisissez d’abord la valeur trouvée par la classe.' : 'La burette et le bécher sont prêts.'}><Button size="lg" className="w-full md:w-auto" onClick={() => go(2)} disabled={state.classAnswer === null}>Lancer l’expérience <ArrowRight /></Button></ActionBar>;
  } else if (index === 2) {
    action = <ActionBar back={back} hint="Une fois le virage observé, affichez le bilan."><Button size="lg" className="w-full md:w-auto" onClick={() => go(3)}>Voir le bilan <ArrowRight /></Button></ActionBar>;
  } else {
    action = (
      <ActionBar back={back}>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Button variant="secondary" size="lg" onClick={() => { restart(); update({ params: randomParams() }); go(0); }}><Dice /> Nouvel exercice</Button>
          <Button size="lg" onClick={() => { restart(); go(0); }}><Reset /> Rejouer ces données</Button>
        </div>
      </ActionBar>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-2 projection:hidden">
        <p><Link to="/" className="hover:text-ink hover:underline">Accueil</Link> <span aria-hidden="true">/</span> Séance guidée <span aria-hidden="true">/</span> <span className="font-semibold text-ink">{config.titre}</span></p>
        {index > 0 && <LinkButton to="/guide" variant="ghost" className="min-h-9 px-2 text-sm">Comment ça marche ?</LinkButton>}
      </div>

      <div className="mt-4">
        <Stepper current={index} furthest={Math.max(state.furthest, index)} />
      </div>

      <header className="mt-6 mb-5">
        <p className="text-sm font-bold uppercase tracking-wider text-accent">Étape {index + 1} · {STEPS[index].label}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{heading.title}</h1>
        <p className="mt-2 max-w-3xl text-lg text-ink-2 projection:hidden">{heading.lead}</p>
      </header>

      <div key={index} className="motion-safe:animate-fade-in">
        {index === 0 && <StepEnonce />}
        {index === 1 && <StepReponse />}
        {index === 2 && <StepExperience />}
        {index === 3 && <StepComparer />}
      </div>

      {action}
    </div>
  );
}
