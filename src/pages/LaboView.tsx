import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fmt } from '../lib/format';
import { readJSON, writeJSON } from '../lib/storage';
import { Button } from '../ui/Button';
import { NumberField } from '../ui/NumberField';
import { Drop, Pause, Pin, Play, Reset, Trash, Undo } from '../ui/icons';
import type { IndicatorType } from '../models/dosageFortFort';
import { BenchStage } from '../features/titration/BenchStage';
import { IndicatorPicker } from '../features/titration/IndicatorPicker';
import { Readout } from '../features/titration/Readout';
import { TitrationCurve } from '../features/titration/TitrationCurve';
import { useTitration } from '../features/titration/useTitration';

// Tous ces couples acide fort / base forte suivent le même modèle.
const ACIDS = [
  { id: 'HCl', name: 'Acide chlorhydrique', formula: 'H₃O⁺ + Cl⁻' },
  { id: 'HNO3', name: 'Acide nitrique', formula: 'H₃O⁺ + NO₃⁻' },
];
const BASES = [
  { id: 'NaOH', name: 'Soude (hydroxyde de sodium)', formula: 'Na⁺ + HO⁻' },
  { id: 'KOH', name: 'Potasse (hydroxyde de potassium)', formula: 'K⁺ + HO⁻' },
];

interface LabSetup {
  acid: string;
  base: string;
  Ca: number;
  Va: number;
  Cb: number;
  capacity: 25 | 50;
  indicator: IndicatorType;
}

const DEFAULT_SETUP: LabSetup = { acid: 'HCl', base: 'NaOH', Ca: 0.1, Va: 20, Cb: 0.1, capacity: 25, indicator: 'btb' };
const STORAGE_KEY = 'wamon:labo:v1';

