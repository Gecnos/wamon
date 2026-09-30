import { useEffect, useId, useState, type MouseEvent, type ReactNode } from 'react';
import { readJSON, writeJSON } from '../lib/storage';
import { Button, buttonClass } from '../ui/Button';
import { Check, Plus, Trash } from '../ui/icons';
import { EMPTY_PROPOSAL, githubIssueUrl, MAX_URL_LENGTH, missingFields, toPlainText, whatsappUrl, type DataRow, type Proposal } from '../features/contribution/proposal';

const DRAFT_KEY = 'wamon:proposition:v1';
const LEVELS = ['Seconde', 'Première', 'Terminale'];

const input = 'mt-2 block w-full rounded-xl border-2 border-line bg-surface px-3 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-2/60 focus:border-encre';

function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="font-semibold text-ink">{label}</label>
      {hint && <p className="text-[0.95rem] text-ink-2">{hint}</p>}
      {children(id)}
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-line pt-8 first:border-0 first:pt-0">
      <h2 className="flex items-center gap-3 text-xl font-bold text-ink">
        <span className="grid size-8 place-items-center rounded-full bg-encre text-base text-white">{n}</span>{title}
      </h2>
      {children}
    </section>
  );
}

/** Aperçu de l’énoncé tel qu’il sera projeté (même style de copie qu’en séance). */
function Preview({ p }: { p: Proposal }) {
  const rows = p.data.filter(d => d.name.trim() || d.value.trim());
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_1.75rem,#edf1f8_1.75rem,#edf1f8_calc(1.75rem+1px))] py-6 pr-5 pl-10">
      <span aria-hidden="true" className="absolute inset-y-0 left-6 w-px bg-rouge/60" />
      <p className="text-[0.95rem] font-semibold text-encre">{p.levels.join(', ') || 'Niveau'}</p>
      <p className="mt-1 text-xl font-bold text-balance text-ink">{p.title || 'Titre de votre exercice'}</p>
      <p className="mt-3 whitespace-pre-line text-ink">{p.statement || 'L’énoncé apparaîtra ici, tel que vos élèves le liront.'}</p>
      {rows.length > 0 && (
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {rows.map((d, i) => (
            <div key={i}>
              <dt className="text-sm text-ink-2">{d.name}</dt>
              <dd className="font-mono text-lg font-bold text-ink">{d.symbol && <span className="font-normal text-encre">{d.symbol} = </span>}{d.value} {d.unit}</dd>
            </div>
          ))}
        </dl>
      )}
      {p.unknownName && <p className="mt-4 font-bold text-ink">Que vaut {p.unknownSymbol || p.unknownName}&nbsp;?</p>}
    </div>
  );
}

