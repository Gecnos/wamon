import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EXERCISES, LEVEL_LABELS } from '../exercises';
import { STEPS } from '../features/seance/logic';
import { TitrationCurve } from '../features/titration/TitrationCurve';
import { fmt } from '../lib/format';
import { titrationPoint } from '../models/titration';
import { CONTACT_EMAIL, mailto } from '../lib/contact';
import { LinkButton } from '../ui/Button';
import { ArrowRight } from '../ui/icons';

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
      <path d="M22 40 V128 a10 10 0 0 0 10 10 H88 a10 10 0 0 0 10 -10 V40" fill="none" stroke="#46526a" strokeWidth="3" />
      <path d="M24 70 V128 a8 8 0 0 0 8 8 H88 a8 8 0 0 0 8 -8 V70 Z" style={{ fill: color, transition: 'fill 300ms ease' }} />
      <path d="M16 40 H104" stroke="#46526a" strokeWidth="3" strokeLinecap="round" />
      {/* Burette au-dessus */}
      <rect x="55" y="0" width="10" height="26" fill="none" stroke="#46526a" strokeWidth="2.5" />
      <path d="M60 26 V36" stroke="#46526a" strokeWidth="2" />
    </svg>
  );
}

function HeroDemo() {
  const volume = useDemoVolume();
  const reading = titrationPoint(DEMO, volume, 'btb');
  return (
    <figure className="m-0 overflow-hidden rounded-2xl border border-line bg-sunken shadow-[0_24px_60px_-36px_rgba(19,32,58,0.5)]">
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-end gap-2 p-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:p-6">
        <div className="h-32 sm:h-40"><Beaker color={reading.color} /></div>
        <div className="rounded-xl bg-surface/85 p-2 backdrop-blur-[1px]">
          <TitrationCurve title="Démonstration : courbe de dosage" {...DEMO} maxVb={DEMO_MAX} currentVb={volume} showTheory={false} />
        </div>
      </div>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line bg-surface px-4 py-3 sm:px-6">
        <span className="font-mono text-lg tabular-nums text-ink">V = {fmt(volume, 1)} mL, pH = {fmt(reading.pH, 1)}</span>
        <span className="text-[0.95rem] text-ink-2">Le bleu de bromothymol vire au vert à l’équivalence.</span>
      </figcaption>
    </figure>
  );
}

export default function Landing() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <div>
          <p className="text-lg font-semibold text-encre">Pour les professeurs de physique-chimie</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl">
            Vos élèves calculent. L’expérience tranche.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Projetez un exercice, laissez la classe chercher, puis faites l’expérience devant elle : tout le monde voit si le résultat tient. Il suffit d’un ordinateur et d’un vidéoprojecteur, sans laboratoire équipé et sans connexion.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton to="/exercices" size="lg">Préparer une séance</LinkButton>
            <LinkButton to="/guide" size="lg" variant="secondary">Comment ça se passe en classe</LinkButton>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section aria-labelledby="deroule" className="border-t border-line py-14 sm:py-20">
        <h2 id="deroule" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Une séance, quatre temps</h2>
        <p className="mt-2 max-w-2xl text-lg text-ink-2">À chaque écran, un seul bouton principal vous indique la suite. Le bouton « retour » du navigateur revient à l’étape précédente sans rien perdre.</p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {STEPS.map((step, i) => (
            <li key={step.id} className="relative lg:pr-8">
              {i < STEPS.length - 1 && <span aria-hidden="true" className="absolute top-5 left-12 hidden h-0.5 w-[calc(100%-3rem)] bg-line lg:block" />}
              <span className="relative grid size-10 place-items-center rounded-full bg-encre text-lg font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 text-xl font-bold text-ink">{step.label}</h3>
              <p className="mt-1 text-ink-2">{step.hint}.</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="exercices" className="border-t border-line py-14 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="exercices" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Des exercices du programme</h2>
            <p className="mt-2 max-w-2xl text-lg text-ink-2">De la seconde à la terminale. Chacun se règle avec vos propres données ou des valeurs tirées au hasard.</p>
          </div>
          <Link to="/exercices" className="inline-flex min-h-11 items-center gap-2 font-bold text-encre">Tous les exercices <ArrowRight size={18} /></Link>
        </div>
        <ul className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {EXERCISES.map(ex => (
            <li key={ex.id}>
              <Link to={`/seance/${ex.id}/enonce`} className="group block h-full rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong">
                <span className="block text-[0.95rem] font-semibold text-encre">{ex.levels.map(l => LEVEL_LABELS[l]).join(', ')}</span>
                <span className="mt-0.5 block text-xl font-bold text-ink">{ex.title}</span>
                <span className="mt-1 block text-ink-2">{ex.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="labo" className="grid gap-8 border-t border-line py-14 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 id="labo" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Et pour les élèves, un labo libre</h2>
          <p className="mt-3 text-lg text-ink-2">
            Sur ordinateur, tablette ou téléphone, chaque élève choisit l’acide, la base, les concentrations et l’indicateur, verse goutte à goutte et relève ses mesures pour construire sa propre courbe.
          </p>
          <LinkButton to="/labo" variant="secondary" className="mt-6">Ouvrir le labo libre</LinkButton>
        </div>
        <div className="rounded-2xl bg-encre p-6 text-white sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Une idée d’exercice, une question&nbsp;?</h2>
          <p className="mt-3 text-lg text-white/85">
            Écrivez-nous : décrivez l’exercice avec vos mots, ou dites-nous ce qui manque à votre classe. Nous vous répondons.
          </p>
          <a href={mailto('Wamon : proposition ou question')} className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-white px-5 font-bold text-encre-strong transition-transform duration-150 active:scale-[0.97]">{CONTACT_EMAIL}</a>
        </div>
      </section>
    </div>
  );
}
