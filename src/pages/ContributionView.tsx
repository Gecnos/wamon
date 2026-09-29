import { useState } from 'react';

export default function ContributionView() {
  const [title, setTitle] = useState('Mon nouvel exercice');
  const [subject, setSubject] = useState<'chimie' | 'physique'>('chimie');
  const [level, setLevel] = useState('terminale');
  const [description, setDescription] = useState('Décrire ici la situation et la question posée aux élèves.');

  const downloadTemplate = () => {
    const id = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'nouvel-exercice';
    const module = {
      id, version: 1, titre: title, matiere: subject, niveau: [level],
      description,
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
    <div className="contribute-page page-in">
      <header className="contribute-heading"><p className="home-eyebrow">LE PROJET EST OUVERT</p><h1>Votre exercice peut devenir une expérience.</h1><p>Les enseignants connaissent les exercices qui parlent à leurs élèves. Aidez-nous à les rendre visibles.</p></header>
      <div className="contribute-layout">
        <section className="contribute-form-panel">
          <div className="contribute-panel-title"><span>01</span><div><h2>Préparer une fiche</h2><p>Décrivez l’exercice, puis téléchargez son fichier de départ.</p></div></div>
          <label>Titre de l’exercice<input value={title} onChange={e => setTitle(e.target.value)} maxLength={90} /></label>
          <div className="contribute-fields"><label>Matière<select value={subject} onChange={e => setSubject(e.target.value as 'chimie' | 'physique')}><option value="chimie">Chimie</option><option value="physique">Physique</option></select></label><label>Niveau<input value={level} onChange={e => setLevel(e.target.value)} placeholder="ex. 1ère, terminale" /></label></div>
          <label>Énoncé ou objectif<textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} /></label>
          <button className="home-button-primary contribute-download" onClick={downloadTemplate}>Télécharger le fichier modèle <span aria-hidden="true">↓</span></button>
          <p className="contribute-note">Le fichier est généré dans votre navigateur. Aucune donnée n’est envoyée.</p>
        </section>
        <aside className="contribute-steps">
          <div className="contribute-panel-title"><span>02</span><div><h2>De la fiche à la classe</h2><p>Un parcours ouvert, avec relecture pédagogique.</p></div></div>
          <ol>
            <li><i>1</i><span><strong>Compléter les données</strong><small>Renseignez les grandeurs, unités, formule et variantes dans le fichier JSON.</small></span></li>
            <li><i>2</i><span><strong>Partager au projet</strong><small>Joignez le fichier, l’énoncé d’origine et la solution détaillée à une proposition Wamon.</small></span></li>
            <li><i>3</i><span><strong>Relire et améliorer</strong><small>Les enseignants vérifient la justesse scientifique et l’adéquation au programme.</small></span></li>
          </ol>
          <div className="contribute-boundary"><strong>Un nouveau type de simulation ?</strong><p>La fiche peut être préparée sans coder. Une nouvelle animation ou un nouveau modèle physique demande ensuite une petite adaptation technique ; le module de dosage sert de référence aux développeurs bénévoles.</p></div>
          <div className="license-line"><span>CODE · MIT</span><span>CONTENUS · CC BY-SA</span></div>
        </aside>
      </div>
    </div>
  );
}
