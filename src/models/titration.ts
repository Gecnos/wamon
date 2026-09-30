import { calculateTitrationPoint, getIndicatorColor, INDICATORS, type IndicatorType, type TitrationState } from './dosageFortFort';

/**
 * Dosage d’un acide (fort, ou faible si `pKa` est donné) par une base forte.
 * Volumes en mL, concentrations en mol/L, 25 °C.
 */
export interface TitrationSetup {
  Ca: number;
  Va: number;
  Cb: number;
  /** Absent : acide fort. Présent : acide faible de ce pKa. */
  pKa?: number;
}

const KW = 1e-14;

/**
 * pH d’un acide faible HA partiellement neutralisé par une base forte.
 *
 * On résout exactement l’électroneutralité
 *   [Na⁺] + [H₃O⁺] = [A⁻] + [HO⁻],  avec [A⁻] = C·Ka / (Ka + h)
 * par dichotomie sur le pH. Contrairement à la formule d’Henderson, le
 * résultat reste juste au début du dosage, à l’équivalence et après.
 */
export function weakAcidPH(Ca: number, Va: number, Cb: number, Vb: number, pKa: number): number {
  const Vt = Va + Vb;
  const C = (Ca * Va) / Vt; // acide total (HA + A⁻)
  const Na = (Cb * Vb) / Vt;
  const Ka = 10 ** -pKa;
  // f décroît quand le pH augmente : on cherche f(pH) = 0.
  const f = (pH: number) => {
    const h = 10 ** -pH;
    return Na + h - (C * Ka) / (Ka + h) - KW / h;
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

export function titrationPoint(setup: TitrationSetup, Vb: number, indicator: IndicatorType = 'btb'): TitrationState {
  const { Ca, Va, Cb, pKa } = setup;
  if (pKa === undefined) return calculateTitrationPoint(Ca, Va, Cb, Vb, indicator);

  const pH = Math.min(14, Math.max(0, weakAcidPH(Ca, Va, Cb, Vb, pKa)));
  const h = 10 ** -pH;
  const ind = INDICATORS[indicator];
  const { color, colorLabel } = getIndicatorColor(pH, ind);
  return {
    Vb,
    pH: Number(pH.toFixed(2)),
    h3oConcentration: h,
    hoConcentration: KW / h,
    color,
    colorLabel,
    indicatorName: ind.nom,
    isEquivalence: Math.abs(Cb * Vb - Ca * Va) < 1e-9,
  };
}

/** Volume équivalent (mL). */
export function equivalenceVolume({ Ca, Va, Cb }: TitrationSetup): number {
  return (Ca * Va) / Cb;
}
