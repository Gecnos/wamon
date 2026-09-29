import type { AppView } from '../App';

interface LandingProps {
  onStart: (view: AppView) => void;
}

function LabIllustration() {
  return (
    <div className="home-lab" aria-label="Illustration d’un dosage acido-basique">
      <div className="lab-topline"><span className="lab-live-dot" /> TP DE CHIMIE · EN DIRECT</div>
      <svg className="lab-svg" viewBox="0 0 520 340" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="solution" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#efaa4b" stopOpacity=".35"/><stop offset="1" stopColor="#db7848" stopOpacity=".78"/></linearGradient>
          <linearGradient id="glass" x1="0" x2="1"><stop stopColor="#fff" stopOpacity=".12"/><stop offset=".5" stopColor="#fff" stopOpacity=".52"/><stop offset="1" stopColor="#fff" stopOpacity=".08"/></linearGradient>
        </defs>
        <path d="M113 40h294M373 40v32M367 72h12M373 72v142" fill="none" stroke="#74877e" strokeWidth="5" strokeLinecap="round"/>
        <path d="M373 214v13" stroke="#d9e5da" strokeWidth="3" />
        <path className="lab-drop" d="M373 239c-8 12-8 17 0 21 8-4 8-9 0-21Z" fill="#e69a46"/>
        <path d="M350 88h46M351 89v104c0 6 5 10 11 10h24c6 0 11-4 11-10V89" fill="url(#glass)" stroke="#d9e5da" strokeWidth="3"/>
        <path d="M356 115h36M356 133h22M356 151h36M356 169h22" stroke="#d9e5da" strokeWidth="2" opacity=".8"/>
        <path d="M233 170h54v54l57 83c5 8-1 17-10 17H132c-9 0-15-9-10-17l57-83v-54h54Z" fill="url(#glass)" stroke="#d9e5da" strokeWidth="3"/>
        <path d="M162 262h152l28 42c3 5 0 10-6 10H137c-6 0-9-5-6-10l31-42Z" fill="url(#solution)"/>
        <path d="M214 171h92M184 228h98" stroke="#d9e5da" strokeWidth="3" strokeLinecap="round"/>
        <path d="M111 327h303" stroke="#74877e" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="188" cy="276" r="4" fill="#fff4d6" opacity=".8"/><circle cx="245" cy="294" r="3" fill="#fff4d6" opacity=".8"/><circle cx="286" cy="279" r="5" fill="#fff4d6" opacity=".65"/>
        <text x="392" y="131" fill="#dce8dd" fontSize="12" fontFamily="monospace">NaOH</text>
        <text x="175" y="300" fill="#fff4d6" fontSize="12" fontFamily="monospace">HCl + indicateur</text>
      </svg>
      <div className="lab-caption"><span>Volume versé</span><strong>14,8 mL</strong><span className="lab-caption-divider"/><span>Virage de l’indicateur</span><i className="lab-color-dot" /></div>
    </div>
  );
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="home-page">
      <header className="home-nav">
        <a className="home-brand" href="#accueil" aria-label="Wamon, accueil"><span className="brand-mark">W</span><span>Wamon<small>Le labo dans la classe</small></span></a>
        <nav aria-label="Navigation du site">
          <button onClick={() => onStart('simulation')}>Les simulations</button>
          <button onClick={() => onStart('catalog')}>Le matériel</button>
          <button onClick={() => onStart('contribute')}>Contribuer</button>
        </nav>
        <button className="home-nav-cta" onClick={() => onStart('simulation')}>Ouvrir le labo <span aria-hidden="true">↗</span></button>
      </header>

      <main id="accueil">
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-eyebrow"><span /> PHYSIQUE-CHIMIE · SECONDAIRE</p>
            <h1>La science se comprend <em>en la voyant.</em></h1>
            <p className="home-intro">Wamon transforme les exercices de physique-chimie en expériences visibles, à faire ensemble au tableau — même sans laboratoire ni connexion Internet.</p>
            <div className="home-actions">
              <button className="home-button-primary" onClick={() => onStart('simulation')}>Lancer une expérience <span aria-hidden="true">→</span></button>
              <button className="home-button-link" onClick={() => onStart('about')}>Découvrir comment ça marche <span aria-hidden="true">↓</span></button>
            </div>
            <div className="home-proof"><span className="proof-icon">⌁</span><span><strong>Gratuit · Libre · Hors ligne</strong><small>Conçu pour les réalités de la classe</small></span></div>
          </div>
          <LabIllustration />
          <span className="home-index">01 — APPRENDRE EN EXPÉRIMENTANT</span>
        </section>

        <section className="home-topics" aria-labelledby="topics-title">
          <div className="section-heading"><div><p className="home-eyebrow">LE LABORATOIRE VIRTUEL</p><h2 id="topics-title">Choisir un terrain d’expérience</h2></div><p>Des exercices du programme, pensés pour être projetés et discutés en classe.</p></div>
          <div className="topic-list">
            <button className="topic-row topic-ready" onClick={() => onStart('simulation')}>
              <span className="topic-number">01</span><span className="topic-icon topic-chem">✳</span><span className="topic-title"><strong>Chimie</strong><small>Dosages, réactions et transformations</small></span><span className="topic-status"><i /> 1 simulation disponible</span><span className="topic-arrow">↗</span>
            </button>
            <div className="topic-row topic-soon"><span className="topic-number">02</span><span className="topic-icon topic-physics">⌁</span><span className="topic-title"><strong>Physique</strong><small>Électricité, mécanique et optique</small></span><span className="topic-status">En préparation</span><span className="topic-arrow">↗</span></div>
          </div>
          <div className="home-bottom-links"><button onClick={() => onStart('catalog')}>Explorer le matériel de laboratoire <span>→</span></button><button onClick={() => onStart('contribute')}>Proposer un exercice <span>→</span></button></div>
        </section>
      </main>

      <footer className="home-footer"><a className="home-brand" href="#accueil"><span className="brand-mark">W</span><span>Wamon<small>Le labo dans la classe</small></span></a><p>Un projet libre pour faire de la science, partout.</p><div><span>Code MIT</span><span>·</span><span>Contenus CC BY-SA</span></div></footer>
    </div>
  );
}
