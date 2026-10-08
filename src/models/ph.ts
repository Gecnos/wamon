/**
 * pH de solutions aqueuses à 25 °C (Ke = 10⁻¹⁴), concentrations en mol/L.
 */
const KW = 1e-14;

/** Acide fort (HCl) : [H₃O⁺] = C, valable pour 10⁻⁶ < C < 10⁻¹ mol/L. */
export function phStrongAcid(C: number): number {
  return -Math.log10(C);
}

/** Base forte (NaOH) : [HO⁻] = C, donc pH = 14 + log C. */
export function phStrongBase(C: number): number {
  return 14 + Math.log10(C);
}

/**
 * Acide faible HA de constante pKa. On résout l’électroneutralité
 *   [H₃O⁺] = [A⁻] + [HO⁻],  avec [A⁻] = C·Ka / (Ka + h)
 * par dichotomie, sans supposer que l’acide a peu réagi.
 */
export function phWeakAcid(C: number, pKa: number): number {
  const Ka = 10 ** -pKa;
  const f = (pH: number) => {
    const h = 10 ** -pH;
    return h - (C * Ka) / (Ka + h) - KW / h;
  };
  let lo = 0;
  let hi = 14;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Concentration en ions éthanoate (ou en base conjuguée) d’une solution d’acide faible. */
export function conjugateBaseConcentration(C: number, pKa: number): number {
  const h = 10 ** -phWeakAcid(C, pKa);
  return (C * 10 ** -pKa) / (10 ** -pKa + h);
}

/** Teintes de l’indicateur universel, du rouge (acide) au violet (basique). */
const UNIVERSAL: [number, [number, number, number]][] = [
  [0, [213, 31, 38]],
  [2, [229, 50, 45]],
  [3, [240, 108, 38]],
  [4, [245, 154, 35]],
  [5, [245, 196, 30]],
  [6, [226, 220, 52]],
  [7, [58, 166, 85]],
  [8, [38, 156, 150]],
  [9, [43, 111, 214]],
  [11, [75, 79, 196]],
  [13, [123, 63, 160]],
  [14, [100, 40, 140]],
];

export function universalColor(pH: number): string {
  const x = Math.min(14, Math.max(0, pH));
  for (let i = 1; i < UNIVERSAL.length; i++) {
    const [p1, c1] = UNIVERSAL[i];
    if (x <= p1) {
      const [p0, c0] = UNIVERSAL[i - 1];
      const t = (x - p0) / (p1 - p0);
      const mix = c0.map((v, k) => Math.round(v + (c1[k] - v) * t));
      return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
    }
  }
  return 'rgb(100, 40, 140)';
}

/** Dégradé CSS complet de l’échelle 0 à 14. */
export function universalGradient(): string {
  return `linear-gradient(90deg, ${UNIVERSAL.map(([p, c]) => `rgb(${c[0]}, ${c[1]}, ${c[2]}) ${((p / 14) * 100).toFixed(1)}%`).join(', ')})`;
}
