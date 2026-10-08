import { calculateTitrationPoint, getIndicatorColor, INDICATORS, type IndicatorType, type TitrationState } from './dosageFortFort';

/**
 * Dosage d’un acide (fort, ou faible si `pKa` est donné) par une base forte,
 * ou, avec `mirror`, d’une base faible par un acide fort.
 * Volumes en mL, concentrations en mol/L, 25 °C.
 *
 * Dans les deux cas, `Ca` et `Va` décrivent la solution dosée (dans le bécher)
 * et `Cb` la solution versée (dans la burette).
 */
export interface TitrationSetup {
  Ca: number;
  Va: number;
  Cb: number;
  /** Absent : réactif fort. Présent : pKa du couple de l’espèce faible dosée. */
  pKa?: number;
  /** Vrai : la solution dosée est une base faible (le pKa est celui de son acide conjugué). */
  mirror?: boolean;
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
  const { Ca, Va, Cb, pKa, mirror } = setup;
  if (pKa === undefined) return calculateTitrationPoint(Ca, Va, Cb, Vb, indicator);

  // Une base faible B de couple BH⁺/B se dose comme un acide faible de pKa' = 14 − pKa,
  // avec un pH symétrique : pH = 14 − pH'.
  const raw = mirror ? 14 - weakAcidPH(Ca, Va, Cb, Vb, 14 - pKa) : weakAcidPH(Ca, Va, Cb, Vb, pKa);
  const pH = Math.min(14, Math.max(0, raw));
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
