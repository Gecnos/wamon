import { fmt } from '../../lib/format';
import { Ruler } from '../../ui/Ruler';

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
    <dl className="grid grid-cols-3 divide-x-2 divide-ink overflow-hidden rounded-lg border-2 border-ink bg-surface" aria-live="polite">
      <div className="p-3 sm:p-4">
        <dt className="text-sm font-bold text-ink-2">Volume versé</dt>
        <dd className="mt-1 font-mono text-3xl font-bold tabular-nums text-ink sm:text-4xl">{fmt(volume, 1)}<span className="ml-1 font-sans text-base font-semibold text-ink-2">mL</span></dd>
        <Ruler className="mt-2" majors={5} minors={5} progress={Math.min(1, volume / maxVb)} />
      </div>
      <div className="p-3 sm:p-4">
        <dt className="text-sm font-bold text-ink-2">pH</dt>
        <dd className="mt-1 font-mono text-3xl font-bold tabular-nums text-ink sm:text-4xl">{fmt(pH, 2)}</dd>
      </div>
      <div className="p-3 sm:p-4">
        <dt className="text-sm font-bold text-ink-2">Couleur</dt>
        <dd className="mt-2 flex items-center gap-2">
          <span className="size-8 shrink-0 rounded-md border-2 border-ink" style={{ background: color }} aria-hidden="true" />
          <span className="text-sm font-bold leading-tight text-ink sm:text-base">{colorLabel.replace(/\s*\(.*\)$/, '')}</span>
        </dd>
      </div>
    </dl>
  );
}