function Choice<T extends string | number>({ legend, options, value, onChange }: { legend: string; options: { id: T; label: string; sub?: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-[0.95rem] font-semibold text-ink">{legend}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map(o => (
          <button key={String(o.id)} type="button" aria-pressed={o.id === value} onClick={() => onChange(o.id)}
            className={`min-h-12 rounded-xl border-2 px-3 py-2 text-left transition-colors ${o.id === value ? 'border-brand bg-brand-soft' : 'border-line bg-surface hover:border-line-strong'}`}>
            <span className="block font-semibold leading-tight text-ink">{o.label}</span>
            {o.sub && <span className="block text-sm text-ink-2">{o.sub}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function LaboView() {
  const [setup, setSetup] = useState<LabSetup>(() => ({ ...DEFAULT_SETUP, ...readJSON<LabSetup>('local', STORAGE_KEY) }));
  const [measures, setMeasures] = useState<{ Vb: number; pH: number }[]>([]);
  const [showTheory, setShowTheory] = useState(false);
  const host = useRef<HTMLDivElement>(null);

  const change = (patch: Partial<LabSetup>) => {
    setSetup(current => {
      const next = { ...current, ...patch };
      writeJSON('local', STORAGE_KEY, next);
      return next;
    });
    // Changer une quantité relance l’expérience ; changer d’indicateur ou de nom de réactif non.
    if (['Ca', 'Va', 'Cb', 'capacity'].some(key => key in patch)) setMeasures([]);
  };

  const t = useTitration(host, { Ca: setup.Ca, Va: setup.Va, Cb: setup.Cb, indicator: setup.indicator, maxVb: setup.capacity });
  const acid = ACIDS.find(a => a.id === setup.acid) ?? ACIDS[0];
  const base = BASES.find(b => b.id === setup.base) ?? BASES[0];

  const record = () => setMeasures(list => [...list.filter(m => Math.abs(m.Vb - t.volume) > 1e-6), { Vb: Number(t.volume.toFixed(2)), pH: t.reading.pH }].sort((a, b) => a.Vb - b.Vb));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wider text-accent">Labo libre · Dosage acide fort / base forte</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Votre paillasse</h1>
        <p className="mt-2 text-lg text-ink-2">
          Choisissez vos solutions, versez à votre rythme et relevez vos mesures pour tracer la courbe. Pour une séance projetée avec la classe, passez plutôt par la <Link to="/seance" className="font-semibold text-ink underline underline-offset-4">séance guidée</Link>.
        </p>
      </header>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,24rem)_minmax(0,1fr)]">
        {/* 1. Préparer */}
        <section aria-labelledby="preparer" className="grid gap-5 rounded-3xl border border-line bg-surface p-5">
          <h2 id="preparer" className="flex items-center gap-2 text-lg font-bold text-ink"><span className="grid size-7 place-items-center rounded-full bg-brand text-sm text-white">1</span> Préparer</h2>
          <Choice legend="Dans le bécher : l’acide" value={setup.acid} onChange={id => change({ acid: id })} options={ACIDS.map(a => ({ id: a.id, label: a.id, sub: a.name.split(' ')[1] }))} />
          <NumberField symbol="Ca" label="Concentration de l’acide" unit="mol/L" value={setup.Ca} min={0.01} max={1} step={0.01} onChange={v => v !== null && change({ Ca: v })} />
          <NumberField symbol="Va" label="Volume d’acide prélevé" unit="mL" value={setup.Va} min={5} max={50} step={1} onChange={v => v !== null && change({ Va: v })} />
          <Choice legend="Dans la burette : la base" value={setup.base} onChange={id => change({ base: id })} options={BASES.map(b => ({ id: b.id, label: b.id, sub: b.name.split(' ')[0] }))} />
          <NumberField symbol="Cb" label="Concentration de la base" unit="mol/L" value={setup.Cb} min={0.01} max={1} step={0.01} onChange={v => v !== null && change({ Cb: v })} />
          <Choice legend="Burette" value={setup.capacity} onChange={capacity => change({ capacity })} options={[{ id: 25, label: '25 mL' }, { id: 50, label: '50 mL' }]} />
          <IndicatorPicker value={setup.indicator} onChange={indicator => change({ indicator })} legend="Quelques gouttes d’indicateur" />
        </section>

        {/* 2. Verser */}
        <section aria-labelledby="verser" className="grid gap-4 rounded-3xl border border-line bg-surface p-4 sm:p-5">
          <h2 id="verser" className="flex items-center gap-2 text-lg font-bold text-ink"><span className="grid size-7 place-items-center rounded-full bg-brand text-sm text-white">2</span> Verser</h2>
          <p className="-mt-2 text-sm text-ink-2">{acid.name} ({acid.formula}) dosé par {base.name.split(' (')[0].toLowerCase()} ({base.formula}).</p>
          <BenchStage ref={host} className="h-[22rem] sm:h-[28rem]" />
          <Readout volume={t.volume} maxVb={setup.capacity} pH={t.reading.pH} color={t.reading.color} colorLabel={t.reading.colorLabel} />
          <Button size="lg" variant={t.pouring ? 'secondary' : 'primary'} onClick={t.toggleFlow} disabled={t.volume >= setup.capacity}>
            {t.pouring ? <><Pause /> Fermer le robinet</> : <><Play /> Ouvrir le robinet</>}
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={t.addDrop} disabled={t.pouring}><Drop size={18} /> Goutte</Button>
            <Button variant="secondary" onClick={() => t.addVolume(0.5)} disabled={t.pouring}>+0,5 mL</Button>
            <Button variant="secondary" onClick={() => t.addVolume(1)} disabled={t.pouring}>+1 mL</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => t.undo(0.5)} disabled={t.pouring || t.volume === 0}><Undo size={18} /> −0,5 mL</Button>
            <Button variant="ghost" onClick={() => { t.reset(); setMeasures([]); }} disabled={t.pouring}><Reset size={18} /> Recommencer</Button>
          </div>
        </section>

        {/* 3. Mesurer */}
        <section aria-labelledby="mesurer" className="grid gap-4 lg:col-span-2 xl:col-span-1 rounded-3xl border border-line bg-surface p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="mesurer" className="flex items-center gap-2 text-lg font-bold text-ink"><span className="grid size-7 place-items-center rounded-full bg-brand text-sm text-white">3</span> Mesurer</h2>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-ink-2">
              <input type="checkbox" checked={showTheory} onChange={e => setShowTheory(e.target.checked)} className="size-5 accent-brand" />
              Afficher la courbe théorique
            </label>
          </div>
          <Button variant="accent" size="lg" onClick={record} disabled={t.pouring}><Pin /> Relever le point ({fmt(t.volume, 1)} mL ; pH {fmt(t.reading.pH, 2)})</Button>
          <TitrationCurve title="Courbe du dosage" Ca={setup.Ca} Va={setup.Va} Cb={setup.Cb} maxVb={setup.capacity} currentVb={t.volume} measures={measures} showTheory={showTheory} />
          {measures.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-line p-4 text-center text-ink-2">Relevez un point tous les 1 ou 2 mL, puis resserrez près du saut de pH.</p>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink">Tableau de mesures <span className="font-normal text-ink-2">({measures.length})</span></h3>
                <Button variant="ghost" className="min-h-9 text-sm" onClick={() => setMeasures([])}><Trash size={16} /> Effacer</Button>
              </div>
              <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-line">
                <table className="w-full text-left tabular-nums">
                  <thead className="sticky top-0 bg-sunken text-sm text-ink-2"><tr><th className="px-3 py-2 font-semibold">V<sub>b</sub> (mL)</th><th className="px-3 py-2 font-semibold">pH</th></tr></thead>
                  <tbody>{measures.map(m => <tr key={m.Vb} className="border-t border-line"><td className="px-3 py-2">{fmt(m.Vb, 2)}</td><td className="px-3 py-2 font-semibold">{fmt(m.pH, 2)}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
