import { LinkButton } from '../ui/Button';
import { ArrowRight, Projector } from '../ui/icons';
import { STEPS } from '../features/seance/logic';

const DETAILS = [
  'Choisissez un exercice, puis ce que la classe doit trouver. Réglez les données ou tirez-les au hasard. Projetez l’énoncé et laissez un temps de recherche.',
  'Saisissez la valeur retenue par la classe. Si les groupes ne sont pas d’accord, ajoutez leurs réponses : elles seront toutes comparées à la fin.',
  'Manipulez avec la valeur trouvée : versez la soude jusqu’au volume prédit (dosage), ou suivez le protocole pas à pas (dilution, dissolution). La classe voit si la couleur change au bon moment ou si la teinte correspond au témoin.',
  'Wamon affiche le verdict, l’écart de chaque groupe et la position de chaque réponse. La correction ne s’ouvre que si vous la demandez.',
];

export default function GuideView() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Mener une séance avec Wamon</h1>
      <p className="mt-3 text-lg text-ink-2">Wamon est conçu pour un ordinateur relié à un vidéoprojecteur, sans connexion Internet obligatoire. Une séance prend 20 à 40 minutes selon le temps de recherche laissé aux élèves.</p>

      <ol className="mt-8 grid gap-4">
        {STEPS.map((step, i) => (
          <li key={step.id} className="flex gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-encre text-xl font-bold text-white">{i + 1}</span>
            <div>
              <h2 className="text-xl font-bold text-ink">{step.label}</h2>
              <p className="mt-1 text-lg text-ink-2">{DETAILS[i]}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-8 rounded-2xl bg-ink p-6 text-white sm:p-8">
        <Projector size={32} />
        <h2 className="mt-3 text-2xl font-bold">Avant de projeter</h2>
        <ul className="mt-3 grid list-disc gap-2 pl-5 text-lg text-white/90">
          <li>Cliquez sur <strong className="text-white">Projeter</strong> en haut à droite : textes et boutons grossissent, les réglages s’effacent.</li>
          <li>Utilisez le plein écran du navigateur (touche F11) pour gagner de la place.</li>
          <li>Les couleurs de l’indicateur dépendent du projecteur : faites un essai dans la salle avant le cours.</li>
          <li>Le bouton « retour » du navigateur ramène à l’étape précédente sans perdre vos données.</li>
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <h2 className="text-xl font-bold text-ink">Et pour les élèves ?</h2>
        <p className="mt-2 text-lg text-ink-2">Le <strong className="text-ink">labo libre</strong> fonctionne aussi sur téléphone et tablette. Chaque élève choisit ses solutions et son indicateur, verse goutte à goutte et relève ses propres mesures pour construire la courbe.</p>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <LinkButton to="/exercices" size="lg">Préparer une séance <ArrowRight /></LinkButton>
        <LinkButton to="/labo" size="lg" variant="secondary">Ouvrir le labo libre</LinkButton>
      </div>
    </div>
  );
}
