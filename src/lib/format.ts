const formatters = new Map<number, Intl.NumberFormat>();

/** Nombre au format français (virgule décimale), sans zéros inutiles. */
export function fmt(value: number, maxDigits = 2): string {
  let formatter = formatters.get(maxDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: maxDigits });
    formatters.set(maxDigits, formatter);
  }
  return formatter.format(value);
}

/** Accepte « 12,5 » comme « 12.5 ». Renvoie null si la saisie n’est pas un nombre. */
export function parseDecimal(raw: string): number | null {
  const normalized = raw.trim().replace(/\s/g, '').replace(',', '.');
  if (normalized === '' || normalized === '-' || normalized === '.') return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function decimalsOf(step: number): number {
  return String(step).split('.')[1]?.length ?? 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
