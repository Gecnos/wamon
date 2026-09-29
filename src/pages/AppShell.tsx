import { useState } from 'react';
import type { AppView } from '../App';
import SimulationView from './SimulationView';
import CatalogView from './CatalogView';
import AboutView from './AboutView';
import Landing from './Landing';
import ContributionView from './ContributionView';

interface AppShellProps {
  initialView: AppView;
}

const NAV_ITEMS: { id: AppView; icon: string; label: string }[] = [
  { id: 'simulation', icon: '01', label: 'Simulations' },
  { id: 'catalog', icon: '02', label: 'Matériel' },
  { id: 'about', icon: '03', label: 'Pour la classe' },
];

export default function AppShell({ initialView }: AppShellProps) {
  const [view, setView] = useState<AppView>(initialView);
  const [projector, setProjector] = useState(false);

  return (
    <div className={projector ? 'projector' : ''}>
      {/* Header */}
      {view !== 'home' && <header className="app-header">
        <button className="app-logo" onClick={() => setView('home')} aria-label="Retour à l’accueil">
          <span className="brand-mark">W</span><span className="app-logo-word">Wamon<small>Le labo dans la classe</small></span>
        </button>

        <nav className="nav-tabs" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-tab ${view === item.id ? 'active' : ''}`}
              onClick={() => setView(item.id)}
              aria-current={view === item.id ? 'page' : undefined}
            >
              <span className="nav-tab-index">{item.icon}</span>{item.label}
              {view === item.id && <span className="nav-tab-indicator" />}
            </button>
          ))}
        </nav>

        <div className="header-right">
          <button
            className="projector-toggle"
            onClick={() => setProjector(p => !p)}
            id="btn-projector"
            aria-pressed={projector}
          >
            <span className="projector-toggle-dot" />{projector ? 'Mode normal' : 'Mode projection'}
          </button>
          <button className="shell-contribute" onClick={() => setView('contribute')}>Proposer un exercice <span>↗</span></button>
        </div>
      </header>}

      {/* Contenu */}
      <main>
        {view === 'home' && <Landing onStart={setView} />}
        {view === 'simulation' && <SimulationView key="sim" />}
        {view === 'catalog'    && <CatalogView    key="cat" />}
        {view === 'about'      && <AboutView       key="about" />}
        {view === 'contribute' && <ContributionView />}
      </main>
    </div>
  );
}
