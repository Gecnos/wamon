const formatters = new Map<number, Intl.NumberFormat>();

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

/** Notation scientifique à `significant` chiffres significatifs : « 3,16 × 10⁻¹² ». */
function scientific(value: number, significant: number): string {
  if (value === 0 || !Number.isFinite(value)) return '0';
  let exponent = Math.floor(Math.log10(Math.abs(value)));
  let mantissa = Number((value / 10 ** exponent).toFixed(significant - 1));
  if (Math.abs(mantissa) >= 10) {
    mantissa /= 10;
    exponent += 1;
  }
  const mantissaText = fmt(mantissa, significant - 1);
  return `${mantissaText} × 10${[...String(exponent)].map(c => SUPERSCRIPT[c]).join('')}`;
}

/**
 * Nombre au format français (virgule décimale), sans zéros inutiles.
 * Un `maxDigits` négatif demande la notation scientifique (|maxDigits| chiffres significatifs).
 */
export function fmt(value: number, maxDigits = 2): string {
  if (maxDigits < 0) return scientific(value, -maxDigits);
  let formatter = formatters.get(maxDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: maxDigits });
    formatters.set(maxDigits, formatter);
  }
  return formatter.format(value);
}

const SUPERSCRIPT_TO_ASCII = Object.fromEntries(Object.entries(SUPERSCRIPT).map(([ascii, sup]) => [sup, ascii]));

/**
 * Accepte « 12,5 », « 12.5 » et la notation scientifique (« 1,5e-3 », « 1,5 × 10^-3 »,
 * « 1,5 x 10⁻³ »). Renvoie null si la saisie n’est pas un nombre.
 */
export function parseDecimal(raw: string): number | null {
  let text = raw.trim().replace(/\s/g, '').replace(',', '.');
  // Exposants en caractères supérieurs : 10⁻³ → 10^-3
  text = text.replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, run => `^${[...run].map(c => SUPERSCRIPT_TO_ASCII[c]).join('')}`);
  const sci = text.match(/^(-?\d*\.?\d+)[×x*]10\^?(-?\d+)$/i);
  if (sci) text = `${sci[1]}e${sci[2]}`;
  if (text === '' || text === '-' || text === '.') return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

export function decimalsOf(step: number): number {
  return String(step).split('.')[1]?.length ?? 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