export default function ContributionView() {
  const [p, setP] = useState<Proposal>(() => ({ ...EMPTY_PROPOSAL, ...readJSON<Proposal>('local', DRAFT_KEY) }));
  const [copied, setCopied] = useState(false);
  const [triedToSend, setTriedToSend] = useState(false);

  // Brouillon gardé dans ce navigateur : rien n’est perdu si l’onglet se ferme.
  useEffect(() => {
    writeJSON('local', DRAFT_KEY, p);
  }, [p]);

  const set = <K extends keyof Proposal>(key: K, value: Proposal[K]) => setP(current => ({ ...current, [key]: value }));
  const setRow = (i: number, patch: Partial<DataRow>) => set('data', p.data.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  const missing = missingFields(p);
  const ready = missing.length === 0;
  const githubUrl = githubIssueUrl(p);
  const githubTooLong = githubUrl.length > MAX_URL_LENGTH;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(p));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    const blob = new Blob([toPlainText(p)], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `proposition-wamon-${(p.title || 'exercice').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(href);
  };

  const guard = (event: MouseEvent) => {
    if (!ready) {
      event.preventDefault();
      setTriedToSend(true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-balance text-ink sm:text-4xl">Proposez un exercice, avec vos mots</h1>
        <p className="mt-4 text-lg text-ink-2">
          Écrivez l’exercice comme vous le donnez à vos élèves. Vous n’avez rien à installer ni à programmer : l’équipe de Wamon le transforme en expérience, le fait relire par d’autres professeurs, puis vous prévient quand il est en ligne.
        </p>
      </div>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <form className="grid gap-8 rounded-2xl border border-line bg-surface p-5 sm:p-8" onSubmit={e => e.preventDefault()}>
          <Section n={1} title="L’exercice">
            <Field label="Titre" hint="Par exemple : Dosage du vinaigre du commerce">
              {id => <input id={id} className={input} value={p.title} onChange={e => set('title', e.target.value)} maxLength={120} />}
            </Field>
            <fieldset>
              <legend className="font-semibold text-ink">Niveau</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {LEVELS.map(level => {
                  const on = p.levels.includes(level);
                  return (
                    <button key={level} type="button" aria-pressed={on} onClick={() => set('levels', on ? p.levels.filter(l => l !== level) : [...p.levels, level])}
                      className={`min-h-11 rounded-full border-2 px-4 font-semibold transition-colors duration-150 active:scale-[0.97] ${on ? 'border-encre bg-encre text-white' : 'border-line text-ink-2 hover:border-line-strong'}`}>
                      {level}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <Field label="Énoncé" hint="Tel que vous le donnez aux élèves, sans les valeurs numériques si vous préférez les lister juste en dessous.">
              {id => <textarea id={id} className={input} rows={5} value={p.statement} onChange={e => set('statement', e.target.value)} placeholder="On dose 10,0 mL de vinaigre dilué par une solution de soude…" />}
            </Field>
          </Section>

          <Section n={2} title="Les données">
            <p className="-mt-2 text-[0.95rem] text-ink-2">Une ligne par valeur donnée aux élèves. Le symbole est facultatif.</p>
            <ul className="grid gap-3">
              {p.data.map((row, i) => (
                <li key={i} className="grid grid-cols-2 gap-2 rounded-xl bg-paper p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                  <label className="col-span-2 text-sm font-semibold text-ink-2 sm:col-span-1">Grandeur<input className={input} value={row.name} onChange={e => setRow(i, { name: e.target.value })} placeholder={i === 0 ? 'Concentration de la soude' : undefined} /></label>
                  <label className="text-sm font-semibold text-ink-2">Symbole<input className={input} value={row.symbol} onChange={e => setRow(i, { symbol: e.target.value })} placeholder={i === 0 ? 'Cb' : undefined} /></label>
                  <label className="text-sm font-semibold text-ink-2">Valeur<input className={input} inputMode="decimal" value={row.value} onChange={e => setRow(i, { value: e.target.value })} placeholder={i === 0 ? '0,10' : undefined} /></label>
                  <label className="text-sm font-semibold text-ink-2">Unité<input className={input} value={row.unit} onChange={e => setRow(i, { unit: e.target.value })} placeholder={i === 0 ? 'mol/L' : undefined} /></label>
                  <button type="button" onClick={() => set('data', p.data.filter((_, j) => j !== i))} disabled={p.data.length <= 1}
                    className="grid size-12 place-items-center justify-self-end rounded-xl text-ink-2 transition-colors hover:bg-rouge-soft hover:text-rouge disabled:opacity-30" aria-label={`Retirer la donnée ${i + 1}`}>
                    <Trash />
                  </button>
                </li>
              ))}
            </ul>
            <Button variant="secondary" className="justify-self-start" onClick={() => set('data', [...p.data, { name: '', symbol: '', value: '', unit: '' }])}><Plus /> Ajouter une donnée</Button>
          </Section>

          <Section n={3} title="Ce que la classe doit trouver">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Field label="Grandeur cherchée">{id => <input id={id} className={input} value={p.unknownName} onChange={e => set('unknownName', e.target.value)} placeholder="Concentration du vinaigre" />}</Field>
              <Field label="Symbole">{id => <input id={id} className={input} value={p.unknownSymbol} onChange={e => set('unknownSymbol', e.target.value)} placeholder="Ca" />}</Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Réponse attendue">{id => <input id={id} className={input} inputMode="decimal" value={p.answer} onChange={e => set('answer', e.target.value)} placeholder="0,85" />}</Field>
              <Field label="Unité">{id => <input id={id} className={input} value={p.unknownUnit} onChange={e => set('unknownUnit', e.target.value)} placeholder="mol/L" />}</Field>
            </div>
            <Field label="Correction" hint="Le raisonnement et le calcul, comme sur votre corrigé.">
              {id => <textarea id={id} className={input} rows={4} value={p.correction} onChange={e => set('correction', e.target.value)} />}
            </Field>
          </Section>

          <Section n={4} title="L’expérience à montrer">
            <Field label="Que doit voir la classe ?" hint="Le matériel, ce qui se passe (changement de couleur, précipité…), ce qui prouve que la réponse est juste.">
              {id => <textarea id={id} className={input} rows={4} value={p.experiment} onChange={e => set('experiment', e.target.value)} placeholder="Avec la phénolphtaléine, la solution devient rose à l’équivalence, vers 17 mL." />}
            </Field>
            <Field label="Votre nom et votre établissement (facultatif)" hint="Pour vous remercier et vous prévenir. Visible publiquement si vous envoyez par GitHub.">
              {id => <input id={id} className={input} value={p.author} onChange={e => set('author', e.target.value)} placeholder="Mme Adjovi, lycée de Cotonou" />}
            </Field>
          </Section>
        </form>

        <aside className="grid gap-6 lg:sticky lg:top-24">
          <section aria-labelledby="apercu-titre">
            <h2 id="apercu-titre" className="mb-3 text-lg font-bold text-ink">Aperçu en classe</h2>
            <Preview p={p} />
          </section>

          <section aria-labelledby="envoyer-titre" className="rounded-2xl border border-line bg-surface p-5">
            <h2 id="envoyer-titre" className="text-lg font-bold text-ink">Envoyer la proposition</h2>
            {triedToSend && !ready && <p role="alert" className="mt-2 rounded-xl bg-rouge-soft p-3 text-[0.95rem] font-semibold text-rouge">Il manque encore {missing.join(', ')}.</p>}
            <div className="mt-4 grid gap-2">
              {githubTooLong ? (
                <p className="rounded-xl bg-sunken p-3 text-[0.95rem] text-ink-2">Texte trop long pour GitHub : copiez-le puis collez-le dans un nouveau ticket.</p>
              ) : (
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" onClick={guard} className={buttonClass('primary', 'lg', 'w-full')}>Envoyer sur GitHub</a>
              )}
              <a href={whatsappUrl(p)} target="_blank" rel="noopener noreferrer" onClick={guard} className={buttonClass('secondary', 'md', 'w-full')}>Partager par WhatsApp</a>
              <Button variant="secondary" className="w-full" onClick={() => (ready ? void copy() : setTriedToSend(true))}>{copied ? <><Check /> Texte copié</> : 'Copier le texte (pour un e-mail)'}</Button>
              <Button variant="ghost" className="w-full" onClick={() => (ready ? download() : setTriedToSend(true))}>Télécharger la fiche</Button>
            </div>
            <p className="mt-4 text-sm text-ink-2">
              GitHub demande un compte gratuit : c’est là que l’équipe suit les propositions. Sans compte, envoyez le texte par WhatsApp ou par e-mail à un membre de l’équipe. Votre brouillon reste enregistré dans ce navigateur.
            </p>
            <button type="button" onClick={() => { setP(EMPTY_PROPOSAL); setTriedToSend(false); }} className="mt-3 text-sm font-semibold text-ink-2 underline underline-offset-4 hover:text-rouge">Effacer le brouillon</button>
          </section>
        </aside>
      </div>
    </div>
  );
}
