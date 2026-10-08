import type { Exercise } from '../../exercises';
import { findVariant } from '../../exercises';
import { fmt } from '../../lib/format';
import { tint } from '../../models/preparation';
import { Check } from '../../ui/icons';
import { PhScale } from '../ph/PhScale';
import { TitrationCurve, type CurveMarker } from '../titration/TitrationCurve';
import { useSeance } from './SeanceContext';
import { buretteCapacity, GROUP_COLORS } from './logic';

function Verdict({ ok }: { ok: boolean }) {
  return ok
    ? <span className="inline-flex items-center gap-1 rounded-full bg-vert-soft px-2.5 py-1 text-sm font-bold text-vert"><Check size={16} /> Cohérent</span>
    : <span className="inline-flex items-center rounded-full bg-rouge-soft px-2.5 py-1 text-sm font-bold text-rouge">À discuter</span>;
}

interface Row { name: string; value: number; color: string }

function TitrationPicture({ ex, rows }: { ex: Extract<Exercise, { kind: 'titration' }>; rows: Row[] }) {
  const { state } = useSeance(ex);
  const { Ca, Va, Cb } = state.params;
  const ve = ex.value(state.params, 'Ve');
  const predictions = rows.map(r => ex.predictedVolume(state.params, state.variantId, r.value));
  const maxVb = buretteCapacity(ve, Math.max(0, ...predictions));
  const markers: CurveMarker[] = [
    { value: ve, label: `Équivalence réelle : ${fmt(ve, 2)} mL`, color: '#c4281b' },
    ...rows.map((r, i) => ({ value: predictions[i], label: r.name, color: r.color, dashed: true })),
  ];
  if (ex.acid.pKa !== undefined) markers.push({ value: ve / 2, label: `Demi-équivalence : pH = pKa = ${fmt(ex.acid.pKa, 2)}`, color: '#4a5260', dashed: true });
  return (
    <section aria-labelledby="bilan-titre" className="rounded-lg border border-line bg-surface p-4 sm:p-6">
      <h3 id="bilan-titre" className="text-lg font-bold text-ink">Où tombent les réponses sur la courbe&nbsp;?</h3>
      <div className="mt-3">
        <TitrationCurve title="Courbe complète du dosage avec les réponses" Ca={Ca} Va={Va} Cb={Cb} pKa={ex.acid.pKa} mirror={ex.mirror} titrant={ex.base.name} maxVb={maxVb} currentVb={ve} markers={markers} />
      </div>
    </section>
  );
}

function PhPicture({ ex, rows }: { ex: Extract<Exercise, { kind: 'ph' }>; rows: Row[] }) {
  const { state } = useSeance(ex);
  const reference = ex.phOf(state.params.C);
  const markers = [
    { label: 'Valeur mesurée', value: reference, color: '#c4281b' },
    ...rows.map(r => ({ label: r.name, value: ex.phOfAnswer(state.params, state.variantId, r.value), color: r.color })),
  ];
  return (
    <section aria-labelledby="ph-titre" className="rounded-lg border-2 border-ink bg-surface p-4 sm:p-6">
      <h3 id="ph-titre" className="text-lg font-bold text-ink">Où tombent les réponses sur l’échelle de pH&nbsp;?</h3>
      <p className="mt-1 text-[0.95rem] text-ink-2">Chaque réponse est traduite en pH, puis placée sur la teinte de l’indicateur universel.</p>
      <div className="mt-4">
        <PhScale title="Échelle de pH avec les réponses de la classe" markers={markers} />
      </div>
    </section>
  );
}

