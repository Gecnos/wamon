import { useEffect, useId, useState } from 'react';
import { clamp, decimalsOf, fmt, parseDecimal } from '../lib/format';
import { Minus, Plus } from './icons';

interface NumberFieldProps {
  label: string;
  symbol?: string;
  unit: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'md' | 'xl';
  hint?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Champ numérique tolérant la virgule, avec boutons −/+ assez grands pour le
 * doigt et la souris d’un enseignant debout devant son tableau.
 */
export function NumberField({ label, symbol, unit, value, onChange, min = 0, max = Infinity, step = 1, size = 'md', hint, placeholder, autoFocus }: NumberFieldProps) {
  const id = useId();
  const decimals = decimalsOf(step);
  const [text, setText] = useState(value === null ? '' : fmt(value, 4));

  // Resynchronise le texte quand la valeur change de l’extérieur (−/+, hasard…).
  useEffect(() => {
    setText(current => (parseDecimal(current) === value ? current : value === null ? '' : fmt(value, 4)));
  }, [value]);

  const nudge = (direction: 1 | -1) => {
    const next = clamp(Number(((value ?? min) + direction * step).toFixed(decimals)), min, max);
    onChange(next);
  };

  const commit = () => {
    const parsed = parseDecimal(text);
    if (parsed === null) return;
    const bounded = clamp(parsed, min, max);
    if (bounded !== parsed) onChange(bounded);
    setText(fmt(bounded, 4));
  };

  const big = size === 'xl';
  const control = `grid shrink-0 place-items-center text-ink-2 transition-colors hover:bg-sunken hover:text-ink disabled:opacity-35 ${big ? 'w-16' : 'w-12'}`;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className={`flex items-baseline gap-2 font-semibold text-ink ${big ? 'text-lg' : 'text-[0.95rem]'}`}>
        {symbol && <span className="font-mono text-encre">{symbol}</span>}
        <span>{label}</span>
      </label>
      <div className={`mt-2 flex items-stretch overflow-hidden rounded-xl border-2 border-line bg-surface focus-within:border-encre ${big ? 'h-20' : 'h-12'}`}>
        <button type="button" className={`${control} border-r border-line`} onClick={() => nudge(-1)} disabled={value !== null && value <= min} aria-label={`Diminuer ${label}`}>
          <Minus size={big ? 26 : 18} />
        </button>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={text}
          onChange={event => {
            setText(event.target.value);
            const parsed = parseDecimal(event.target.value);
            onChange(parsed === null ? null : parsed);
          }}
          onBlur={commit}
          className={`w-0 min-w-0 flex-1 bg-transparent text-center font-bold tabular-nums text-ink outline-none placeholder:font-normal placeholder:text-ink-2/50 ${big ? 'text-4xl' : 'text-lg'}`}
        />
        <span className={`flex items-center pr-3 font-semibold text-ink-2 ${big ? 'text-xl' : 'text-sm'}`}>{unit}</span>
        <button type="button" className={`${control} border-l border-line`} onClick={() => nudge(1)} disabled={value !== null && value >= max} aria-label={`Augmenter ${label}`}>
          <Plus size={big ? 26 : 18} />
        </button>
      </div>
      {hint && <p className="mt-1.5 text-sm text-ink-2">{hint}</p>}
    </div>
  );
}
