/**
 * Préparation de solutions : dilution et dissolution.
 * Volumes en mL, concentrations en mol/L, masses en g.
 */

/** Dilution : Cmère × Vmère = Cfille × Vfille. */
export function dilutionVolumeMere(Cmere: number, Cfille: number, Vfille: number): number {
  return (Cfille * Vfille) / Cmere;
}

export function dilutionConcentration(Cmere: number, Vmere: number, Vfille: number): number {
  return (Cmere * Vmere) / Vfille;
}

/** Dissolution : m = C × V × M (V converti en litres). */
export function dissolutionMasse(C: number, V: number, M: number): number {
  return C * (V / 1000) * M;
}

export function dissolutionConcentration(m: number, V: number, M: number): number {
  return m / (M * (V / 1000));
}

/**
 * Teinte d’une solution colorée. L’opacité suit la loi de Beer-Lambert
 * (absorbance proportionnelle à C), ce qui donne une échelle de teintes
 * réaliste : doubler la concentration ne double pas la couleur perçue.
 */
export function tint(rgb: [number, number, number], C: number, Cscale: number): string {
  const alpha = 1 - Math.exp(-Math.max(0, C) / Cscale);
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
}
