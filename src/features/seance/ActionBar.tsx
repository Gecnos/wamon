import type { ReactNode } from 'react';

/**
 * Barre d’action collée en bas de l’écran : le bouton principal de l’étape
 * reste toujours visible, y compris sur téléphone (zone sûre incluse).
 */
export function ActionBar({ hint, back, children }: { hint?: ReactNode; back?: ReactNode; children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-10 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        {back}
        {hint && <p className="hidden flex-1 text-[0.95rem] text-ink-2 md:block">{hint}</p>}
        <div className="ml-auto flex flex-1 justify-end md:flex-none">{children}</div>
      </div>
    </div>
  );
}
