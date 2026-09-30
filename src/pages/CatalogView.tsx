import { Link, Navigate, useParams } from 'react-router-dom';
import buretteData from '../data/catalog/burette.json';
import becherData from '../data/catalog/becher.json';
import erlenmeyerData from '../data/catalog/erlenmeyer.json';
import fioleData from '../data/catalog/fiole-jaugee.json';
import pipetteData from '../data/catalog/pipette-jaugee.json';
import statifData from '../data/catalog/statif.json';
import { renderEquipmentSVG } from '../components/svg';
import type { CatalogItem } from '../types';
import { ArrowLeft, ArrowRight } from '../ui/icons';

const ITEMS = [buretteData, becherData, erlenmeyerData, fioleData, pipetteData, statifData] as CatalogItem[];

const CATEGORIES: Record<string, string> = {
  'mesure-volume': 'Mesure de volume',
  'contenants-reaction': 'Contenant',
  'supports-accessoires': 'Support',
};

function Drawing({ item, className = '' }: { item: CatalogItem; className?: string }) {
  const svg = renderEquipmentSVG(item.schema, { width: 250, height: 300, showBurette: true });
  return <div className={`text-[#46594f] [&_svg]:mx-auto [&_svg]:h-full [&_svg]:w-auto ${className}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function Detail({ item }: { item: CatalogItem }) {
  const i = ITEMS.indexOf(item);
  const prev = ITEMS[(i - 1 + ITEMS.length) % ITEMS.length];
  const next = ITEMS[(i + 1) % ITEMS.length];

  return (
    <article className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link to="/materiel" className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink-2 hover:text-ink"><ArrowLeft size={18} /> Tout le matériel</Link>
      <div className="mt-4 grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="rounded-3xl border border-line bg-[linear-gradient(#f9f8f3,#eeebe0)] p-6 lg:sticky lg:top-20">
          <Drawing item={item} className="h-72 sm:h-96" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-accent">{CATEGORIES[item.categorie] ?? item.categorie}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{item.nom}</h1>
          <p className="mt-3 text-xl leading-relaxed text-ink">{item.role}</p>
          <p className="mt-3 inline-block rounded-xl bg-sunken px-3 py-2 text-ink-2"><span className="font-semibold text-ink">Précision :</span> {item.precision}</p>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-ink">Le bon geste</h2>
            <ol className="mt-3 grid gap-3">
              {item.utilisation.map((tip, n) => (
                <li key={tip} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand font-bold text-white">{n + 1}</span>
                  <p className="text-lg text-ink">{tip}</p>
                </li>
              ))}
            </ol>
          </section>

          {item.erreurs_frequentes.length > 0 && (
            <section className="mt-8 rounded-2xl bg-accent-soft p-5">
              <h2 className="text-xl font-bold text-accent">Erreurs fréquentes</h2>
              <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-lg text-ink">{item.erreurs_frequentes.map(e => <li key={e}>{e}</li>)}</ul>
            </section>
          )}

          {item.securite.length > 0 && (
            <section className="mt-5 rounded-2xl border-2 border-bad/30 p-5">
              <h2 className="text-xl font-bold text-bad">Sécurité</h2>
              <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-lg text-ink">{item.securite.map(s => <li key={s}>{s}</li>)}</ul>
            </section>
          )}

          <p className="mt-6 text-ink-2">Niveaux : {item.niveaux.join(' · ')}</p>

          <nav aria-label="Autres instruments" className="mt-8 grid grid-cols-2 gap-3 border-t border-line pt-6">
            <Link to={`/materiel/${prev.id}`} className="rounded-2xl border border-line bg-surface p-4 hover:border-line-strong"><span className="flex items-center gap-1 text-sm text-ink-2"><ArrowLeft size={16} /> Précédent</span><span className="mt-1 block font-semibold text-ink">{prev.nom}</span></Link>
            <Link to={`/materiel/${next.id}`} className="rounded-2xl border border-line bg-surface p-4 text-right hover:border-line-strong"><span className="flex items-center justify-end gap-1 text-sm text-ink-2">Suivant <ArrowRight size={16} /></span><span className="mt-1 block font-semibold text-ink">{next.nom}</span></Link>
          </nav>
        </div>
      </div>
    </article>
  );
}

export default function CatalogView() {
  const { id } = useParams();
  if (id) {
    const item = ITEMS.find(entry => entry.id === id);
    return item ? <Detail item={item} /> : <Navigate to="/materiel" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wider text-accent">Le matériel de TP</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Reconnaître et bien utiliser la verrerie</h1>
        <p className="mt-2 text-lg text-ink-2">À projeter avant la manipulation : à quoi sert chaque instrument, le bon geste et les erreurs à éviter.</p>
      </header>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(item => (
          <li key={item.id}>
            <Link to={`/materiel/${item.id}`} className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-brand">
              <div className="rounded-2xl bg-[linear-gradient(#f9f8f3,#eeebe0)] p-4"><Drawing item={item} className="h-44" /></div>
              <p className="mt-4 text-sm font-bold uppercase tracking-wider text-accent">{CATEGORIES[item.categorie] ?? item.categorie}</p>
              <h2 className="mt-1 text-xl font-bold text-ink">{item.nom}</h2>
              <p className="mt-1 flex-1 text-ink-2">{item.role}</p>
              <span className="mt-4 inline-flex items-center gap-1 font-semibold text-brand">Voir la fiche <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
