import type { CSSProperties } from 'react';
import type { PreparationExercise } from '../../exercises';
import { fmt } from '../../lib/format';
import { tint } from '../../models/preparation';

/*
 * Paillasse de préparation de solution (dilution ou dissolution).
 * Toutes les animations passent par `transform` et `opacity` : elles restent
 * fluides même sur un vieil ordinateur relié au vidéoprojecteur.
 */

interface PreparationBenchProps {
  ex: PreparationExercise;
  /** Étape du protocole atteinte (0 = rien n’a été fait). */
  stage: number;
  /** Volume prélevé (mL) ou masse pesée (g). */
  amount: number;
  /** Concentration finale obtenue. */
  obtained: number;
  /** Concentration de la teinte témoin. */
  expected: number;
  expectedLabel: string;
  /** Dilution : concentration de la solution mère. */
  motherConcentration?: number;
  /** Fraction de la fiole occupée par le prélèvement (dilution). */
  pouredFraction?: number;
}

// Géométrie de la fiole jaugée (viewBox 0 0 560 400).
const FIOLE = { cx: 300, bulbCy: 300, r: 64, neckX: 288, neckW: 24, neckTop: 70, jauge: 118, bottom: 364 };
const EASE = 'cubic-bezier(0.77, 0, 0.175, 1)';

/** Hauteur du liquide pour une fraction du volume de la fiole (1 = trait de jauge). */
function levelY(fraction: number): number {
  const bulbTop = FIOLE.bulbCy - FIOLE.r + 6;
  if (fraction <= 0) return FIOLE.bottom + 2;
  if (fraction <= 0.9) return FIOLE.bottom - (fraction / 0.9) * (FIOLE.bottom - bulbTop);
  return bulbTop - ((fraction - 0.9) / 0.1) * (bulbTop - FIOLE.jauge);
}

const move = (y: number, ms = 900): CSSProperties => ({ transform: `translateY(${y}px)`, transition: `transform ${ms}ms ${EASE}` });
const fade = (on: boolean, ms = 500): CSSProperties => ({ opacity: on ? 1 : 0, transition: `opacity ${ms}ms ease` });

export function PreparationBench({ ex, stage, amount, obtained, expected, expectedLabel, motherConcentration = 0.1, pouredFraction = 0.1 }: PreparationBenchProps) {
  const color = (C: number) => tint(ex.solute.rgb, C, ex.solute.Cscale);
  const isDilution = ex.method === 'dilution';

  // Niveau et teinte dans la fiole selon l’étape.
  let fraction = 0;
  let fioleColor = color(obtained);
  let stirred = true;
  if (isDilution) {
    if (stage >= 2) fraction = Math.min(0.9, Math.max(0.02, pouredFraction)); // solution mère versée
    if (stage >= 3) { fraction = 1; stirred = false; }
    if (stage >= 4) stirred = true;
    if (stage === 2) fioleColor = color(motherConcentration);
  } else {
    if (stage >= 2) fraction = 0.03; // solide + eau de rinçage
    if (stage >= 3) { fraction = 0.75; fioleColor = color(obtained / 0.75); }
    if (stage >= 4) { fraction = 1; fioleColor = color(obtained); }
  }
  const finished = stage >= 4;
  const liquidY = levelY(fraction) - FIOLE.neckTop;

  return (
    <svg viewBox="0 0 560 400" className="h-full w-full" role="img" aria-label={`Paillasse : ${isDilution ? 'pipette jaugée et fiole jaugée' : 'balance et fiole jaugée'}, avec un tube témoin`}>
      <defs>
        <clipPath id="prep-fiole">
          <circle cx={FIOLE.cx} cy={FIOLE.bulbCy} r={FIOLE.r - 3} />
          <rect x={FIOLE.neckX + 2} y={FIOLE.neckTop} width={FIOLE.neckW - 4} height={FIOLE.bulbCy - FIOLE.neckTop} />
        </clipPath>
        <linearGradient id="prep-unstirred" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color(obtained * 0.15)} />
          <stop offset="0.7" stopColor={color(obtained * 1.2)} />
          <stop offset="1" stopColor={color(obtained * 3)} />
        </linearGradient>
      </defs>

      {/* Paillasse */}
      <line x1="20" x2="540" y1="372" y2="372" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

      {isDilution ? <DilutionTools stage={stage} amount={amount} motherColor={color(motherConcentration)} /> : <DissolutionTools stage={stage} amount={amount} crystal={`rgb(${ex.solute.rgb.join(',')})`} />}

      {/* Fiole jaugée : liquide */}
      <g clipPath="url(#prep-fiole)">
        <rect x={FIOLE.cx - FIOLE.r} y={FIOLE.neckTop} width={FIOLE.r * 2} height={FIOLE.bottom - FIOLE.neckTop + 4} style={{ ...move(liquidY), fill: fioleColor, transition: `transform 900ms ${EASE}, fill 700ms ease` }} />
        <rect x={FIOLE.cx - FIOLE.r} y={FIOLE.neckTop} width={FIOLE.r * 2} height={FIOLE.bottom - FIOLE.neckTop + 4} fill="url(#prep-unstirred)" style={{ ...move(liquidY), opacity: stirred ? 0 : 1, transition: `transform 900ms ${EASE}, opacity 600ms ease` }} />
        {!isDilution && stage >= 2 && stage < 3 && (
          <g fill={`rgb(${ex.solute.rgb.join(',')})`}>
            {[0, 1, 2, 3, 4, 5, 6].map(i => <rect key={i} x={FIOLE.cx - 22 + i * 7} y={FIOLE.bottom - 8 - (i % 3) * 3} width="5" height="4" rx="1" />)}
          </g>
        )}
      </g>
      {/* Fiole jaugée : verre, trait de jauge, bouchon */}
      <g className={finished ? 'motion-safe:animate-shake' : ''} style={{ transformOrigin: `${FIOLE.cx}px ${FIOLE.bottom}px` }}>
        <path d={`M ${FIOLE.neckX} ${FIOLE.neckTop} V ${FIOLE.bulbCy - FIOLE.r + 8} A ${FIOLE.r} ${FIOLE.r} 0 1 0 ${FIOLE.neckX + FIOLE.neckW} ${FIOLE.bulbCy - FIOLE.r + 8} V ${FIOLE.neckTop}`} fill="none" stroke="currentColor" strokeWidth="2.5" />
        <line x1={FIOLE.neckX - 6} x2={FIOLE.neckX + FIOLE.neckW + 6} y1={FIOLE.jauge} y2={FIOLE.jauge} stroke="#c4281b" strokeWidth="2" />
        <text x={FIOLE.neckX + FIOLE.neckW + 12} y={FIOLE.jauge + 5} fontSize="14" fill="#c4281b" fontWeight="700">trait de jauge</text>
        <rect x={FIOLE.neckX - 3} y={FIOLE.neckTop - 16} width={FIOLE.neckW + 6} height="16" rx="3" fill="#838c9c" style={fade(finished)} />
      </g>
      <text x={FIOLE.cx} y="392" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">Fiole jaugée</text>

      {/* Tube témoin */}
      <g>
        <path d="M 468 150 V 330 a 22 22 0 0 0 44 0 V 150" fill={color(expected)} stroke="none" />
        <path d="M 462 120 H 518 M 468 120 V 330 a 22 22 0 0 0 44 0 V 120" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <text x="490" y="392" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">Témoin</text>
        <text x="490" y="104" textAnchor="middle" fontSize="13" fill="currentColor">{expectedLabel}</text>
      </g>
    </svg>
  );
}

