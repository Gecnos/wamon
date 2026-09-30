import { INDICATORS, type IndicatorType } from '../../models/dosageFortFort';
import { fmt } from '../../lib/format';
import { Check } from '../../ui/icons';

const ORDER: IndicatorType[] = ['helianthine', 'btb', 'phenolphthalein'];
const SHORT: Record<IndicatorType, string> = { helianthine: 'Hélianthine', btb: 'BBT', phenolphthalein: 'Phénolphtaléine' };

interface IndicatorPickerProps {
  value: IndicatorType;
  onChange: (value: IndicatorType) => void;
  legend?: string;
}

export function IndicatorPicker({ value, onChange, legend = 'Indicateur coloré' }: IndicatorPickerProps) {
  return (
    <fieldset className="@container min-w-0">
      <legend className="text-[0.95rem] font-semibold text-ink">{legend}</legend>
      <div className="mt-2 grid gap-2 @lg:grid-cols-3">
        {ORDER.map(id => {
          const indicator = INDICATORS[id];
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(id)}
              className={`relative flex min-h-14 items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition-colors ${selected ? 'border-encre bg-encre-soft' : 'border-line bg-surface hover:border-line-strong'}`}
            >
              <span className="flex h-9 w-4 shrink-0 flex-col overflow-hidden rounded-full ring-1 ring-ink/15" aria-hidden="true">
                <span className="flex-1" style={{ background: indicator.colorBefore }} />
                <span className="flex-1" style={{ background: indicator.colorTransition }} />
                <span className="flex-1" style={{ background: indicator.colorAfter }} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold leading-tight text-ink">{SHORT[id]}</span>
                <span className="block text-sm text-ink-2">virage pH {fmt(indicator.pHMin, 1)} – {fmt(indicator.pHMax, 1)}</span>
              </span>
              {selected && <Check size={18} className="absolute right-2 top-2 text-encre" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
