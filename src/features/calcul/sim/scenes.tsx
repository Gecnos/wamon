import type { ReactNode } from 'react';
import type { CalculExercise, Figure, Params } from '../../../exercises';
import { fmt, parseDecimal } from '../../../lib/format';
import { universalColor } from '../../../models/ph';
import {
  BeakerMarks, Bubbles, Burette, clamp01, Drops, ease, Flame, INK, Label, lerp, mixColor, Particles, Pipette, PHMeter, Plot, Probe, seg, Table, Vessel, WATER, type RGB,
} from './primitives';

export interface SceneProps {
  ex: CalculExercise;
  params: Params;
  variantId: string;
  answer: number;
  /** Avancement de la simulation, de 0 à 1. */
  t: number;
  /** Nombre d’étapes du protocole : chaque étape occupe une part égale de `t`. */
  n: number;
  outcome: ReturnType<CalculExercise['outcome']>;
}

type Scene = (props: SceneProps) => ReactNode;

const step = (t: number, n: number, i: number) => seg(t, i / n, (i + 1) / n);
const bump = (s: number, a: number, b: number) => clamp01(Math.min((s - a) * 8, (b - s) * 8));
const reading = (figure: Figure) => (figure.type === 'reading' ? parseDecimal(figure.value.replace(/[^\d,.-]/g, '')) ?? 0 : 0);
const bars = (figure: Figure) => (figure.type === 'bars' ? figure.bars.map(b => b.value) : []);
const curve = (figure: Figure) => (figure.type === 'curve' ? figure : null);

// ─── Dilution d’une solution commerciale ──────────────────────

const dilutionCommerciale: Scene = ({ ex, params, variantId, answer, t, n, outcome }) => {
  const s = [0, 1, 2, 3, 4].map(i => step(t, n, i));
  const V0 = variantId === 'A' ? answer : ex.value(params, 'V0');
  const pH = reading(outcome.figure);
  const pipetteFill = Math.min(0.9, 0.15 + V0 / 12);
  // La pipette plonge dans le flacon, remonte, se déplace au-dessus de la fiole puis se vide.
  const x = lerp(70, 270, ease(seg(s[2], 0, 0.45)));
  const y = s[1] === 0 && s[2] === 0 ? -40 : s[2] > 0 ? lerp(10, 30, ease(seg(s[2], 0.4, 0.6))) : lerp(-40, 70, ease(seg(s[1], 0, 0.4))) - 60 * ease(seg(s[1], 0.7, 1));
  const level = s[2] > 0 ? pipetteFill * (1 - ease(seg(s[2], 0.6, 1))) : pipetteFill * ease(seg(s[1], 0.35, 0.7));
  const fiole = 0.32 + 0.02 * s[2] + 0.6 * ease(s[3]);
  const shake = s[3] > 0.8 ? Math.sin(s[3] * 90) * 6 : 0;
  return (
    <g>
      <Table />
      <Vessel x={20} y={180} kind="beaker" level={0.82 - 0.04 * s[1]} color="rgba(235,240,190,0.75)"><BeakerMarks /></Vessel>
      <rect x="28" y="214" width="84" height="34" rx="4" fill="#fff" stroke={INK} strokeWidth="2" />
      <Label x={70} y={236} size={14}>HCl 37 %</Label>
      <Label x={70} y={316} size={13}>Solution commerciale</Label>
      <g opacity={bump(s[0], 0, 1)}>
        <path d="M70 120 L98 168 H42 Z" fill="#facc15" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <Label x={70} y={158} size={26}>!</Label>
        <Label x={12} y={108} size={13} anchor="start">Corrosif : gants, lunettes</Label>
      </g>
      <Vessel x={220} y={118} kind="fiole" level={fiole} color={WATER} tilt={shake}>
        <path d="M36 30 H64" stroke="#c02d1c" strokeWidth="2.5" />
      </Vessel>
      <Label x={270} y={316} size={13}>Fiole jaugée</Label>
      {s[3] > 0 && s[3] < 0.8 && <Drops x={270} y0={-4} y1={110} t={t} color="rgba(120,170,225,0.9)" />}
      {(s[1] > 0 || s[2] > 0) && s[3] === 0 && <Pipette x={x} y={y} level={level} color="rgba(120,170,225,0.9)" />}
      <Probe x={410} y={150} dip={ease(seg(s[4], 0, 0.35))} lift={0} />
      <PHMeter x={360} y={30} value={s[4] > 0.3 ? lerp(7, pH, ease(seg(s[4], 0.3, 0.9))) : null} />
      <Vessel x={365} y={190} kind="beaker" level={s[4] > 0 ? 0.7 : 0} color={s[4] > 0.9 ? universalColor(pH) : WATER}><BeakerMarks /></Vessel>
    </g>
  );
};