function DilutionTools({ stage, amount, motherColor }: { stage: number; amount: number; motherColor: string }) {
  // La pipette part du flacon (x ≈ 110), prélève, puis vient au-dessus de la fiole.
  const overFiole = stage >= 2;
  const filled = stage === 1;
  return (
    <g>
      {/* Flacon de solution mère */}
      <path d="M 70 250 h 80 v 110 a 12 12 0 0 1 -12 12 h -56 a 12 12 0 0 1 -12 -12 Z" fill={motherColor} opacity="0.95" />
      <path d="M 90 210 h 40 v 40 h 20 v 110 a 12 12 0 0 1 -12 12 h -56 a 12 12 0 0 1 -12 -12 v -110 h 20 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x="110" y="392" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">Solution mère</text>

      {/* Pipette jaugée */}
      {/* Une fois vidée, la pipette est reposée : elle disparaît de la paillasse. */}
      <g style={{ transform: `translate(${overFiole ? 190 : 0}px, ${overFiole ? -120 : 0}px)`, opacity: stage >= 3 ? 0 : 1, transition: `transform 900ms ${EASE}, opacity 400ms ease` }}>
        <rect x="106" y="40" width="8" height="90" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="110" cy="160" rx="13" ry="30" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="107" y="190" width="6" height="90" fill="none" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="110" cy="160" rx="10" ry="27" fill={motherColor} style={{ ...fade(filled, 700), transformOrigin: '110px 187px' }} />
        <rect x="108.5" y="190" width="3" height="88" fill={motherColor} style={fade(filled, 700)} />
        <line x1="100" x2="120" y1="70" y2="70" stroke="#c4281b" strokeWidth="2" />
        <text x="126" y="60" fontSize="15" fontWeight="700" fill="currentColor">{fmt(amount, 1)} mL</text>
      </g>
    </g>
  );
}

function DissolutionTools({ stage, amount, crystal }: { stage: number; amount: number; crystal: string }) {
  const weighed = stage >= 1;
  const poured = stage >= 2;
  const pile = Math.min(1, Math.max(0.35, amount / 6));
  return (
    <g>
      {/* Balance */}
      <rect x="30" y="300" width="160" height="72" rx="10" fill="#f1f3f6" stroke="currentColor" strokeWidth="2.5" />
      <rect x="48" y="328" width="92" height="30" rx="4" fill="#14171c" />
      <text x="132" y="349" textAnchor="end" fontSize="18" fontFamily="'Atkinson Hyperlegible Mono Variable', monospace" fill="#8ff0b4">{weighed ? fmt(poured ? 0 : amount, 2) : '0,00'} g</text>
      <rect x="40" y="288" width="140" height="12" rx="3" fill="#cfd5df" stroke="currentColor" strokeWidth="2" />
      {/* Coupelle et cristaux */}
      <path d="M 70 288 q 40 -26 80 0 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <g style={{ ...fade(weighed && !poured, 400), transform: `scale(${pile})`, transformOrigin: '110px 286px', transition: `opacity 400ms ease, transform 700ms ${EASE}` }}>
        <path d="M 86 286 q 24 -30 48 0 Z" fill={crystal} />
      </g>
      <text x="110" y="392" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">Balance</text>
      {/* Entonnoir, visible pendant le transfert */}
      <path d="M 276 30 h 48 l -18 30 v 22 h -12 v -22 Z" fill="none" stroke="currentColor" strokeWidth="2" style={fade(stage === 2)} />
    </g>
  );
}
