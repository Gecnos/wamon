export default function AboutView() {
  return (
    <div className="about-wrap page-in">
      <div className="glass-card">
        <h1 className="text-2xl font-bold text-emerald" style={{ marginBottom: '1rem' }}>
          📖 Guide d'Utilisation en Classe
        </h1>
        <p className="text-muted" style={{ marginBottom: '1rem', lineHeight: 1.7 }}>
          Ce simulateur a été conçu pour les établissements scolaires fonctionnant sur ordinateur
          avec projecteur et sans connexion Internet requise.
        </p>

        <h2 className="text-lg font-bold text-cyan" style={{ marginBottom: '0.5rem' }}>
          Scénario de cours type :
        </h2>
        <ol style={{ marginLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', color: 'var(--text-muted)' }}>
          <li>Le professeur choisit la variante et saisit les données ou clique sur <strong>« Exercice au hasard »</strong>.</li>
          <li>Il projette l'écran. La classe réalise les calculs individuellement ou par groupe.</li>
          <li>Le professeur saisit le(s) résultat(s) — jusqu'à 6 groupes simultanément.</li>
          <li>Il clique <strong>« Lancer la simulation »</strong> : le panneau de contrôle paso-à-paso s'active.</li>
          <li>
            Trois modes de versement :
            <ul style={{ marginLeft: '1rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li><strong>💧 Pas à pas</strong> — goutte à goutte, 0.5 mL ou 1 mL, retour possible.</li>
              <li><strong>🌊 Flux continu</strong> — robinet ouvert / pause au moment du virage.</li>
              <li><strong>⚡ Résultat direct</strong> — verse automatiquement jusqu'au volume calculé.</li>
            </ul>
          </li>
          <li>Le virage de l'indicateur se produit au bon volume. L'écart en % est affiché si la réponse est incorrecte.</li>
        </ol>

        <div className="mode-banner banner-info" style={{ marginTop: '1.5rem' }}>
          💡 <strong>Nouveau en v0.2 :</strong> Gouttes animées avec physique réaliste,
          courbe pH en temps réel, ripple splash dans le bécher.
        </div>
      </div>
    </div>
  );
}
