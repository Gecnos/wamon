import { fmt } from '../../lib/format';
import { universalGradient } from '../../models/ph';

/** Un repère posé sur l'échelle : une valeur lue ou la réponse d'un groupe. */
export interface PhMarker {
  label: string;
  value: number;
  color: string;
}

/**
 * Échelle de pH de 0 à 14 aux teintes de l’indicateur universel. Chaque
 * repère traverse la barre ; la légende dessous donne les valeurs lues.
 */
export function PhScale({ markers, title }: { markers: PhMarker[]; title: string }) {
  const pos = (v: number) => `${(Math.min(14, Math.max(0, v)) / 14) * 100}%`;
  return (
    <figure className="m-0">
      <div className="relative mx-3 pt-3 pb-1">
        <div className="relative h-9 rounded-md border-2 border-ink" style={{ background: universalGradient() }} role="img" aria-label={title}>
          {markers.map(m => (
            <span key={m.label} aria-hidden="true" className="absolute -top-3 -bottom-2 w-1.5 -translate-x-1/2 rounded-full border border-white" style={{ left: pos(m.value), background: m.color }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-sm tabular-nums text-ink-2" aria-hidden="true">
          {[0, 2, 4, 6, 7, 8, 10, 12, 14].map(n => <span key={n} className={n === 7 ? 'font-bold text-ink' : ''}>{n}</span>)}
        </div>
      </div>
      <figcaption className="sr-only">{title}</figcaption>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.95rem] font-semibold" aria-label="Légende">
        {markers.map(m => (
          <li key={m.label} className="flex items-center gap-2" style={{ color: m.color }}>
            <span className="h-4 w-1.5 rounded-full" style={{ background: m.color }} aria-hidden="true" />
            {m.label} : pH {fmt(m.value, 2)}
          </li>
        ))}
      </ul>
    </figure>
  );
}
