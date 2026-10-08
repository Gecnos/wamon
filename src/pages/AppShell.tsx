import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { mailto } from '../lib/contact';
import { useProjection } from '../lib/projection';
import { Close, Expand, Menu, Projector } from '../ui/icons';

const NAV = [
  { to: '/exercices', label: 'Exercices', match: ['/exercices', '/seance'] },
  { to: '/labo', label: 'Labo libre', match: ['/labo'] },
  { to: '/materiel', label: 'Matériel', match: ['/materiel'] },
  { to: '/guide', label: 'Guide', match: ['/guide'] },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg" aria-label="Wamon, accueil">
      {/* Un erlenmeyer stylisé, à l’encre. */}
      <svg viewBox="0 0 32 32" className="size-9" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#1e44c4" />
        <path d="M12.5 7h7M13.5 7v6.5L8 23.5A1.6 1.6 0 0 0 9.4 26h13.2a1.6 1.6 0 0 0 1.4-2.5L18.5 13.5V7" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10.2 20h11.6l2 3.6a1.6 1.6 0 0 1-1.4 2.4H9.6a1.6 1.6 0 0 1-1.4-2.4Z" fill="#ffe45c" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight text-ink">Wamon</span>
    </Link>
  );
}

export default function AppShell() {
  const [projection, setProjection] = useProjection();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (match: string[]) => match.some(m => pathname.startsWith(m));
  const linkClass = (active: boolean) =>
    `rounded-lg px-3 py-2 font-semibold transition-colors duration-150 ${active ? 'text-encre-strong underline decoration-2 underline-offset-8' : 'text-ink-2 hover:text-ink'}`;

  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => undefined);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">Aller au contenu</a>

      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Logo />

          <nav aria-label="Navigation principale" className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV.map(item => <NavLink key={item.to} to={item.to} className={() => linkClass(isActive(item.match))}>{item.label}</NavLink>)}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <a href={mailto('Wamon : proposition ou question')} className="hidden min-h-11 items-center rounded-xl px-3 font-semibold text-encre transition-colors hover:bg-encre-soft md:inline-flex projection:hidden">Nous écrire</a>
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
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3 font-semibold transition-[background-color,transform] duration-150 active:scale-[0.97] ${projection ? 'bg-ink text-white hover:bg-encre-strong' : 'border border-line-strong bg-surface text-ink hover:bg-sunken'}`}
            >
              <Projector />
              <span className="hidden sm:inline">{projection ? 'Quitter la projection' : 'Projeter'}</span>
            </button>
            <button type="button" onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen} aria-controls="menu-mobile" className="grid size-11 place-items-center rounded-xl text-ink hover:bg-sunken lg:hidden" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
              {menuOpen ? <Close /> : <Menu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="menu-mobile" aria-label="Navigation principale" className="border-t border-line bg-surface px-4 pb-4 pt-2 lg:hidden">
            <ul className="grid gap-1">
              {NAV.map(item => (
                <li key={item.to}>
                  <NavLink to={item.to} className={() => `block rounded-lg px-3 py-3 text-lg font-semibold ${isActive(item.match) ? 'bg-encre-soft text-encre-strong' : 'text-ink hover:bg-sunken'}`}>{item.label}</NavLink>
                </li>
              ))}
              <li><a href={mailto('Wamon : proposition ou question')} className="block rounded-lg px-3 py-3 text-lg font-semibold text-ink hover:bg-sunken">Nous écrire</a></li>
            </ul>
          </nav>
        )}
      </header>

      <main id="contenu" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] projection:hidden">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-ink-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-6">
          <div>
            <Logo />
            <p className="mt-3 max-w-md">Un projet libre et gratuit pour faire de la science en classe, même sans laboratoire ni connexion.</p>
          </div>
          <ul className="grid content-start gap-2 text-[0.95rem]">
            <li><a href={mailto('Wamon : proposition ou question')} className="font-semibold text-ink hover:underline">Une idée d’exercice ? Écrivez-nous</a></li>
            <li><a href="https://github.com/Gecnos/wamon" className="font-semibold text-ink hover:underline">Code source sur GitHub</a></li>
            <li>Code sous licence MIT, contenus sous CC BY-SA</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
