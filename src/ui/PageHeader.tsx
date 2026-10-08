import type { ReactNode } from 'react';
import { Ruler } from './Ruler';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
  /** Largeur maximale du texte d’introduction. */
  className?: string;
}

/** Titre de page posé sur sa règle graduée. */
export function PageHeader({ title, children, className = '' }: PageHeaderProps) {
  return (
    <header className={className}>
      <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">{title}</h1>
      {children && <p className="mt-3 max-w-3xl text-lg text-ink-2">{children}</p>}
      <Ruler className="mt-6 max-w-3xl" majors={12} minors={4} />
    </header>
  );
}
