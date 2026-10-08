import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EXERCISES, LEVEL_LABELS } from '../exercises';
import { STEPS } from '../features/seance/logic';
import { Readout } from '../features/titration/Readout';
import { TitrationCurve } from '../features/titration/TitrationCurve';
import { titrationPoint } from '../models/titration';
import { CONTACT_EMAIL, mailto } from '../lib/contact';
import { buttonClass, LinkButton } from '../ui/Button';
import { Ruler } from '../ui/Ruler';

const DEMO = { Ca: 0.1, Va: 20, Cb: 0.1 };
const DEMO_MAX = 25;
const DURATION_MS = 9000;

/** Volume versé qui avance en boucle ; figé à la fin si l’utilisateur limite les animations. */
function useDemoVolume() {
  const [volume, setVolume] = useState(DEMO_MAX);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = ((now - start) % (DURATION_MS + 2500)) / DURATION_MS;
      // Ralentit près de l’équivalence, comme un opérateur attentif.
      const eased = t >= 1 ? 1 : t < 0.5 ? t * 1.5 : 0.75 + (t - 0.5) * 0.5;
      setVolume(Math.min(DEMO_MAX, eased * DEMO_MAX));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return volume;
}

function Beaker({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 150" className="h-full w-auto" aria-hidden="true">
      <path d="M22 40 V128 a10 10 0 0 0 10 10 H88 a10 10 0 0 0 10 -10 V40" fill="none" stroke="#14171c" strokeWidth="3" />
      <path d="M24 70 V128 a8 8 0 0 0 8 8 H88 a8 8 0 0 0 8 -8 V70 Z" style={{ fill: color, transition: 'fill 300ms ease' }} />
      <path d="M16 40 H104" stroke="#14171c" strokeWidth="3" strokeLinecap="round" />
      {/* Graduations du bécher */}
      {[60, 80, 100, 120].map(y => <path key={y} d={`M22 ${y} h${y % 40 === 0 ? 12 : 7}`} stroke="#14171c" strokeWidth="2" />)}
      {/* Burette au-dessus */}
      <rect x="55" y="0" width="10" height="26" fill="none" stroke="#14171c" strokeWidth="2.5" />
      <path d="M60 26 V36" stroke="#14171c" strokeWidth="2" />
    </svg>
  );
}

/** Panneau de mesure : le même relevé que celui projeté en séance. */
function HeroDemo() {
  const volume = useDemoVolume();
  const reading = titrationPoint(DEMO, volume, 'btb');
  return (
    <figure className="m-0 overflow-hidden rounded-lg border-2 border-ink bg-surface">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-ink px-4 py-3 text-white sm:px-5">
        <span className="font-bold">Démonstration : dosage d’un acide fort par une base forte</span>
        <span className="text-sm text-white/80">Bleu de bromothymol, 0,10 mol/L</span>
      </figcaption>
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-end gap-3 p-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:p-5">
        <div className="h-32 sm:h-44"><Beaker color={reading.color} /></div>
        <TitrationCurve title="Démonstration : courbe de dosage" {...DEMO} maxVb={DEMO_MAX} currentVb={volume} showTheory={false} />
      </div>
      <div className="border-t-2 border-ink">
        <Readout volume={volume} maxVb={DEMO_MAX} pH={reading.pH} color={reading.color} colorLabel={reading.colorLabel} />
      </div>
    </figure>
  );
}

export default function Landing() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid items-center gap-10 py-10 sm:py-14 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:gap-12">
        <div>
          <h1 className="text-4xl font-bold leading-[1.04] tracking-[-0.03em] text-balance text-ink sm:text-5xl lg:text-6xl">
            Vos élèves calculent. L’expérience tranche.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Wamon est fait pour les professeurs de physique-chimie. Projetez un exercice, laissez la classe chercher, puis faites l’expérience devant elle : tout le monde voit si le résultat tient. Il suffit d’un ordinateur et d’un vidéoprojecteur, sans laboratoire équipé et sans connexion.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkButton to="/exercices" size="lg" className="whitespace-nowrap">Préparer une séance</LinkButton>
            <LinkButton to="/guide" size="lg" variant="secondary" className="whitespace-nowrap">Voir le déroulé en classe</LinkButton>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section aria-labelledby="deroule" className="py-12 sm:py-16">
        <h2 id="deroule" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Une séance, quatre temps</h2>
        <p className="mt-2 max-w-2xl text-lg text-ink-2">À chaque écran, un seul bouton orange vous indique la suite. Le bouton « retour » du navigateur revient à l’étape précédente sans rien perdre.</p>
        <Ruler className="mt-8" majors={4} minors={8} progress={1} />
        <ol className="grid gap-8 pt-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, i) => (
            <li key={step.id}>
              <span className="grid size-12 place-items-center rounded-md bg-ink text-2xl font-bold tabular-nums text-white">{i + 1}</span>
              <h3 className="mt-4 text-xl font-bold text-ink">{step.label}</h3>
              <p className="mt-1 text-ink-2">{step.hint}.</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="exercices" className="py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="exercices" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Des exercices du programme</h2>
            <p className="mt-2 max-w-2xl text-lg text-ink-2">De la seconde à la terminale. Chacun se règle avec vos propres données ou des valeurs tirées au hasard.</p>
          </div>
          <Link to="/exercices" className="inline-flex min-h-11 items-center font-bold text-mesure underline underline-offset-4">Tous les exercices</Link>
        </div>
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-lg border-2 border-ink">
          {EXERCISES.map(ex => (
            <li key={ex.id}>
              <Link to={`/seance/${ex.id}/enonce`} className="grid gap-1 p-4 transition-colors hover:bg-sunken sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6 sm:p-5">
                <span className="font-bold text-mesure">{ex.levels.map(l => LEVEL_LABELS[l]).join(', ')}</span>
                <span>
                  <span className="block text-xl font-bold text-ink">{ex.title}</span>
                  <span className="mt-1 block text-ink-2">{ex.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="labo" className="grid gap-5 pb-14 sm:pb-20 lg:grid-cols-2">
        <div className="rounded-lg border-2 border-ink p-6 sm:p-8">
          <h2 id="labo" className="text-2xl font-bold tracking-tight text-ink">Et pour les élèves, un labo libre</h2>
          <p className="mt-3 text-lg text-ink-2">
            Sur ordinateur, tablette ou téléphone, chaque élève choisit l’acide, la base, les concentrations et l’indicateur, verse goutte à goutte et relève ses mesures pour construire sa propre courbe.
          </p>
          <LinkButton to="/labo" variant="secondary" className="mt-6">Ouvrir le labo libre</LinkButton>
        </div>
        <div className="rounded-lg bg-ink p-6 text-white sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Une idée d’exercice, une question&nbsp;?</h2>
          <p className="mt-3 text-lg text-white/85">
            Écrivez-nous : décrivez l’exercice avec vos mots, ou dites-nous ce qui manque à votre classe. Nous vous répondons.
          </p>
          <a href={mailto('Wamon : proposition ou question')} className={buttonClass('primary', 'md', 'mt-6 border-signal')}>{CONTACT_EMAIL}</a>
        </div>
      </section>
    </div>
  );
}
