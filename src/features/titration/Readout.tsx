import { fmt } from '../../lib/format';

interface ReadoutProps {
  volume: number;
  maxVb: number;
  pH: number;
  color: string;
  colorLabel: string;
}

/** Les trois grandeurs que toute la classe doit pouvoir lire de loin. */
export function Readout({ volume, maxVb, pH, color, colorLabel }: ReadoutProps) {
  return (
    <dl className="grid grid-cols-3 divide-x divide-line overflow-hidden rounded-2xl border border-line bg-surface" aria-live="polite">
      <div className="p-3 sm:p-4">
        <dt className="text-sm font-semibold text-ink-2">Volume versé</dt>
        <dd className="mt-1 text-2xl font-bold tabular-nums text-ink sm:text-3xl">{fmt(volume, 1)}<span className="ml-1 text-base font-semibold text-ink-2">mL</span></dd>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden="true"><div className="h-full rounded-full bg-brand transition-[width] duration-150" style={{ width: `${Math.min(100, (volume / maxVb) * 100)}%` }} /></div>
      </div>
      <div className="p-3 sm:p-4">
        <dt className="text-sm font-semibold text-ink-2">pH</dt>
        <dd className="mt-1 text-2xl font-bold tabular-nums text-ink sm:text-3xl">{fmt(pH, 2)}</dd>
      </div>
      <div className="p-3 sm:p-4">
        <dt className="text-sm font-semibold text-ink-2">Couleur</dt>
        <dd className="mt-1 flex items-center gap-2">
          <span className="size-7 shrink-0 rounded-full ring-2 ring-ink/15 sm:size-8" style={{ background: color }} aria-hidden="true" />
          <span className="text-sm font-semibold leading-tight text-ink sm:text-base">{colorLabel.replace(/\s*\(.*\)$/, '')}</span>
        </dd>
      </div>
    </dl>
  );
}