// ─── Produit ionique de l’eau ─────────────────────────────────

const produitIonique: Scene = ({ params, t, n }) => {
  const s = [0, 1, 2].map(i => step(t, n, i));
  const pH = params.pH;
  const inA = bump(s[0], 0.05, 0.45);
  const inB = bump(s[0], 0.55, 0.95);
  const px = s[0] < 1 ? (s[0] < 0.5 ? 75 : 195) : lerp(195, 315, ease(s[1]));
  const dip = s[1] > 0 && s[2] === 0 ? 0.25 * bump(s[1], 0, 1) + 0 : s[2] > 0 ? ease(seg(s[2], 0, 0.25)) : Math.max(inA, inB);
  const value = s[2] > 0.25 ? lerp(7, pH, ease(seg(s[2], 0.25, 0.9))) : s[0] > 0.7 && s[0] < 1 ? 7 : s[0] > 0.2 && s[0] <= 0.5 ? 4 : null;
  const cur = value ?? 7;
  return (
    <g>
      <Table />
      <Vessel x={25} y={180} kind="beaker" level={0.7} color={universalColor(4)}><BeakerMarks /></Vessel>
      <Vessel x={145} y={180} kind="beaker" level={0.7} color={universalColor(7)}><BeakerMarks /></Vessel>
      <Vessel x={265} y={180} kind="beaker" level={0.7} color={universalColor(pH)}><BeakerMarks /></Vessel>
      <Label x={75} y={316} size={13}>Tampon pH 4</Label>
      <Label x={195} y={316} size={13}>Tampon pH 7</Label>
      <Label x={315} y={316} size={13}>Solution</Label>
      <Probe x={px} y={140} dip={dip} lift={50} />
      <PHMeter x={385} y={180} value={value} />
      {/* [H₃O⁺] et [HO⁻] suivent le pH lu */}
      <g transform="translate(130 8)">
        <Label x={0} y={14} size={14} anchor="start">[H₃O⁺] = {fmt(10 ** -cur, -3)} mol/L</Label>
        <rect x="0" y="22" width="300" height="14" rx="7" fill="#eaeef5" />
        <rect x="0" y="22" width={300 * (14 - cur) / 14} height="14" rx="7" fill="#c02d1c" />
        <Label x={0} y={62} size={14} anchor="start">[HO⁻] = {fmt(10 ** (cur - 14), -3)} mol/L</Label>
        <rect x="0" y="70" width="300" height="14" rx="7" fill="#eaeef5" />
        <rect x="0" y="70" width={300 * cur / 14} height="14" rx="7" fill="#1e44c4" />
      </g>
    </g>
  );
};

// ─── Constante d’acidité : le monde des molécules ─────────────

