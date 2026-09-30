import { useMemo } from 'react';
import { titrationPoint } from '../../models/titration';
import { fmt } from '../../lib/format';

export interface CurveMarker {
  value: number;
  label: string;
  color: string;
  dashed?: boolean;
}

interface TitrationCurveProps {
  Ca: number;
  Va: number;
  Cb: number;
  /** Absent : acide fort. */
  pKa?: number;
  maxVb: number;
  currentVb: number;
  /** Trace la courbe complète en pointillés clairs (sinon seulement la partie versée). */
  showTheory?: boolean;
  /** Relevés faits par l’élève (mode labo). */
  measures?: { Vb: number; pH: number }[];
  markers?: CurveMarker[];
  title: string;
}

const W = 640;
const H = 420;
const PAD = { top: 20, right: 20, bottom: 56, left: 60 };
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top - PAD.bottom;

export function TitrationCurve({ Ca, Va, Cb, pKa, maxVb, currentVb, showTheory = true, measures = [], markers = [], title }: TitrationCurveProps) {
  const x = (v: number) => PAD.left + (v / maxVb) * PW;
  const y = (pH: number) => PAD.top + PH - (pH / 14) * PH;

  const points = useMemo(() => {
    const result: { Vb: number; pH: number }[] = [];
    const stepMl = maxVb / 400;
    for (let v = 0; v <= maxVb + 1e-9; v += stepMl) result.push({ Vb: v, pH: titrationPoint({ Ca, Va, Cb, pKa }, v).pH });
    return result;
  }, [Ca, Va, Cb, pKa, maxVb]);

  const path = (list: { Vb: number; pH: number }[]) => list.map((p, i) => `${i ? 'L' : 'M'}${x(p.Vb).toFixed(1)},${y(p.pH).toFixed(1)}`).join(' ');
  const poured = points.filter(p => p.Vb <= currentVb);
  const now = titrationPoint({ Ca, Va, Cb, pKa }, currentVb);
  const xTicks = Array.from({ length: maxVb / 5 + 1 }, (_, i) => i * 5);
  const yTicks = [0, 2, 4, 6, 7, 8, 10, 12, 14];

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${title}. Volume versé ${fmt(currentVb, 1)} mL, pH ${fmt(now.pH, 2)}.`}>
        {yTicks.map(t => (
          <g key={`y${t}`}>
            <line x1={PAD.left} x2={PAD.left + PW} y1={y(t)} y2={y(t)} stroke={t === 7 ? '#93a0b6' : '#e3e9f2'} strokeDasharray={t === 7 ? '6 5' : undefined} />
            <text x={PAD.left - 10} y={y(t) + 5} textAnchor="end" fontSize="15" fill="#46526a" className="tabular-nums">{t}</text>
          </g>
        ))}
        {xTicks.map(t => (
          <g key={`x${t}`}>
            <line x1={x(t)} x2={x(t)} y1={PAD.top} y2={PAD.top + PH} stroke="#e3e9f2" />
            <text x={x(t)} y={PAD.top + PH + 22} textAnchor="middle" fontSize="15" fill="#46526a" className="tabular-nums">{t}</text>
          </g>
        ))}
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + PH} stroke="#13203a" strokeWidth="1.5" />
        <line x1={PAD.left} x2={PAD.left + PW} y1={PAD.top + PH} y2={PAD.top + PH} stroke="#13203a" strokeWidth="1.5" />
        <text x={PAD.left + PW / 2} y={H - 8} textAnchor="middle" fontSize="16" fontWeight="600" fill="#13203a">Volume de soude versé V<tspan fontSize="12" dy="4">b</tspan><tspan dy="-4"> (mL)</tspan></text>
        <text x={18} y={PAD.top + PH / 2} textAnchor="middle" fontSize="16" fontWeight="600" fill="#13203a" transform={`rotate(-90 18 ${PAD.top + PH / 2})`}>pH</text>

        {markers.filter(m => m.value >= 0 && m.value <= maxVb).map((m, i) => (
          <g key={`${m.label}-${i}`}>
            <line x1={x(m.value)} x2={x(m.value)} y1={PAD.top} y2={PAD.top + PH} stroke={m.color} strokeWidth="2.5" strokeDasharray={m.dashed ? '7 5' : undefined} />
          </g>
        ))}

        {showTheory && <path d={path(points)} fill="none" stroke="#93a0b6" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />}
        {poured.length > 1 && <path d={path(poured)} fill="none" stroke="#1e44c4" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />}
        {measures.map((m, i) => <circle key={i} cx={x(m.Vb)} cy={y(m.pH)} r="6" fill="#c02d1c" stroke="#fff" strokeWidth="2" />)}
        <circle cx={x(currentVb)} cy={y(now.pH)} r="8" fill="#1e44c4" stroke="#fff" strokeWidth="3" />
      </svg>
      <figcaption className="sr-only">{title}</figcaption>
      {markers.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.95rem] font-semibold" aria-label="Légende">
          {markers.map((m, i) => (
            <li key={`${m.label}-${i}`} className="flex items-center gap-2" style={{ color: m.color }}>
              <svg width="22" height="4" aria-hidden="true"><line x1="0" x2="22" y1="2" y2="2" stroke={m.color} strokeWidth="3" strokeDasharray={m.dashed ? '5 3' : undefined} /></svg>
              {m.label}{m.value > 0 && !m.label.includes('mL') ? ` : ${fmt(m.value, 2)} mL` : ''}
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