function TintPicture({ ex, rows }: { ex: Extract<Exercise, { kind: 'preparation' }>; rows: Row[] }) {
  const { state } = useSeance(ex);
  const target = ex.method === 'dilution' ? state.params.Cfille : state.params.C;
  const tubes = [
    { name: 'Attendue', C: target, color: '#c4281b' },
    ...rows.map(r => {
      const exp = ex.experiment(state.params, state.variantId, r.value);
      return { name: r.name, C: exp.answerIsUsed ? exp.obtained : exp.expected, color: r.color };
    }),
  ];
  return (
    <section aria-labelledby="teintes-titre" className="rounded-lg border border-line bg-surface p-4 sm:p-6">
      <h3 id="teintes-titre" className="text-lg font-bold text-ink">Échelle de teintes</h3>
      <p className="text-[0.95rem] text-ink-2">Chaque tube contient la solution que donnerait la réponse, à côté de la solution attendue.</p>
      <ul className="mt-6 flex flex-wrap items-end gap-6">
        {tubes.map(t => (
          <li key={t.name} className="flex w-16 flex-col items-center gap-2">
            <span className="relative block h-40 w-12 overflow-hidden rounded-b-full border-2 border-t-0 border-ink-2/70" aria-hidden="true">
              <span className="absolute inset-x-0 bottom-0 top-6" style={{ background: tint(ex.solute.rgb, t.C, ex.solute.Cscale) }} />
            </span>
            <span className="text-center text-sm font-bold leading-tight" style={{ color: t.color }}>{t.name}</span>
            <span className="text-center font-mono text-xs text-ink-2">{fmt(t.C, 4)} mol/L</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StepComparer({ ex }: { ex: Exercise }) {
  const { state } = useSeance(ex);
  const v = findVariant(ex, state.variantId);
  const q = ex.quantities[v.unknown];
  const ref = ex.reference(state.params, state.variantId);
  const tolerancePct = fmt(ex.tolerance * 100, 1);
  const correction = ex.correction(state.params, state.variantId);

  const rows: Row[] = [
    { name: 'Classe', value: state.classAnswer, color: '#1456c9' },
    ...state.groups.map((g, i) => ({ name: g.name, value: g.value, color: GROUP_COLORS[i % GROUP_COLORS.length] })),
  ].filter((r): r is Row => r.value !== null);

  const classResult = state.classAnswer !== null ? ex.verify(state.params, state.variantId, state.classAnswer) : null;

  return (
    <div className="grid gap-6">
      {classResult && (
        <section aria-live="polite" className={`rounded-lg border-2 p-6 sm:p-8 ${classResult.isCoherent ? 'border-vert bg-vert-soft' : 'border-rouge bg-rouge-soft'}`}>
          <h3 className="text-2xl font-bold text-balance text-ink sm:text-4xl">
            {classResult.isCoherent ? 'L’expérience confirme la réponse de la classe.' : 'L’expérience ne confirme pas la réponse de la classe.'}
          </h3>
          <p className="mt-3 text-lg text-ink-2">
            Classe : <mark className="rounded bg-signal px-1.5 font-bold text-ink tabular-nums">{fmt(classResult.userValue, q.digits)} {q.unit}</mark>
            {' '}— valeur exacte : <strong className="text-ink tabular-nums">{fmt(ref, q.digits)} {q.unit}</strong>
            {' '}— écart de <strong className="text-ink tabular-nums">{fmt(classResult.diffPercent, 1)} %</strong> (tolérance {tolerancePct} %).
          </p>
        </section>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section aria-labelledby="tableau-titre" className="rounded-lg border border-line bg-surface p-5 sm:p-6">
          <h3 id="tableau-titre" className="text-lg font-bold text-ink">Toutes les réponses</h3>
          <table className="mt-3 w-full text-left">
            <thead>
              <tr className="border-b border-line text-[0.95rem] text-ink-2">
                <th className="py-2 font-semibold">Qui</th>
                <th className="py-2 text-right font-semibold">{q.symbol}{q.unit ? ` (${q.unit})` : ''}</th>
                <th className="py-2 text-right font-semibold">Écart</th>
                <th className="py-2 pl-3 text-right font-semibold"><span className="sr-only">Verdict</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const res = ex.verify(state.params, state.variantId, r.value);
                return (
                  <tr key={r.name} className="border-b border-line last:border-0">
                    <td className="py-3 font-semibold text-ink"><span className="mr-2 inline-block size-3 rounded-full align-middle" style={{ background: r.color }} aria-hidden="true" />{r.name}</td>
                    <td className="py-3 text-right font-mono text-lg font-bold tabular-nums text-ink">{fmt(r.value, q.digits)}</td>
                    <td className="py-3 text-right tabular-nums text-ink-2">{res.diffValue > 0 ? '+' : ''}{fmt(res.diffPercent * Math.sign(res.diffValue), 1)} %</td>
                    <td className="py-3 pl-3 text-right"><Verdict ok={res.isCoherent} /></td>
                  </tr>
                );
              })}
              <tr>
                <td className="py-3 font-bold text-rouge">Valeur exacte</td>
                <td className="py-3 text-right font-mono text-lg font-bold tabular-nums text-rouge">{fmt(ref, q.digits)}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-[0.95rem] text-ink-2">
            Pistes de discussion : arrondis, conversions d’unités (mL et L), confusion entre deux volumes, lecture du ménisque, précision du matériel.
          </p>
        </section>

        {ex.kind === 'titration' ? <TitrationPicture ex={ex} rows={rows} /> : ex.kind === 'ph' ? <PhPicture ex={ex} rows={rows} /> : <TintPicture ex={ex} rows={rows} />}
      </div>

      <details className="group rounded-lg border border-line bg-surface p-5 sm:p-6">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-lg font-bold text-ink">
          Afficher la correction
          <span className="text-2xl text-ink-2 transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
        </summary>
        {/* La correction n’apparaît qu’à la demande de l’enseignant. */}
        <div className="mt-4 grid gap-4 rounded-md bg-sunken p-5 text-lg text-ink">
          <p>{correction.law}</p>
          <p className="font-mono text-xl">{correction.formula}</p>
          <p className="rounded-md border-2 border-ink bg-surface p-4 font-mono text-xl font-bold tabular-nums text-rouge">{correction.numeric}</p>
          {correction.note && <p className="text-base text-ink-2">{correction.note}</p>}
        </div>
      </details>
    </div>
  );
}