const constanteAcidite: Scene = ({ ex, params, t, n }) => {
  const s = [0, 1, 2].map(i => step(t, n, i));
  const tau = ex.value(params, 'tau');
  const pH = ex.value(params, 'pH');
  const reacted = Math.round(tau * ease(seg(s[2], 0, 0.8)));
  const kinds = Array.from({ length: 100 }, (_, i) =>
    i < reacted ? { color: '#c02d1c', pair: '#127546' } : { color: '#1e44c4' });
  return (
    <g>
      <Table />
      <Vessel x={30} y={170} kind="beaker" level={0.72 * ease(s[0])} color="rgba(200,215,240,0.7)"><BeakerMarks /></Vessel>
      <Label x={80} y={316} size={13}>Acide éthanoïque</Label>
      <Probe x={80} y={104} dip={ease(seg(s[1], 0, 0.4))} lift={80} />
      <PHMeter x={20} y={20} value={s[1] > 0.4 ? lerp(7, pH, ease(seg(s[1], 0.4, 0.9))) : null} />
      <g opacity={ease(seg(s[1], 0.6, 1))}>
        <rect x="170" y="30" width="300" height="230" rx="14" fill="#fff" stroke={INK} strokeWidth="3" />
        <Label x={320} y={52} size={14}>100 molécules d’acide introduites</Label>
        <Particles x={182} y={64} w={276} h={150} kinds={kinds} t={t} r={6} />
        <g transform="translate(184 232)" fontSize="13" fontWeight="600">
          <circle cx="6" cy="0" r="6" fill="#1e44c4" /><text x="18" y="5" fill={INK}>CH₃COOH</text>
          <circle cx="118" cy="0" r="6" fill="#c02d1c" /><circle cx="128" cy="0" r="4" fill="#127546" /><text x="138" y="5" fill={INK}>CH₃COO⁻ + H₃O⁺</text>
        </g>
      </g>
      <Label x={320} y={290} size={16} color="#c02d1c">{reacted} molécule{reacted > 1 ? 's' : ''} sur 100 ont réagi</Label>
    </g>
  );
};

// ─── Forme prédominante ───────────────────────────────────────

