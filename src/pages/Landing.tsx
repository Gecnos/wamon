import { Link } from 'react-router-dom';
import { LinkButton } from '../ui/Button';
import { ArrowRight, Board, Flask } from '../ui/icons';
import { STEPS } from '../features/seance/logic';

function SessionPreview() {
  return (
    <div className="relative rounded-3xl border border-line bg-surface p-5 shadow-[0_20px_60px_-30px_rgba(14,34,25,0.45)] sm:p-7" aria-hidden="true">
      <div className="flex items-center justify-between text-sm font-semibold text-ink-2">
        <span>Séance · Dosage acide fort / base forte</span>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-brand-strong">Étape 1 sur 4</span>
      </div>
      <p className="mt-5 text-xl font-bold leading-snug text-ink sm:text-2xl">Calculer le volume équivalent V<sub>e</sub> de soude nécessaire pour doser cet acide.</p>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {[['Ca', '0,1', 'mol/L'], ['Va', '20', 'mL'], ['Cb', '0,1', 'mol/L']].map(([symbol, value, unit]) => (
          <div key={symbol} className="rounded-xl bg-sunken p-3">
            <p className="font-mono text-sm text-ink-2">{symbol}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-ink sm:text-2xl">{value} <span className="text-sm font-semibold text-ink-2">{unit}</span></p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex flex-1 flex-col gap-1.5">
            <span className={`h-1.5 rounded-full ${i === 0 ? 'bg-brand' : 'bg-line'}`} />
            <span className={`hidden text-xs font-semibold sm:block ${i === 0 ? 'text-brand-strong' : 'text-ink-2'}`}>{step.short}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-ink-2">
            <Board size={16} className="text-brand" /> Pour les enseignants de physique-chimie
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Vos exercices de chimie, vérifiés <span className="text-brand">par l’expérience.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
            Projetez un énoncé, laissez la classe calculer, puis réalisez le dosage devant elle. Les élèves voient si leur résultat tient debout — même sans laboratoire équipé ni connexion.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton to="/seance/enonce" size="lg">Préparer une séance <ArrowRight /></LinkButton>
            <LinkButton to="/labo" size="lg" variant="secondary">Manipuler librement</LinkButton>
          </div>
          <p className="mt-4 text-sm text-ink-2">Gratuit, libre et utilisable hors ligne. Aucun compte à créer.</p>
        </div>
        <SessionPreview />
      </section>

      <section aria-labelledby="deroule" className="border-t border-line py-12 sm:py-16">
        <h2 id="deroule" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Une séance se déroule en quatre temps</h2>
        <p className="mt-2 max-w-2xl text-ink-2">Wamon vous guide d’une étape à l’autre. À chaque écran, un seul bouton principal vous dit quoi faire ensuite.</p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.id} className="rounded-2xl border border-line bg-surface p-5">
              <span className="grid size-10 place-items-center rounded-full bg-brand text-lg font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold text-ink">{step.label}</h3>
              <p className="mt-1 text-ink-2">{step.hint}.</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="modes" className="border-t border-line py-12 sm:py-16">
        <h2 id="modes" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Deux façons de travailler</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Link to="/seance/enonce" className="group rounded-3xl border-2 border-brand bg-brand-soft p-6 transition-colors hover:bg-[#d3e5d8] sm:p-8">
            <Board size={32} className="text-brand" />
            <h3 className="mt-4 text-xl font-bold text-ink sm:text-2xl">Séance guidée</h3>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-strong">L’enseignant projette, la classe cherche</p>
            <p className="mt-3 text-ink-2">Vous choisissez les données, la classe calcule, vous saisissez sa réponse puis lancez le dosage. Wamon compare le résultat au modèle et aide à discuter les écarts entre groupes.</p>
            <span className="mt-5 inline-flex items-center gap-2 font-bold text-brand-strong">Commencer une séance <ArrowRight className="transition-transform group-hover:translate-x-1" /></span>
          </Link>
          <Link to="/labo" className="group rounded-3xl border-2 border-line bg-surface p-6 transition-colors hover:border-line-strong sm:p-8">
            <Flask size={32} className="text-accent" />
            <h3 className="mt-4 text-xl font-bold text-ink sm:text-2xl">Labo libre</h3>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-accent">Chacun manipule à son rythme</p>
            <p className="mt-3 text-ink-2">Choisissez l’acide, la base, les concentrations et l’indicateur. Versez goutte à goutte, relevez vos mesures et tracez votre propre courbe — sur ordinateur, tablette ou téléphone.</p>
            <span className="mt-5 inline-flex items-center gap-2 font-bold text-accent">Ouvrir la paillasse <ArrowRight className="transition-transform group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="experiences" className="border-t border-line py-12 sm:py-16">
        <h2 id="experiences" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Expériences disponibles</h2>
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          <li>
            <Link to="/seance/enonce" className="flex items-center gap-4 p-5 hover:bg-paper">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Flask /></span>
              <span className="min-w-0 flex-1"><span className="block font-bold text-ink">Dosage d’un acide fort par une base forte</span><span className="block text-sm text-ink-2">Chimie · 1re et terminale · burette, bécher, indicateurs colorés, courbe pH</span></span>
              <span className="hidden rounded-full bg-ok-soft px-3 py-1 text-sm font-semibold text-ok sm:inline">Disponible</span>
              <ArrowRight className="text-ink-2" />
            </Link>
          </li>
          <li className="flex items-center gap-4 p-5 text-ink-2">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sunken"><Flask /></span>
            <span className="min-w-0 flex-1"><span className="block font-bold">Dilution d’une solution mère</span><span className="block text-sm">Chimie · 2de · pipette et fiole jaugées</span></span>
            <span className="rounded-full bg-sunken px-3 py-1 text-sm font-semibold">En préparation</span>
          </li>
        </ul>
        <p className="mt-4 text-ink-2">Un exercice qui marche bien avec vos élèves ? <Link to="/contribuer" className="font-semibold text-ink underline underline-offset-4">Proposez-le</Link>.</p>
      </section>
    </div>
  );
}
