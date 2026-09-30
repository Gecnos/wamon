import { useId, useState, type ReactNode } from 'react';
import { Button } from '../ui/Button';

const field = 'mt-2 block w-full rounded-xl border-2 border-line bg-surface px-3 py-2.5 text-lg text-ink outline-none focus:border-brand';

function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return <div><label htmlFor={id} className="font-semibold text-ink">{label}</label>{children(id)}</div>;
}

export default function ContributionView() {
  const [title, setTitle] = useState('Mon nouvel exercice');
  const [subject, setSubject] = useState<'chimie' | 'physique'>('chimie');
  const [level, setLevel] = useState('terminale');
  const [description, setDescription] = useState('');

  const downloadTemplate = () => {
    const id = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'nouvel-exercice';
    const module = {
      id, version: 1, titre: title, matiere: subject, niveau: [level],
      description: description || 'Décrire ici la situation et la question posée aux élèves.',
      grandeurs: {
        A: { label: 'Grandeur connue A', unite: 'unité', min: 0, max: 100, step: 1, default: 10 },
        B: { label: 'Grandeur connue B', unite: 'unité', min: 0, max: 100, step: 1, default: 5 },
        X: { label: 'Résultat à trouver X', unite: 'unité', min: 0, max: 100, step: 1, default: 2 },
      },
      variantes: [{ id: 'A', nom: 'Calculer X', inconnue: 'X', donnees: ['A', 'B'], formule: 'A / B', description: 'Remplacer cette consigne et cette formule par celles de votre exercice.' }],
      vues: [], tolerance: 0.02, modele: 'a-definir',
    };
    const blob = new Blob([JSON.stringify(module, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${id}.json`;
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <p className="text-sm font-bold uppercase tracking-wider text-accent">Contribuer</p>
      <h1 className="mt-1 max-w-3xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Votre exercice peut devenir une expérience</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-2">Vous connaissez les exercices qui parlent à vos élèves. Décrivez-en un : nous l’aiderons à devenir une séance Wamon.</p>

      <div className="mt-8 grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section aria-labelledby="fiche" className="grid gap-5 rounded-3xl border border-line bg-surface p-5 sm:p-8">
          <h2 id="fiche" className="text-xl font-bold text-ink">1. Préparer la fiche</h2>
          <Field label="Titre de l’exercice">{id => <input id={id} className={field} value={title} onChange={e => setTitle(e.target.value)} maxLength={90} />}</Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Matière">{id => <select id={id} className={field} value={subject} onChange={e => setSubject(e.target.value as 'chimie' | 'physique')}><option value="chimie">Chimie</option><option value="physique">Physique</option></select>}</Field>
            <Field label="Niveau">{id => <input id={id} className={field} value={level} onChange={e => setLevel(e.target.value)} placeholder="ex. 1re, terminale" />}</Field>
          </div>
          <Field label="Énoncé ou objectif">{id => <textarea id={id} className={field} rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez la situation et la question posée aux élèves." />}</Field>
          <Button size="lg" onClick={downloadTemplate}>Télécharger le fichier modèle</Button>
          <p className="text-sm text-ink-2">Le fichier est créé dans votre navigateur. Rien n’est envoyé.</p>
        </section>

        <section aria-labelledby="parcours" className="rounded-3xl border border-line bg-surface p-5 sm:p-8">
          <h2 id="parcours" className="text-xl font-bold text-ink">2. De la fiche à la classe</h2>
          <ol className="mt-5 grid gap-5">
            {[
              ['Compléter les données', 'Renseignez grandeurs, unités, formule et variantes dans le fichier JSON.'],
              ['Partager au projet', 'Joignez le fichier, l’énoncé d’origine et la solution détaillée à une proposition Wamon.'],
              ['Relire et améliorer', 'Des enseignants vérifient la justesse scientifique et l’adéquation au programme.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand-strong">{i + 1}</span>
                <div><p className="font-bold text-ink">{t}</p><p className="text-ink-2">{d}</p></div>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-2xl bg-sunken p-4 text-ink-2">
            <p className="font-semibold text-ink">Une nouvelle animation ?</p>
            <p className="mt-1">La fiche se prépare sans coder. Un nouveau modèle ou une nouvelle animation demande ensuite une adaptation technique ; le dosage sert de modèle aux développeurs bénévoles.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