const predominance: Scene = ({ params, t, n }) => {
  const s = [0, 1, 2].map(i => step(t, n, i));
  const { pH, pKa } = params;
  const start = Math.max(0, pKa - 3);
  const cur = lerp(start, pH, ease(s[1]));
  const base = 1 / (1 + 10 ** (pKa - cur));
  const acid: RGB = [229, 50, 45];
  const basic: RGB = [43, 111, 214];
  const pts = (f: (x: number) => number) => Array.from({ length: 57 }, (_, i) => i * 0.25).map(x => `${x * (230 / 14)},${170 - f(x) * 170}`).join(' ');
  return (
    <g>
      <Table />
      <Vessel x={30} y={170} kind="beaker" level={0.7} color={mixColor(acid, basic, base, 0.75)}><BeakerMarks /></Vessel>
      <Label x={80} y={316} size={13}>Indicateur coloré</Label>
      {s[0] < 1 && <Drops x={80} y0={20} y1={160} t={t} rate={4} color="#7c3aed" />}
      <Plot x={220} y={40} w={230} h={170} xMax={14} yMax={100} xLabel="pH" yLabel="Part (%)">
        {() => (
          <g>
            <polyline points={pts(x => 1 / (1 + 10 ** (x - pKa)))} fill="none" stroke="#e5322d" strokeWidth="3" />
            <polyline points={pts(x => 1 / (1 + 10 ** (pKa - x)))} fill="none" stroke="#2b6fd6" strokeWidth="3" />
            <line x1={pKa * 230 / 14} x2={pKa * 230 / 14} y1="0" y2="170" stroke="#46526a" strokeDasharray="5 4" />
            <Label x={pKa * 230 / 14} y={-6} size={12}>pKa = {fmt(pKa, 2)}</Label>
            <line x1={cur * 230 / 14} x2={cur * 230 / 14} y1="0" y2="170" stroke="#c02d1c" strokeWidth="2.5" />
            <circle cx={cur * 230 / 14} cy={170 - base * 170} r="6" fill="#2b6fd6" stroke="#fff" strokeWidth="2" />
            <circle cx={cur * 230 / 14} cy={170 - (1 - base) * 170} r="6" fill="#e5322d" stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </Plot>
      <Label x={335} y={262} size={15}>pH = {fmt(cur, 1)} : {base > 0.5 ? 'A⁻ prédomine' : base < 0.5 ? 'AH prédomine' : 'A⁻ et AH à égalité'}</Label>
      <rect x="220" y="272" width="230" height="16" rx="8" fill="#e5322d" />
      <rect x="220" y="272" width={230 * base} height="16" rx="8" fill="#2b6fd6" />
    </g>
  );
};

// ─── Solution tampon ──────────────────────────────────────────

const tampon: Scene = ({ t, n, outcome }) => {
  const s = [0, 1, 2, 3].map(i => step(t, n, i));
  const [pH0, , apres, eau] = bars(outcome.figure);
  const pHt = s[1] > 0.5 ? (s[3] > 0.4 ? lerp(pH0, apres, ease(seg(s[3], 0.4, 0.9))) : pH0) : null;
  const pHe = s[3] > 0.4 ? lerp(7, eau, ease(seg(s[3], 0.4, 0.9))) : 7;
  const levelT = lerp(0, 0.4, ease(s[0])) + lerp(0, 0.25, ease(s[1])) + lerp(0, 0.28, ease(s[2]));
  return (
    <g>
      <Table />
      <Vessel x={30} y={170} kind="beaker" level={levelT} color={pHt === null ? 'rgba(200,215,240,0.7)' : universalColor(pHt)}><BeakerMarks /></Vessel>
      <Vessel x={320} y={170} kind="beaker" level={0.65} color={universalColor(pHe)}><BeakerMarks /></Vessel>
      <Label x={80} y={316} size={14}>Tampon</Label>
      <Label x={370} y={316} size={14}>Eau pure</Label>
      <PHMeter x={20} y={20} value={pHt} />
      <PHMeter x={310} y={20} value={s[0] > 0 ? pHe : null} />
      <Probe x={80} y={110} dip={1} lift={0} />
      <Probe x={370} y={110} dip={1} lift={0} />
      {s[0] > 0 && s[0] < 1 && <Drops x={50} y0={122} y1={196} t={t} rate={5} color="rgba(120,170,225,0.9)" />}
      {s[1] > 0 && s[1] < 1 && <Drops x={110} y0={122} y1={196} t={t} rate={5} color="rgba(120,200,160,0.9)" />}
      {s[2] > 0 && s[2] < 1 && <Label x={190} y={150} size={15} color="#1e44c4">+ eau : dilution ×10</Label>}
      {s[3] > 0 && s[3] < 0.5 && (
        <g>
          <Drops x={50} y0={122} y1={196} t={t} rate={4} color="#c02d1c" />
          <Drops x={340} y0={122} y1={196} t={t} rate={4} color="#c02d1c" />
          <Label x={240} y={110} size={15} color="#c02d1c">+ 1 mL d’acide chlorhydrique</Label>
        </g>
      )}
    </g>
  );
};

// ─── Cinétique : vitesse de formation du diiode ───────────────

const vitesseFormation: Scene = ({ t, n, outcome }) => {
  const fig = curve(outcome.figure);
  if (!fig) return null;
  const tsim = t * 40;
  const point = fig.points[Math.min(fig.points.length - 1, Math.round(tsim / 0.5))];
  const sec = fig.secant;
  const yMax = Math.max(...fig.points.map(p => p.y)) * 1.1;
  const live = fig.points.filter(p => p.x <= tsim);
  const s0 = step(t, n, 0);
  return (
    <g>
      <Table />
      <Vessel x={30} y={160} kind="beaker" level={0.7 * ease(clamp01(s0 * 3))} color={mixColor([215, 230, 245], [150, 70, 20], clamp01(point.y / 5), 0.55 + 0.35 * clamp01(point.y / 5))}><BeakerMarks /></Vessel>
      <Label x={80} y={316} size={13}>Iodure + peroxodisulfate</Label>
      <rect x="30" y="22" width="140" height="44" rx="8" fill="#fff" stroke={INK} strokeWidth="3" />
      <Label x={100} y={52} size={22}>t = {fmt(tsim, 0)} min</Label>
      <Plot x={250} y={40} w={230} h={190} xMax={40} yMax={yMax} xLabel="Temps t (min)" yLabel="[I₂] (mmol/L)">
        {(px, py) => (
          <g>
            <polyline points={live.map(p => `${px(p.x)},${py(p.y)}`).join(' ')} fill="none" stroke="#1e44c4" strokeWidth="3.5" strokeLinecap="round" />
            {sec && tsim >= sec.x1 && <g><line x1={px(sec.x1)} x2={px(sec.x1)} y1={py(sec.y1)} y2={py(0)} stroke="#c02d1c" strokeDasharray="4 3" /><circle cx={px(sec.x1)} cy={py(sec.y1)} r="6" fill="#c02d1c" stroke="#fff" strokeWidth="2" /><Label x={px(sec.x1)} y={py(0) + 28} size={11} color="#c02d1c">t₁</Label></g>}
            {sec && tsim >= sec.x2 && <g><line x1={px(sec.x2)} x2={px(sec.x2)} y1={py(sec.y2)} y2={py(0)} stroke="#c02d1c" strokeDasharray="4 3" /><circle cx={px(sec.x2)} cy={py(sec.y2)} r="6" fill="#c02d1c" stroke="#fff" strokeWidth="2" /><Label x={px(sec.x2)} y={py(0) + 28} size={11} color="#c02d1c">t₂</Label></g>}
            {sec && tsim >= sec.x2 && step(t, n, 3) > 0 && <line x1={px(sec.x1)} y1={py(sec.y1)} x2={px(sec.x2)} y2={py(sec.y2)} stroke="#c02d1c" strokeWidth="3" strokeDasharray="7 5" />}
            <circle cx={px(point.x)} cy={py(point.y)} r="6" fill="#1e44c4" stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </Plot>
    </g>
  );
};

// ─── Cinétique : vitesses et stœchiométrie ────────────────────

const vitessesStoechiometrie: Scene = ({ t, outcome }) => {
  const v = bars(outcome.figure);
  const labels = ['MnO₄⁻', 'H₂C₂O₄', 'Mn²⁺', 'CO₂'];
  const colors = ['#7c3aed', '#1e44c4', '#127546', '#c02d1c'];
  const tsim = t * 10;
  const yMax = Math.max(...v) * 10;
  return (
    <g>
      <Table />
      <Vessel x={30} y={160} kind="beaker" level={0.7} color={mixColor([124, 58, 237], [255, 255, 255], clamp01((v[0] * tsim) / (v[0] * 10)) * 0.92, 0.75 - 0.35 * clamp01(tsim / 10))}><BeakerMarks /></Vessel>
      <Bubbles x={36} y={175} w={88} h={70} t={t} count={Math.round(4 + v[3] * 4)} />
      <Label x={80} y={316} size={13}>KMnO₄ + H₂C₂O₄</Label>
      <rect x="30" y="22" width="140" height="44" rx="8" fill="#fff" stroke={INK} strokeWidth="3" />
      <Label x={100} y={52} size={22}>t = {fmt(tsim, 1)} min</Label>
      <Plot x={250} y={40} w={230} h={190} xMax={10} yMax={yMax} xLabel="Temps t (min)" yLabel="Quantité transformée (mmol/L)">
        {(px, py) => (
          <g>
            {v.map((vi, i) => (
              <g key={labels[i]}>
                <line x1={px(0)} y1={py(0)} x2={px(tsim)} y2={py(vi * tsim)} stroke={colors[i]} strokeWidth="3.5" strokeLinecap="round" />
                {tsim > 1 && <Label x={px(tsim) - 4} y={py(vi * tsim) + (i === 0 ? 16 : -6)} size={11} anchor="end" color={colors[i]}>{labels[i]}</Label>}
              </g>
            ))}
          </g>
        )}
      </Plot>
    </g>
  );
};

// ─── Rendement d’une estérification ───────────────────────────

const rendementEsterification: Scene = ({ ex, params, t, n }) => {
  const s = [0, 1, 2, 3].map(i => step(t, n, i));
  const tsim = 60 * s[2];
  const frac = 67 * (1 - Math.exp(-tsim / 12));
  const m = ex.value(params, 'm');
  const heating = s[2] > 0 && s[3] === 0;
  return (
    <g>
      <Table />
      <g transform="translate(0 -20)">
        <rect x="88" y="20" width="24" height="120" rx="4" fill="rgba(180,215,240,0.5)" stroke={INK} strokeWidth="3" />
        {heating && <Label x={100} y={12} size={12}>eau froide</Label>}
        <Vessel x={40} y={120} kind="ballon" level={0.4 * ease(s[0] * 2 > 1 ? 1 : s[0] * 2)} color={mixColor([245, 240, 200], [215, 232, 248], frac / 67, 0.85)} />
        <Flame x={100} y={278} on={heating} t={t} />
        {heating && <Bubbles x={60} y={190} w={80} h={70} t={t} count={9} />}
        {s[1] > 0 && s[1] < 1 && <Drops x={100} y0={-10} y1={100} t={t} rate={4} color="#c02d1c" />}
      </g>
      <Label x={100} y={316} size={13}>Chauffage à reflux</Label>
      <Plot x={270} y={36} w={200} h={160} xMax={60} yMax={100} xLabel="Temps (min)" yLabel="Ester formé (% du maximum)">
        {(px, py) => (
          <g>
            <line x1="0" x2="200" y1={py(100)} y2={py(100)} stroke="#46526a" strokeDasharray="6 4" />
            <Label x={198} y={py(100) + 14} size={11} anchor="end" color="#46526a">réaction totale</Label>
            <line x1="0" x2="200" y1={py(67)} y2={py(67)} stroke="#127546" strokeDasharray="3 3" />
            <Label x={198} y={py(67) - 5} size={11} anchor="end" color="#127546">équilibre : 67 %</Label>
            <polyline points={Array.from({ length: Math.round(tsim) + 1 }, (_, i) => `${px(i)},${py(67 * (1 - Math.exp(-i / 12)))}`).join(' ')} fill="none" stroke="#1e44c4" strokeWidth="3.5" />
            <circle cx={px(tsim)} cy={py(frac)} r="6" fill="#1e44c4" stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </Plot>
      <g transform="translate(290 254)">
        <rect x="0" y="0" width="170" height="40" rx="8" fill="#fff" stroke={INK} strokeWidth="3" />
        <Label x={160} y={28} size={20} anchor="end">{s[3] > 0 ? `${fmt(m * ease(s[3]), 2)} g` : '0,00 g'}</Label>
        <Label x={10} y={26} size={12} anchor="start">Balance</Label>
      </g>
    </g>
  );
};

// ─── Saponification ───────────────────────────────────────────

const saponification: Scene = ({ ex, params, t, n }) => {
  const s = [0, 1, 2, 3].map(i => step(t, n, i));
  const m = ex.value(params, 'mSavon');
  const heating = s[1] > 0 && s[2] === 0;
  const pour = bump(s[2], 0.05, 0.85);
  const tilt = -38 * pour;
  const cloudy = ease(s[1]);
  const flaskLevel = s[2] > 0 ? 0.55 * (1 - ease(seg(s[2], 0.2, 0.9))) : 0.55 * ease(s[0]);
  const blobs = [[330, 215], [365, 222], [395, 212], [345, 232], [380, 238], [410, 226]];
  return (
    <g>
      <Table />
      <g transform="translate(0 -14)">
        {heating && <rect x="88" y="14" width="24" height="108" rx="4" fill="rgba(180,215,240,0.5)" stroke={INK} strokeWidth="3" />}
        <Vessel x={40} y={120} kind="ballon" level={flaskLevel} color={mixColor([232, 197, 71], [248, 244, 232], cloudy, 0.9)} tilt={tilt} />
        <Flame x={100} y={278} on={heating} t={t} />
        {heating && <Bubbles x={60} y={190} w={80} h={70} t={t} count={9} />}
      </g>
      {s[0] > 0 && s[0] < 1 && <Label x={100} y={96} size={13}>huile + éthanol + soude</Label>}
      <Label x={100} y={316} size={13}>Ballon à reflux</Label>
      {pour > 0.3 && <path d={`M150 150 Q190 160 ${300} 190`} fill="none" stroke="rgba(248,244,232,0.95)" strokeWidth="8" strokeLinecap="round" />}
      <Vessel x={290} y={160} kind="beaker" level={0.35 + 0.35 * ease(s[2])} color="rgba(190,215,240,0.55)"><BeakerMarks /></Vessel>
      <Label x={340} y={316} size={13}>Eau salée</Label>
      {blobs.map(([x, y], i) => <circle key={i} cx={x} cy={y - 40 * (1 - ease(seg(s[2], 0.5, 1))) * 0} r={11 - (i % 3) * 2} fill="#f8f4e8" stroke="#c9b98a" strokeWidth="2" opacity={ease(seg(s[2], 0.5 + i * 0.07, 0.9))} />)}
      <g opacity={ease(s[3])}>
        <rect x="400" y="240" width="70" height="42" rx="12" fill="#f3ecd2" stroke="#b9a66a" strokeWidth="3" />
        <Label x={435} y={266} size={14}>savon</Label>
        <Label x={435} y={298} size={15} color="#c02d1c">m = {fmt(m * ease(s[3]), 2)} g</Label>
      </g>
    </g>
  );
};

// ─── Dosage de l’éthanol dans un vin ──────────────────────────

const dosageVin: Scene = ({ ex, params, variantId, answer, t, n }) => {
  const s = [0, 1, 2, 3, 4, 5].map(i => step(t, n, i));
  const V4 = ex.value(params, 'V4');
  const pour = variantId === 'A' ? answer : V4;
  const vcur = pour * ease(s[5]);
  const green: RGB = [47, 107, 58];
  const wine: RGB = [122, 31, 61];
  const orange: RGB = [224, 122, 31];
  const reached = clamp01((vcur - V4 + 0.1) / 0.2);
  const color =
    s[5] > 0 ? mixColor(green, wine, reached, 0.9)
    : s[4] > 0 ? mixColor(orange, green, ease(s[4]), 0.9)
    : s[3] > 0 ? mixColor([240, 244, 250], orange, ease(s[3]), 0.9)
    : 'rgba(200,215,240,0.6)';
  const level = 0.25 * ease(s[2]) + 0.4 * ease(s[3]) + 0.05 * ease(s[5]);
  return (
    <g>
      <Table />
      {/* Distillation (étapes 1 et 2) */}
      <g opacity={1 - ease(seg(s[2], 0, 0.5))}>
        <Vessel x={20} y={140} kind="ballon" level={0.5 * (1 - 0.5 * s[0])} color="rgba(122,31,61,0.7)" />
        <path d="M70 140 L110 106 H200 V128" fill="none" stroke={INK} strokeWidth="3" />
        {s[0] > 0 && s[0] < 1 && <Bubbles x={40} y={210} w={80} h={60} t={t} count={7} />}
        <Vessel x={150} y={128} kind="fiole" level={0.1 + 0.55 * ease(s[0]) - 0.2 * s[1]} color="rgba(220,200,180,0.55)" />
        <Vessel x={250} y={128} kind="fiole" level={0.55 * ease(s[1])} color="rgba(220,200,180,0.25)" />
        <Label x={200} y={318} size={13}>S₁</Label>
        <Label x={300} y={318} size={13}>S₂ (S₁ diluée ×10)</Label>
      </g>
      <g opacity={ease(seg(s[2], 0, 0.5))}>
        <Vessel x={70} y={170} kind="erlenmeyer" level={level} color={color} />
        <Label x={125} y={316} size={13}>Erlenmeyer</Label>
        {s[2] > 0 && s[2] < 0.6 && <Pipette x={125} y={40} level={0.8 * (1 - seg(s[2], 0.2, 0.6))} color="rgba(120,170,225,0.9)" />}
        {s[4] > 0 && s[5] === 0 && <Label x={125} y={150} size={14} color="#c02d1c">{fmt(15 * s[4], 0)} min</Label>}
        <Burette x={300} y={20} level={0.94 - 0.8 * (vcur / 50)} color="rgba(60,130,60,0.7)" flow={s[5] > 0 && s[5] < 1} t={t} />
        <Label x={307} y={250} size={13}>Sel de Mohr</Label>
        <g transform="translate(360 40)">
          <rect x="0" y="0" width="110" height="46" rx="8" fill="#fff" stroke={INK} strokeWidth="3" />
          <Label x={100} y={32} size={20} anchor="end">{fmt(vcur, 2)} mL</Label>
        </g>
        {s[5] > 0.98 && <Label x={415} y={118} size={15} color={vcur >= V4 - 0.05 ? '#7a1f3d' : '#2f6b3a'}>{vcur >= V4 - 0.05 ? 'Virage !' : 'Pas encore virée'}</Label>}
      </g>
    </g>
  );
};

// ─── Dosage par le permanganate ───────────────────────────────

const dosagePermanganate: Scene = ({ ex, params, variantId, answer, t, n }) => {
  const s = [0, 1, 2, 3].map(i => step(t, n, i));
  const Ve = ex.value(params, 'Ve');
  const pour = variantId === 'A' ? answer : Ve;
  const vcur = pour * ease(s[2]);
  const over = vcur - Ve;
  const flash = ((t * 40) % 1) < 0.3 ? 0.4 * (1 - ((t * 40) % 1) / 0.3) : 0;
  const color =
    over >= 0 ? `rgba(212,106,168,${Math.min(0.75, 0.3 + over * 1.5)})`
    : s[2] > 0 && s[2] < 1 ? `rgba(124,58,237,${flash})`
    : 'rgba(240,244,250,0.5)';
  return (
    <g>
      <Table y={312} />
      <rect x="62" y="296" width="126" height="12" rx="4" fill={s[0] > 0 ? '#e56b2c' : '#46526a'} />
      <Vessel x={70} y={166} kind="erlenmeyer" level={0.35 * ease(seg(s[0], 0, 0.6)) + 0.04 * ease(s[2])} color={color} />
      <Label x={125} y={326} size={13}>Acide oxalique acidifié, 60 °C</Label>
      {s[0] > 0 && <Bubbles x={80} y={230} w={90} h={50} t={t} count={4} />}
      <Burette x={300} y={20} level={0.94 * ease(s[1]) - 0.7 * (vcur / Math.max(pour, 1)) * (pour / 50) * ease(s[1])} color="rgba(124,58,237,0.85)" flow={s[2] > 0 && s[2] < 1} t={t} />
      <Label x={307} y={250} size={13}>KMnO₄ 0,020 mol/L</Label>
      <g transform="translate(360 40)">
        <rect x="0" y="0" width="110" height="46" rx="8" fill="#fff" stroke={INK} strokeWidth="3" />
        <Label x={100} y={32} size={20} anchor="end">{fmt(vcur, 2)} mL</Label>
      </g>
      {s[3] > 0 && <Label x={415} y={118} size={15} color={over >= -0.05 ? '#a8326f' : '#46526a'}>{over >= -0.05 ? 'Rose persistant' : 'Toujours incolore'}</Label>}
    </g>
  );
};

/** Une scène de simulation par exercice de calcul. */
export const SCENES: Record<string, Scene> = {
  'dilution-commerciale': dilutionCommerciale,
  'produit-ionique': produitIonique,
  'constante-acidite': constanteAcidite,
  predominance,
  'solution-tampon': tampon,
  'vitesse-formation': vitesseFormation,
  'vitesses-stoechiometrie': vitessesStoechiometrie,
  'rendement-esterification': rendementEsterification,
  saponification,
  'dosage-ethanol-vin': dosageVin,
  'dosage-permanganate': dosagePermanganate,
};
