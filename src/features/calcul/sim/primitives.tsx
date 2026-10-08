import { useId, type ReactNode } from 'react';
import { fmt } from '../../../lib/format';

/** Utilitaires de temps : toutes les scènes sont des fonctions pures de `t` (0 à 1). */
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Avancement de `t` dans l’intervalle [a, b], de 0 à 1. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

export type RGB = [number, number, number];
export const mixColor = (c1: RGB, c2: RGB, x: number, alpha = 1) =>
  `rgba(${Math.round(lerp(c1[0], c2[0], x))}, ${Math.round(lerp(c1[1], c2[1], x))}, ${Math.round(lerp(c1[2], c2[2], x))}, ${alpha})`;

export const INK = '#13203a';
export const WATER = 'rgba(180, 205, 235, 0.55)';

interface Shape {
  w: number;
  h: number;
  outline: string;
  clip: string;
  /** Ordonnées intérieures du fond et du sommet du liquide. */
  bottom: number;
  top: number;
}

export const SHAPES = {
  beaker: { w: 100, h: 120, outline: 'M0 0 V110 a10 10 0 0 0 10 10 H90 a10 10 0 0 0 10 -10 V0', clip: 'M2 0 V110 a8 8 0 0 0 8 8 H90 a8 8 0 0 0 8 -8 V0 Z', bottom: 118, top: 8 },
  erlenmeyer: { w: 110, h: 130, outline: 'M35 0 V40 L2 118 a6 6 0 0 0 6 10 H102 a6 6 0 0 0 6 -10 L75 40 V0', clip: 'M37 0 V41 L5 117 a4 4 0 0 0 4 9 H101 a4 4 0 0 0 4 -9 L73 41 V0 Z', bottom: 126, top: 44 },
  fiole: { w: 100, h: 172, outline: 'M42 0 V75 A48 48 0 1 0 58 75 V0', clip: 'M43 0 V75 A47 47 0 1 0 57 75 V0 Z', bottom: 168, top: 20 },
  tube: { w: 36, h: 124, outline: 'M0 0 V106 a18 18 0 0 0 36 0 V0', clip: 'M2 0 V106 a16 16 0 0 0 32 0 V0 Z', bottom: 122, top: 6 },
  ballon: { w: 120, h: 156, outline: 'M50 0 V48 A55 55 0 1 0 70 48 V0', clip: 'M51 0 V48 A54 54 0 1 0 69 48 V0 Z', bottom: 152, top: 56 },
} satisfies Record<string, Shape>;

export type ShapeKind = keyof typeof SHAPES;

interface VesselProps {
  x: number;
  y: number;
  kind: ShapeKind;
  /** Remplissage du récipient, de 0 à 1. */
  level: number;
  color: string;
  /** Rotation en degrés, autour du centre du récipient. */
  tilt?: number;
  children?: ReactNode;
}

