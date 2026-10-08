import type { Figure } from '../../exercises';
import { fmt } from '../../lib/format';

/** Valeur lisible : notation scientifique pour les très petits nombres. */
function amount(value: number): string {
  if (value !== 0 && Math.abs(value) < 0.001) return fmt(value, -3);
  return fmt(value, Math.abs(value) >= 100 ? 0 : 3);
}

function Reading({ figure }: { figure: Extract<Figure, { type: 'reading' }> }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="font-semibold text-ink-2">{figure.label}</p>
      <div className="mt-2 flex items-center gap-4">
        {figure.color && <span className="size-12 shrink-0 rounded-full ring-2 ring-ink/15" style={{ background: figure.color }} aria-hidden="true" />}
        <p className="font-mono text-3xl font-bold tabular-nums text-ink sm:text-4xl">{figure.value}</p>
      </div>
      {figure.detail && <p className="mt-3 text-ink-2">{figure.detail}</p>}
    </div>
  );
}

function Bars({ figure }: { figure: Extract<Figure, { type: 'bars' }> }) {
  const max = Math.max(...figure.bars.map(b => b.value), 1e-12);
  return (
    <ul className="grid gap-3 rounded-2xl border border-line bg-surface p-5" aria-label={`Valeurs en ${figure.unit}`}>
      {figure.bars.map(bar => (
        <li key={bar.label} className="grid gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-[0.95rem]">
            <span className="font-semibold text-ink">{bar.label}</span>
            <span className="font-mono font-bold tabular-nums text-ink">{amount(bar.value)} {figure.unit}</span>
          </div>
          <div className="h-3.5 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
            <div className="h-full rounded-full" style={{ width: `${Math.max(1.5, (bar.value / max) * 100)}%`, background: bar.color ?? '#1e44c4' }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const W = 520;
const H = 320;
const PAD = { top: 16, right: 20, bottom: 52, left: 56 };

function Curve({ figure }: { figure: Extract<Figure, { type: 'curve' }> }) {
  const xs = figure.points.map(p => p.x);
  const xMax = Math.max(...xs);
  const yMax = Math.ceil(Math.max(...figure.points.map(p => p.y)) * 1.1);
  const x = (v: number) => PAD.left + (v / xMax) * (W - PAD.left - PAD.right);
  const y = (v: number) => H - PAD.bottom - (v / yMax) * (H - PAD.top - PAD.bottom);
  const path = figure.points.map((p, i) => `${i ? 'L' : 'M'}${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const xTicks = Array.from({ length: 5 }, (_, i) => Math.round((xMax / 4) * i));
  const yTicks = Array.from({ length: 5 }, (_, i) => (yMax / 4) * i);
  const s = figure.secant;
  return (
    <figure className="m-0 rounded-2xl border border-line bg-surface p-3 sm:p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${figure.yLabel} en fonction de ${figure.xLabel}`}>
        {yTicks.map(t => (
          <g key={`y${t}`}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#e3e9f2" />
            <text x={PAD.left - 8} y={y(t) + 5} textAnchor="end" fontSize="14" fill="#46526a">{fmt(t, 1)}</text>
          </g>
        ))}
        {xTicks.map(t => (
          <g key={`x${t}`}>
            <line x1={x(t)} x2={x(t)} y1={PAD.top} y2={H - PAD.bottom} stroke="#e3e9f2" />
            <text x={x(t)} y={H - PAD.bottom + 20} textAnchor="middle" fontSize="14" fill="#46526a">{t}</text>
          </g>
        ))}
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom} stroke="#13203a" strokeWidth="1.5" />
        <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="#13203a" strokeWidth="1.5" />
        <text x={(PAD.left + W - PAD.right) / 2} y={H - 10} textAnchor="middle" fontSize="15" fontWeight="600" fill="#13203a">{figure.xLabel}</text>
        <text x={16} y={(PAD.top + H - PAD.bottom) / 2} textAnchor="middle" fontSize="15" fontWeight="600" fill="#13203a" transform={`rotate(-90 16 ${(PAD.top + H - PAD.bottom) / 2})`}>{figure.yLabel}</text>
        <path d={path} fill="none" stroke="#1e44c4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {s && (
          <g>
            <line x1={x(s.x1)} y1={y(s.y1)} x2={x(s.x2)} y2={y(s.y2)} stroke="#c02d1c" strokeWidth="2.5" strokeDasharray="7 5" />
            <circle cx={x(s.x1)} cy={y(s.y1)} r="6" fill="#c02d1c" stroke="#fff" strokeWidth="2" />
            <circle cx={x(s.x2)} cy={y(s.y2)} r="6" fill="#c02d1c" stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      {s && <figcaption className="mt-1 text-[0.95rem] font-semibold text-rouge">La pente de la sécante est la vitesse moyenne entre les deux dates.</figcaption>}
    </figure>
  );
}

/** Ce que la classe voit : une lecture, des barres comparées ou une courbe. */
export function FigureView({ figure }: { figure: Figure }) {
  if (figure.type === 'reading') return <Reading figure={figure} />;
  if (figure.type === 'bars') return <Bars figure={figure} />;
  return <Curve figure={figure} />;
}
