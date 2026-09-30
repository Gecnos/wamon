import { fmt } from '../../lib/format';
import { Check } from '../../ui/icons';
import { TitrationCurve, type CurveMarker } from '../titration/TitrationCurve';
import { useSeance } from './SeanceContext';
import { buretteCapacity, config, equivalenceVolume, GROUP_COLORS, predictedVolume, quantity, referenceValue, variante, verify } from './logic';

function Verdict({ ok }: { ok: boolean }) {
  return ok
    ? <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2.5 py-1 text-sm font-bold text-ok"><Check size={16} /> Cohérent</span>
    : <span className="inline-flex items-center rounded-full bg-bad-soft px-2.5 py-1 text-sm font-bold text-bad">À discuter</span>;
}

export function StepComparer() {
  const { state } = useSeance();
  const v = variante(state);
  const q = quantity(v.inconnue);
  const unit = q.unite;
  const digits = v.inconnue === 'Ve' ? 2 : 3;
  const ref = referenceValue(state);
  const ve = equivalenceVolume(state.params);
  const maxVb = buretteCapacity(state);
  const tolerancePct = fmt(config.tolerance * 100, 1);

  const rows = [
    { name: 'Classe', value: state.classAnswer, color: '#1b5a3d' },
    ...state.groups.map((g, i) => ({ name: g.name, value: g.value, color: GROUP_COLORS[i % GROUP_COLORS.length] })),
  ].filter((r): r is { name: string; value: number; color: string } => r.value !== null);

  const classResult = state.classAnswer !== null ? verify(state, state.classAnswer) : null;
  const markers: CurveMarker[] = [
    { value: ve, label: `Équivalence réelle : ${fmt(ve, 2)} mL`, color: '#a3440c' },
    ...rows.map(r => ({ value: predictedVolume(state, r.value), label: r.name, color: r.color, dashed: true })),
  ];

  const { Ca, Va, Cb } = state.params;

  return (
    <div className="grid gap-5">
      {classResult && (
        <section aria-live="polite" className={`rounded-3xl border-2 p-6 sm:p-8 ${classResult.isCoherent ? 'border-ok/40 bg-ok-soft' : 'border-bad/40 bg-bad-soft'}`}>
          <p className={`text-sm font-bold uppercase tracking-wider ${classResult.isCoherent ? 'text-ok' : 'text-bad'}`}>Verdict de l’expérience</p>
          <h2 className="mt-2 text-2xl font-bold text-ink sm:text-4xl">
            {classResult.isCoherent ? 'La réponse de la classe est confirmée.' : 'L’expérience ne confirme pas la réponse.'}
          </h2>
          <p className="mt-3 text-lg text-ink-2">
            Réponse de la classe : <strong className="text-ink tabular-nums">{fmt(classResult.userValue, digits)} {unit}</strong> · valeur du modèle : <strong className="text-ink tabular-nums">{fmt(ref, digits)} {unit}</strong> · écart <strong className="text-ink tabular-nums">{fmt(classResult.diffPercent, 1)} %</strong> (tolérance {tolerancePct} %).
          </p>
        </section>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section aria-labelledby="tableau-titre" className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
          <h2 id="tableau-titre" className="text-lg font-bold text-ink">Toutes les réponses</h2>
          <table className="mt-3 w-full text-left">
            <thead>
              <tr className="border-b border-line text-sm text-ink-2">
                <th className="py-2 font-semibold">Qui</th>
                <th className="py-2 text-right font-semibold">{v.inconnue} ({unit})</th>
                <th className="py-2 text-right font-semibold">Écart</th>
                <th className="py-2 pl-3 text-right font-semibold"><span className="sr-only">Verdict</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const res = verify(state, r.value);
                return (
                  <tr key={r.name} className="border-b border-line last:border-0">
                    <td className="py-3 font-semibold text-ink"><span className="mr-2 inline-block size-3 rounded-full align-middle" style={{ background: r.color }} aria-hidden="true" />{r.name}</td>
                    <td className="py-3 text-right text-lg font-bold tabular-nums text-ink">{fmt(r.value, digits)}</td>
                    <td className="py-3 text-right tabular-nums text-ink-2">{res.diffValue > 0 ? '+' : ''}{fmt(res.diffPercent * Math.sign(res.diffValue), 1)} %</td>
                    <td className="py-3 pl-3 text-right"><Verdict ok={res.isCoherent} /></td>
                  </tr>
                );
              })}
              <tr className="bg-accent-soft">
                <td className="rounded-l-xl py-3 pl-3 font-bold text-accent">Modèle</td>
                <td className="py-3 text-right text-lg font-bold tabular-nums text-accent">{fmt(ref, digits)}</td>
                <td className="rounded-r-xl py-3 pr-3 text-right text-sm text-accent" colSpan={2}>référence</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-sm text-ink-2">
            Pistes de discussion : arrondis, conversion mL → L, confusion entre Va et Ve, lecture du ménisque, choix de l’indicateur.
          </p>
        </section>

        <section aria-labelledby="bilan-titre" className="rounded-3xl border border-line bg-surface p-4 sm:p-6">
          <h2 id="bilan-titre" className="text-lg font-bold text-ink">Où tombent les réponses sur la courbe&nbsp;?</h2>
          <div className="mt-3">
            <TitrationCurve title="Courbe complète du dosage avec les réponses" Ca={Ca} Va={Va} Cb={Cb} maxVb={maxVb} currentVb={ve} markers={markers} />
          </div>
        </section>
      </div>

      <details className="group rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-lg font-bold text-ink">
          Afficher la correction détaillée
          <span className="text-2xl text-ink-2 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
        </summary>
        <div className="mt-4 grid gap-4 text-lg text-ink">
          <p><span className="font-semibold">Réaction du dosage :</span> <span className="font-mono">H₃O⁺ + HO⁻ → 2 H₂O</span></p>
          <p><span className="font-semibold">À l’équivalence</span>, les réactifs ont été introduits dans les proportions stœchiométriques : <span className="font-mono">n(H₃O⁺) = n(HO⁻)</span>, donc <span className="font-mono">Ca × Va = Cb × Ve</span>.</p>
          <p className="rounded-2xl bg-sunken p-4 font-mono text-xl tabular-nums">
            {v.inconnue === 'Ve'
              ? <>Ve = Ca × Va / Cb = {fmt(Ca, 3)} × {fmt(Va)} / {fmt(Cb, 3)} = <strong className="text-brand">{fmt(ve, 2)} mL</strong></>
              : <>Ca = Cb × Ve / Va = {fmt(Cb, 3)} × {fmt(ve, 2)} / {fmt(Va)} = <strong className="text-brand">{fmt(Ca, 3)} mol/L</strong></>}
          </p>
          <p className="text-base text-ink-2">Les volumes peuvent rester en mL : ils apparaissent des deux côtés de l’égalité.</p>
        </div>
      </details>
    </div>
  );
}