/** Récipient de verre avec son liquide, clippé à l’intérieur du verre. */
export function Vessel({ x, y, kind, level, color, tilt = 0, children }: VesselProps) {
  const id = useId().replace(/:/g, '');
  const s: Shape = SHAPES[kind];
  const top = s.bottom - clamp01(level) * (s.bottom - s.top);
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt} ${s.w / 2} ${s.h / 2})`}>
      <defs><clipPath id={id}><path d={s.clip} /></clipPath></defs>
      <rect x="0" y={top} width={s.w} height={s.bottom - top + 4} fill={color} clipPath={`url(#${id})`} />
      {children}
      <path d={s.outline} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Graduations d’un bécher. */
export function BeakerMarks() {
  return <g stroke={INK} strokeWidth="2">{[40, 62, 84].map((y, i) => <path key={y} d={`M0 ${y} h${i === 1 ? 20 : 12}`} />)}</g>;
}

export function Table({ y = 300, w = 480 }: { y?: number; w?: number }) {
  return <line x1="0" x2={w} y1={y} y2={y} stroke="#93a0b6" strokeWidth="3" />;
}

/** Une goutte qui tombe en boucle, de y0 à y1. */
export function Drops({ x, y0, y1, t, rate = 6, color }: { x: number; y0: number; y1: number; t: number; rate?: number; color: string }) {
  return (
    <g fill={color}>
      {[0, 0.5].map(o => {
        const f = (t * rate + o) % 1;
        return <path key={o} transform={`translate(${x} ${lerp(y0, y1, f * f)})`} opacity={f > 0.02 ? 1 : 0} d="M0 -7 C4 -1 5 2 0 5 C-5 2 -4 -1 0 -7Z" />;
      })}
    </g>
  );
}

/** Burette graduée : `level` est la fraction de liquide restant. */
export function Burette({ x, y, level, color, flow = false, t = 0 }: { x: number; y: number; level: number; color: string; flow?: boolean; t?: number }) {
  const H = 170;
  const top = H - clamp01(level) * (H - 10);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y={top} width="14" height={H - top} fill={color} />
      <rect x="0" y="0" width="14" height={H} fill="none" stroke={INK} strokeWidth="3" />
      {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M14 ${10 + i * 16} h${i % 5 === 0 ? 10 : 6}`} stroke={INK} strokeWidth="2" />)}
      <path d={`M3 ${H} L7 ${H + 14} L11 ${H}`} fill="#fff" stroke={INK} strokeWidth="2.5" />
      <rect x="-8" y={H + 6} width="30" height="6" rx="3" fill={flow ? '#127546' : '#c02d1c'} stroke={INK} strokeWidth="1.5" />
      {flow && <Drops x={7} y0={H + 16} y1={H + 62} t={t} rate={8} color={color} />}
    </g>
  );
}

/** Pipette graduée ou jaugée, pointe vers le bas. */
export function Pipette({ x, y, level, color }: { x: number; y: number; level: number; color: string }) {
  const H = 120;
  const top = H - clamp01(level) * (H - 6);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-4" y={top} width="8" height={H - top} fill={color} />
      <path d={`M-4 0 V${H} L0 ${H + 22} L4 ${H} V0 Z`} fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="-9" y="-16" width="18" height="16" rx="8" fill="#c02d1c" stroke={INK} strokeWidth="2" />
      {[0.25, 0.5, 0.75].map(f => <path key={f} d={`M4 ${f * H} h5`} stroke={INK} strokeWidth="1.5" />)}
    </g>
  );
}

/** pH-mètre : sonde plongeante et afficheur. */
export function PHMeter({ x, y, value }: { x: number; y: number; value: number | null }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="104" height="82" rx="8" fill="#fff" stroke={INK} strokeWidth="3" />
      <rect x="10" y="10" width="84" height="38" rx="4" fill={INK} />
      <text x="88" y="38" textAnchor="end" fontSize="26" fontWeight="700" fill="#8ff0b4" fontFamily="'Atkinson Hyperlegible Mono Variable', monospace">{value === null ? '--,--' : value.toFixed(2).replace('.', ',')}</text>
      <text x="52" y="70" textAnchor="middle" fontSize="14" fontWeight="700" fill={INK}>pH-mètre</text>
    </g>
  );
}

/** Sonde à plonger : tige verticale et bulbe, `dip` de 0 (en l’air) à 1 (plongée). */
export function Probe({ x, y, dip, lift = 70 }: { x: number; y: number; dip: number; lift?: number }) {
  const dy = -lift * (1 - clamp01(dip));
  return (
    <g transform={`translate(${x} ${y + dy})`}>
      <rect x="-6" y="0" width="12" height="96" rx="4" fill="#fff" stroke={INK} strokeWidth="3" />
      <rect x="-4" y="96" width="8" height="18" rx="4" fill="#fff" stroke={INK} strokeWidth="2.5" />
    </g>
  );
}

/** Bulles qui montent dans une zone. */
export function Bubbles({ x, y, w, h, t, count = 8, color = 'rgba(255,255,255,0.8)' }: { x: number; y: number; w: number; h: number; t: number; count?: number; color?: string }) {
  return (
    <g fill={color} stroke="rgba(19,32,58,0.25)">
      {Array.from({ length: count }, (_, i) => {
        const f = (t * 3 + i / count) % 1;
        return <circle key={i} cx={x + ((i * 37) % 100) / 100 * w + Math.sin(f * 9 + i) * 3} cy={y + h - f * h} r={2 + (i % 3)} opacity={Math.sin(f * Math.PI)} />;
      })}
    </g>
  );
}

/** Flamme d’un chauffe-ballon ou d’un bec. */
export function Flame({ x, y, on, t }: { x: number; y: number; on: boolean; t: number }) {
  const wobble = Math.sin(t * 60) * 1.5;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-30" y="22" width="60" height="10" rx="3" fill="#46526a" />
      {on && <path d={`M0 -6 C${12 + wobble} 6 ${14} 16 0 22 C${-14} 16 ${-12 - wobble} 6 0 -6Z`} fill="#f59e0b" stroke="#c02d1c" strokeWidth="2" />}
    </g>
  );
}

/** Particules en mouvement léger dans une zone : les types sont donnés par `kinds`. */
export function Particles({ x, y, w, h, kinds, t, r = 5 }: { x: number; y: number; w: number; h: number; kinds: { color: string; ring?: boolean; pair?: string }[]; t: number; r?: number }) {
  const cols = Math.ceil(Math.sqrt((kinds.length * w) / h));
  const rows = Math.ceil(kinds.length / cols);
  return (
    <g>
      {kinds.map((k, i) => {
        const cx = x + ((i % cols) + 0.5) * (w / cols) + Math.sin(t * 40 + i * 1.7) * 3;
        const cy = y + (Math.floor(i / cols) + 0.5) * (h / rows) + Math.cos(t * 37 + i * 2.3) * 3;
        if (k.pair) {
          return (
            <g key={i}>
              <circle cx={cx - 4} cy={cy} r={r * 0.85} fill={k.color} />
              <circle cx={cx + 5} cy={cy - 2} r={r * 0.6} fill={k.pair} />
            </g>
          );
        }
        return <circle key={i} cx={cx} cy={cy} r={r} fill={k.ring ? 'none' : k.color} stroke={k.color} strokeWidth={k.ring ? 2 : 1} />;
      })}
    </g>
  );
}

/** Étiquette de texte dans une scène. */
export function Label({ x, y, children, size = 15, anchor = 'middle', color = INK, weight = 700 }: { x: number; y: number; children: ReactNode; size?: number; anchor?: 'start' | 'middle' | 'end'; color?: string; weight?: number }) {
  return <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color}>{children}</text>;
}

/** Axes et courbes simples pour les graphiques tracés pendant la simulation. */
export function Plot({ x, y, w, h, xMax, yMax, xLabel, yLabel, children }: { x: number; y: number; w: number; h: number; xMax: number; yMax: number; xLabel: string; yLabel: string; children: (px: (v: number) => number, py: (v: number) => number) => ReactNode }) {
  const px = (v: number) => (v / xMax) * w;
  const py = (v: number) => h - (v / yMax) * h;
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 0.25, 0.5, 0.75, 1].map(f => <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#e3e9f2" />)}
      <path d={`M0 0 V${h} H${w}`} fill="none" stroke={INK} strokeWidth="2" />
      <text x={w / 2} y={h + 28} textAnchor="middle" fontSize="13" fontWeight="600" fill={INK}>{xLabel}</text>
      <text x="-8" y="-8" textAnchor="start" fontSize="13" fontWeight="600" fill={INK}>{yLabel}</text>
      <text x="0" y={h + 14} textAnchor="middle" fontSize="11" fill="#46526a">0</text>
      <text x={w} y={h + 14} textAnchor="middle" fontSize="11" fill="#46526a">{fmt(xMax, 0)}</text>
      <text x="-5" y="4" textAnchor="end" fontSize="11" fill="#46526a">{fmt(yMax, 1)}</text>
      {children(px, py)}
    </g>
  );
}
