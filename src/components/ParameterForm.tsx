import type { CSSProperties } from 'react';
import type { ModuleConfig, VarianteConfig } from '../types';
import type { FormState } from '../pages/SimulationView';
import type { IndicatorType } from '../models/dosageFortFort';

interface ParameterFormProps {
  config: ModuleConfig;
  variante: VarianteConfig;
  form: FormState;
  onChange: (form: FormState) => void;
  onSubmit: (form: FormState) => void;
  onVarianteChange: (id: string) => void;
}

const INDICATORS: { id: IndicatorType; name: string; fullName: string; pH: string; color: string }[] = [
  { id: 'btb', name: 'BBT', fullName: 'Bleu de bromothymol', pH: '6,0–7,6', color: '#59836a' },
  { id: 'helianthine', name: 'Hélianthine', fullName: 'Hélianthine (méthylorange)', pH: '3,1–4,4', color: '#d7813e' },
  { id: 'phenolphthalein', name: 'Phénolphtaléine', fullName: 'Phénolphtaléine', pH: '8,2–10,0', color: '#bd7188' },
];

function formatValue(value: number, step: number) {
  const decimals = Math.max(0, String(step).split('.')[1]?.length ?? 0);
  return Number(value.toFixed(decimals));
}

export default function ParameterForm({ config, variante, form, onChange, onSubmit, onVarianteChange }: ParameterFormProps) {
  const answerConfig = config.grandeurs[variante.inconnue];
  const answerStep = answerConfig?.step ?? 0.1;

  const handleParamChange = (key: string, value: number) => {
    onChange({ ...form, params: { ...form.params, [key]: value } });
  };

  const handleAnswerChange = (value: number) => onChange({ ...form, userAnswer: value });

  return (
    <section className="glass-card param-card" aria-labelledby="parameters-title">
      <header className="parameter-heading">
        <div><p>PRÉPARATION DE L’EXPÉRIENCE</p><h2 id="parameters-title">Paramètres du titrage</h2></div>
        <span className="parameter-step">01 <i>/ 02</i></span>
      </header>

      <section className="parameter-section variant-section" aria-labelledby="variant-title">
        <div className="parameter-section-heading"><span>01</span><h3 id="variant-title">Choisir la question</h3></div>
        <div className="variant-switch" role="group" aria-label="Variante de l’exercice">
          {config.variantes.map((item, index) => (
            <button key={item.id} type="button" className={`variant-option ${variante.id === item.id ? 'is-active' : ''}`} onClick={() => onVarianteChange(item.id)} aria-pressed={variante.id === item.id}>
              <span>{String.fromCharCode(65 + index)}</span>{item.inconnue === 'Ve' ? 'Trouver Ve' : `Trouver ${item.inconnue}`}
            </button>
          ))}
        </div>
        {variante.description && <p className="variant-description">{variante.description}</p>}
      </section>

      <section className="parameter-section measured-section" aria-labelledby="measured-title">
        <div className="parameter-section-heading"><span>02</span><h3 id="measured-title">Données de l’énoncé</h3><small>{variante.donnees.length} valeurs</small></div>
        <div className="parameter-list">
          {variante.donnees.map(key => {
            const quantity = config.grandeurs[key];
            if (!quantity) return null;
            const min = quantity.min ?? 0;
            const max = quantity.max ?? 100;
            const step = quantity.step ?? 1;
            const value = form.params[key] ?? quantity.default ?? min;
            const adjust = (direction: -1 | 1) => handleParamChange(key, Math.min(max, Math.max(min, formatValue(value + direction * step, step))));

            return (
              <div className="parameter-row" key={key}>
                <div className="parameter-row-top">
                  <label htmlFor={`quantity-${key}`} title={quantity.label}><span className="quantity-symbol">{key}</span><span>{quantity.label}</span></label>
                  <div className="quantity-control">
                    <button type="button" onClick={() => adjust(-1)} aria-label={`Diminuer ${quantity.label}`}>−</button>
                    <input id={`quantity-${key}`} type="number" min={min} max={max} step={step} value={value} onChange={event => handleParamChange(key, Math.min(max, Math.max(min, Number(event.target.value) || min)))} />
                    <span>{quantity.unite}</span>
                    <button type="button" onClick={() => adjust(1)} aria-label={`Augmenter ${quantity.label}`}>+</button>
                  </div>
                </div>
                <input className="quantity-range" aria-label={`${quantity.label} : ${value} ${quantity.unite}`} type="range" min={min} max={max} step={step} value={value} onChange={event => handleParamChange(key, Number(event.target.value))} />
                <div className="range-limits"><span>{min}</span><span>{max} {quantity.unite}</span></div>
              </div>
            );
          })}
        </div>
      </section>

      <fieldset className="parameter-section indicator-section">
        <legend className="parameter-section-heading"><span>03</span><span>Indicateur coloré</span></legend>
        <div className="indicator-options">
          {INDICATORS.map(indicator => (
            <button key={indicator.id} type="button" title={indicator.fullName} aria-label={`${indicator.fullName}, zone de virage ${indicator.pH}`} aria-pressed={form.indicator === indicator.id} className={`indicator-option ${form.indicator === indicator.id ? 'is-active' : ''}`} onClick={() => onChange({ ...form, indicator: indicator.id })}>
              <span className="indicator-swatch" style={{ '--swatch': indicator.color } as CSSProperties} />
              <span className="indicator-option-copy"><strong>{indicator.name}</strong><small>pH {indicator.pH}</small></span>
              {form.indicator === indicator.id && <span className="indicator-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      </fieldset>

      <section className="class-answer" aria-labelledby="class-answer-title">
        <div className="answer-copy"><span>04</span><div><h3 id="class-answer-title">Réponse de la classe</h3><p>{answerConfig?.label} · entrez la valeur calculée</p></div></div>
        <div className="answer-control">
          <button type="button" onClick={() => handleAnswerChange(Math.max(0, formatValue(form.userAnswer - answerStep, answerStep)))} aria-label="Diminuer la réponse">−</button>
          <input aria-label={`Réponse de la classe en ${answerConfig?.unite}`} type="number" min="0" step={answerStep} value={form.userAnswer} onChange={event => handleAnswerChange(Number(event.target.value) || 0)} />
          <span>{answerConfig?.unite}</span>
          <button type="button" onClick={() => handleAnswerChange(formatValue(form.userAnswer + answerStep, answerStep))} aria-label="Augmenter la réponse">+</button>
        </div>
      </section>

      <button type="button" className="launch-experiment" onClick={() => onSubmit(form)}>
        <span>Lancer la simulation</span><span className="launch-arrow" aria-hidden="true">→</span>
      </button>
      <p className="launch-hint">Le résultat sera comparé à la valeur théorique.</p>
    </section>
  );
}
