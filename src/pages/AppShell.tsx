import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useProjection } from '../lib/projection';
import { Close, Expand, Menu, Projector } from '../ui/icons';

const NAV = [
  { to: '/seance', label: 'Séance guidée' },
  { to: '/labo', label: 'Labo libre' },
  { to: '/materiel', label: 'Matériel' },
  { to: '/guide', label: 'Guide enseignant' },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg" aria-label="Wamon, accueil">
      <span className="grid size-9 place-items-center rounded-lg bg-brand text-lg font-black text-white">W</span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-tight text-ink">Wamon</span>
        <span className="block text-xs font-medium text-ink-2 projection:hidden">Le labo dans la classe</span>
      </span>
    </Link>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-[0.95rem] font-semibold transition-colors ${isActive ? 'bg-brand-soft text-brand-strong' : 'text-ink-2 hover:bg-sunken hover:text-ink'}`;

export default function AppShell() {
  const [projection, setProjection] = useProjection();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => undefined);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">Aller au contenu</a>

      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Logo />

          <nav aria-label="Navigation principale" className="ml-4 hidden items-center gap-1 lg:flex">
            {NAV.map(item => <NavLink key={item.to} to={item.to} className={navLinkClass}>{item.label}</NavLink>)}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {projection && (
              <button type="button" onClick={fullscreen} className="hidden size-11 place-items-center rounded-xl text-ink-2 hover:bg-sunken sm:grid" aria-label="Plein écran" title="Plein écran">
                <Expand />
              </button>
            )}
            <button
              type="button"
              onClick={() => setProjection(v => !v)}
              aria-pressed={projection}
              title="Agrandit le texte et les commandes pour qu’ils restent lisibles au fond de la salle"
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-[0.95rem] font-semibold transition-colors ${projection ? 'bg-ink text-white hover:bg-brand-strong' : 'border border-line-strong bg-surface text-ink hover:bg-sunken'}`}
            >
              <Projector />
              <span className="hidden sm:inline">{projection ? 'Projection activée' : 'Mode projection'}</span>
            </button>
            <button type="button" onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen} aria-controls="menu-mobile" className="grid size-11 place-items-center rounded-xl text-ink hover:bg-sunken lg:hidden" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
              {menuOpen ? <Close /> : <Menu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="menu-mobile" aria-label="Navigation principale" className="border-t border-line bg-paper px-4 pb-4 pt-2 lg:hidden">
            <ul className="grid gap-1">
              {NAV.map(item => <li key={item.to}><NavLink to={item.to} className={p => `block ${navLinkClass(p)} py-3 text-base`}>{item.label}</NavLink></li>)}
              <li><NavLink to="/contribuer" className={p => `block ${navLinkClass(p)} py-3 text-base`}>Proposer un exercice</NavLink></li>
            </ul>
          </nav>
        )}
      </header>

      <main id="contenu" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line projection:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-ink-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Wamon — un projet libre pour faire de la science partout, même hors ligne.</p>
          <p className="flex gap-4"><Link to="/contribuer" className="font-semibold text-ink underline-offset-4 hover:underline">Proposer un exercice</Link><span>Code MIT · Contenus CC BY-SA</span></p>
        </div>
      </footer>
    </div>
  );
}
