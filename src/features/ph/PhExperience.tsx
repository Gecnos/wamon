import { useState } from 'react';
import type { Params, PhExercise } from '../../exercises';
import { fmt } from '../../lib/format';
import { universalColor } from '../../models/ph';
import { Button } from '../../ui/Button';
import { Check, Reset } from '../../ui/icons';
import { PhScale } from './PhScale';

interface Props {
  ex: PhExercise;
  params: Params;
  variantId: string;
  answer: number;
}

/** Paillasse : un bécher, la sonde du pH-mètre et son afficheur. */
function Bench({ stage, pH, color }: { stage: number; pH: number; color: string }) {
  const filled = stage >= 1;
  const probed = stage >= 2;
  const read = stage >= 3;
  const dyed = stage >= 4;
  return (
    <svg viewBox="0 0 320 240" className="h-auto w-full text-ink" role="img" aria-label={read ? `Bécher avec la sonde du pH-mètre, afficheur à ${fmt(pH, 2)}` : 'Bécher et pH-mètre'}>
      {/* Bécher */}
      <path d="M40 60 V200 a12 12 0 0 0 12 12 H148 a12 12 0 0 0 12 -12 V60" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M32 60 H168" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {[90, 120, 150, 180].map(y => <path key={y} d={`M40 ${y} h${y % 60 === 0 ? 18 : 10}`} stroke="currentColor" strokeWidth="2" />)}
      <path d="M42 100 V200 a10 10 0 0 0 10 10 H148 a10 10 0 0 0 10 -10 V100 Z" style={{ fill: filled ? (dyed ? color : 'rgba(180, 205, 230, 0.55)') : 'transparent', transition: 'fill 500ms ease' }} />
      {/* Sonde */}
      <g style={{ transform: probed ? 'translateY(0)' : 'translateY(-60px)', transition: 'transform 400ms cubic-bezier(0.23, 1, 0.32, 1)' }}>
        <rect x="92" y="20" width="16" height="130" rx="4" fill="#fff" stroke="currentColor" strokeWidth="3" />
        <rect x="95" y="150" width="10" height="26" rx="5" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
        <path d="M100 20 V6 H250" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* Afficheur */}
      <rect x="196" y="98" width="108" height="104" rx="8" fill="#fff" stroke="currentColor" strokeWidth="3" />
      <rect x="206" y="110" width="88" height="42" rx="4" fill="#14171c" />
      <text x="286" y="142" textAnchor="end" fontSize="30" fontWeight="700" fill="#ff5a1f" fontFamily="'Atkinson Hyperlegible Mono Variable', monospace">{read ? fmt(pH, 2) : '--.--'}</text>
      <text x="250" y="180" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">pH-mètre</text>
      <path d="M250 6 V98" stroke="currentColor" strokeWidth="3" fill="none" />
    </svg>
  );
}

export function PhExperience({ ex, params, variantId, answer }: Props) {
  const [stage, setStage] = useState(0);
  const exp = ex.experiment(params, variantId, answer);
  const steps = [
    `Verser ${fmt(exp.concentration, 4)} mol/L de ${ex.solute.name} dans un bécher`,
    'Rincer la sonde et la plonger dans la solution',
    'Attendre que la valeur se stabilise et lire le pH',
    'Ajouter l’indicateur universel et comparer les teintes',
  ];
  const done = stage >= steps.length;
  const close = Math.abs(exp.measured - exp.target) <= 0.1;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <section aria-label="Paillasse" className="grid gap-5 rounded-lg border-2 border-ink bg-surface p-4 sm:p-5">
        <div className="mx-auto w-full max-w-md rounded-md bg-sunken p-3">
          <Bench stage={stage} pH={exp.measured} color={universalColor(exp.measured)} />
        </div>
        <PhScale
          title="Échelle de pH aux teintes de l’indicateur universel"
          markers={[
            ...(stage >= 3 ? [{ label: 'Mesuré', value: exp.measured, color: '#14171c' }] : []),
            { label: exp.answerIsUsed ? 'Énoncé' : 'Classe', value: exp.target, color: '#ff5a1f' },
          ]}
        />
      </section>

      <section aria-labelledby="protocole-titre" className="rounded-lg border-2 border-ink bg-surface p-5 sm:p-6">
        <h3 id="protocole-titre" className="text-lg font-bold text-ink">Protocole</h3>
        <p className="mt-1 text-[0.95rem] text-ink-2">
          {exp.answerIsUsed
            ? 'On prépare la solution avec la concentration trouvée par la classe. Si elle est juste, le pH mesuré est celui de l’énoncé.'
            : 'On mesure le pH de la solution et on le compare à la valeur prévue par la classe.'}
        </p>
        <ol className="mt-5 grid gap-3">
          {steps.map((label, i) => {
            const isDone = i < stage;
            const isCurrent = i === stage;
            return (
              <li key={label} className={`flex items-start gap-3 rounded-md p-2 transition-colors duration-200 ${isCurrent ? 'bg-signal-soft' : ''}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-md text-sm font-bold ${isDone ? 'bg-vert text-white' : isCurrent ? 'bg-ink text-white' : 'border-2 border-line-strong text-ink-2'}`}>
                  {isDone ? <Check size={16} /> : i + 1}
                </span>
                <span className={`pt-1 text-[1.05rem] leading-snug ${isCurrent ? 'font-bold text-ink' : isDone ? 'text-ink-2 line-through decoration-ink-2/40' : 'text-ink-2'}`}>{label}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-5">
          {!done ? (
            <Button size="lg" className="w-full" onClick={() => setStage(s => s + 1)}>{steps[stage]}</Button>
          ) : (
            <div className="rounded-md border-2 border-ink bg-signal-soft p-4 text-ink">
              <p className="font-bold">
                pH mesuré : {fmt(exp.measured, 2)}. {exp.answerIsUsed ? 'L’énoncé annonce' : 'La classe avait prévu'} {fmt(exp.target, 2)}.
              </p>
              <p className="mt-1 text-[0.95rem]">{close ? 'Les deux valeurs concordent : la réponse tient.' : 'Les valeurs diffèrent : il y a une erreur à chercher (relation, signe, arrondi).'}</p>
            </div>
          )}
          {stage > 0 && <Button variant="ghost" className="mt-2 w-full" onClick={() => setStage(0)}><Reset size={18} /> Recommencer</Button>}
        </div>
      </section>
    </div>
  );
}
