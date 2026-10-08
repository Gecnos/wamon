import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useProjection } from '../lib/projection';
import { CONTACT_EMAIL, mailto } from '../lib/contact';
import { Beaker, Board, Book, Close, Expand, Flask, Mail, Menu, Projector } from '../ui/icons';

const NAV = [
  { to: '/exercices', label: 'Exercices', icon: Board, match: ['/exercices', '/seance'] },
  { to: '/labo', label: 'Labo libre', icon: Flask, match: ['/labo'] },
  { to: '/materiel', label: 'Matériel', icon: Beaker, match: ['/materiel'] },
  { to: '/guide', label: 'Guide', icon: Book, match: ['/guide'] },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-md" aria-label="Wamon, accueil">
      {/* Un erlenmeyer gradué : le liquide est l’orange du produit. */}
      <svg viewBox="0 0 32 32" className="size-9" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="#14171c" />
        <path d="M12.5 6h7M13.5 6v7.5L8 23.5A1.6 1.6 0 0 0 9.4 26h13.2a1.6 1.6 0 0 0 1.4-2.5L18.5 13.5V6" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10.2 20h11.6l2 3.6a1.6 1.6 0 0 1-1.4 2.4H9.6a1.6 1.6 0 0 1-1.4-2.4Z" fill="#ff5a1f" />
      </svg>
      <span className={`text-xl font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Wamon</span>
    </Link>
  );
}

function ProjectionToggle({ className = '' }: { className?: string }) {
  const [projection, setProjection] = useProjection();
  return (
    <button
      type="button"
      onClick={() => setProjection(v => !v)}
      aria-pressed={projection}
      title="Agrandit le texte et les commandes pour qu’ils restent lisibles au fond de la salle"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border-2 border-ink px-3 font-bold transition-[background-color,transform] duration-150 active:scale-[0.97] ${projection ? 'bg-ink text-white hover:bg-black' : 'bg-surface text-ink hover:bg-sunken'} ${className}`}
    >
      <Projector />
      <span>{projection ? 'Quitter la projection' : 'Projeter'}</span>
    </button>
  );
}

function NavItems({ pathname, extra }: { pathname: string; extra?: ReactNode }) {
  const isActive = (match: string[]) => match.some(m => pathname.startsWith(m));
  return (
    <ul className="grid gap-1">
      {NAV.map(item => {
        const active = isActive(item.match);
        return (
          <li key={item.to}>
            <NavLink to={item.to} aria-current={active ? 'page' : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-md px-3 text-lg font-bold transition-colors duration-150 ${active ? 'bg-ink text-white' : 'text-ink hover:bg-sunken'}`}>
              <item.icon size={22} />{item.label}
            </NavLink>
          </li>
        );
      })}
      {extra}
    </ul>
  );
}

export default function AppShell() {
  const [projection] = useProjection();
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
    <div className="min-h-dvh">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2">Aller au contenu</a>

      {/* Rail de navigation : ordinateur, hors projection. */}
      {!projection && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r-2 border-ink bg-surface px-3 pt-5 pb-4 lg:flex">
          <div className="px-1"><Logo /></div>
          <nav aria-label="Navigation principale" className="mt-8">
            <NavItems pathname={pathname} />
          </nav>
          <div className="mt-auto grid gap-3">
            <a href={mailto('Wamon : proposition ou question')} className="flex min-h-12 items-center gap-3 rounded-md border-2 border-dashed border-line-strong px-3 font-bold text-ink transition-colors hover:border-ink hover:bg-sunken">
              <Mail size={20} />Nous écrire
            </a>
            <ProjectionToggle />
            <p className="px-1 text-sm leading-snug text-ink-2">
              <a href="https://github.com/Gecnos/wamon" className="font-semibold text-ink underline underline-offset-4">Code source</a>, licence MIT. Contenus sous CC BY-SA.
            </p>
          </div>
        </aside>
      )}

      {/* Barre compacte : téléphone, tablette et projection. */}
      <header className={`sticky top-0 z-30 border-b-2 border-ink bg-surface pt-[env(safe-area-inset-top)] ${projection ? '' : 'lg:hidden'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            {projection && (
              <>
                <nav aria-label="Navigation principale" className="mr-2 hidden items-center gap-1 md:flex">
                  {NAV.map(item => {
                    const active = item.match.some(m => pathname.startsWith(m));
                    return <NavLink key={item.to} to={item.to} className={`rounded-md px-3 py-2 font-bold ${active ? 'bg-ink text-white' : 'text-ink hover:bg-sunken'}`}>{item.label}</NavLink>;
                  })}
                </nav>
                <button type="button" onClick={fullscreen} className="hidden size-11 place-items-center rounded-md text-ink-2 hover:bg-sunken sm:grid" aria-label="Plein écran" title="Plein écran">
                  <Expand />
                </button>
              </>
            )}
            <ProjectionToggle className="[&>span]:hidden sm:[&>span]:inline" />
            <button type="button" onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen} aria-controls="menu-mobile"
              className={`grid size-11 place-items-center rounded-md border-2 border-ink text-ink hover:bg-sunken ${projection ? 'md:hidden' : ''}`} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
              {menuOpen ? <Close /> : <Menu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="menu-mobile" aria-label="Navigation principale" className="border-t border-line bg-surface px-4 pb-4 pt-2">
            <NavItems pathname={pathname} extra={
              <li>
                <a href={mailto('Wamon : proposition ou question')} className="flex min-h-12 items-center gap-3 rounded-md px-3 text-lg font-bold text-ink hover:bg-sunken"><Mail size={22} />Nous écrire</a>
              </li>
            } />
          </nav>
        )}
      </header>

      <div className={projection ? '' : 'lg:pl-60'}>
        <main id="contenu">
          <Outlet />
        </main>

        <footer className="border-t border-line px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-ink-2 sm:px-6 lg:hidden projection:hidden">
          <p className="max-w-md">Un projet libre et gratuit pour faire de la science en classe, même sans laboratoire ni connexion.</p>
          <p className="mt-3 text-sm">
            <a href="https://github.com/Gecnos/wamon" className="font-semibold text-ink underline underline-offset-4">Code source sur GitHub</a>. Code sous licence MIT, contenus sous CC BY-SA.
          </p>
          <p className="mt-3 text-sm">Une idée d’exercice, une question ? Écrivez à <a href={mailto('Wamon : proposition ou question')} className="font-semibold text-ink underline underline-offset-4">{CONTACT_EMAIL}</a>.</p>
        </footer>
      </div>
    </div>
  );
}
