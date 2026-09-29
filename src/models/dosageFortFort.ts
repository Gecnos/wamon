export type IndicatorType = 'btb' | 'phenolphthalein' | 'helianthine';

export interface IndicatorConfig {
  id: IndicatorType;
  nom: string;
  pHMin: number;
  pHMax: number;
  colorBefore: string; // CSS color
  colorAfter: string;  // CSS color
  colorTransition: string; // Color in transition zone
  nameBefore: string;
  nameTransition: string;
  nameAfter: string;
}

export const INDICATORS: Record<IndicatorType, IndicatorConfig> = {
  btb: {
    id: 'btb',
    nom: 'Bleu de bromothymol (BTB)',
    pHMin: 6.0,
    pHMax: 7.6,
    colorBefore: '#facc15', // Jaune
    colorTransition: '#22c55e', // Vert
    colorAfter: '#2563eb', // Bleu
    nameBefore: 'Jaune (milieu acide)',
    nameTransition: 'Vert (zone de virage)',
    nameAfter: 'Bleu (milieu basique)',
  },
  phenolphthalein: {
    id: 'phenolphthalein',
    nom: 'Phénolphtaléine',
    pHMin: 8.2,
    pHMax: 10.0,
    colorBefore: 'rgba(255, 255, 255, 0.4)', // Incolore
    colorTransition: '#f472b6', // Rose clair
    colorAfter: '#db2777', // Rose fuchsia / magenta
    nameBefore: 'Incolore (milieu acide)',
    nameTransition: 'Rose clair (virage)',
    nameAfter: 'Rose vif (milieu basique)',
  },
  helianthine: {
    id: 'helianthine',
    nom: 'Hélianthine (Méthyl orange)',
    pHMin: 3.1,
    pHMax: 4.4,
    colorBefore: '#ef4444', // Rouge
    colorTransition: '#f97316', // Orange
    colorAfter: '#facc15', // Jaune
    nameBefore: 'Rouge (milieu très acide)',
    nameTransition: 'Orange (virage)',
    nameAfter: 'Jaune (milieu basique)',
  },
};

export interface TitrationState {
  Vb: number; // mL
  pH: number;
  h3oConcentration: number; // mol/L
  hoConcentration: number; // mol/L
  color: string;
  colorLabel: string;
  indicatorName: string;
  isEquivalence: boolean;
}

/**
 * Moteur physique du dosage Acide Fort / Base Forte (25°C, Ke=10^-14)
 * 
 * @param Ca Concentration de l'acide (mol/L)
 * @param Va Volume d'acide dosé (mL)
 * @param Cb Concentration de la base (mol/L)
 * @param Vb Volume de base versé (mL)
 * @param indicator Indicateur coloré choisi
 */
export function calculateTitrationPoint(
  Ca: number,
  Va: number,
  Cb: number,
  Vb: number,
  indicator: IndicatorType = 'btb'
): TitrationState {
  const totalVolumeL = (Va + Vb) / 1000.0;
  const nAcid = Ca * (Va / 1000.0);
  const nBase = Cb * (Vb / 1000.0);

  let pH = 7.0;
  let h3o = 1e-7;
  let ho = 1e-7;
  let isEquivalence = false;

  const diff = nBase - nAcid;

  if (Math.abs(diff) < 1e-10) {
    // Équivalence exacte (pH = 7.0)
    pH = 7.0;
    h3o = 1e-7;
    ho = 1e-7;
    isEquivalence = true;
  } else if (diff < 0) {
    // Avant l'équivalence : excès d'acide [H3O+] = (n_acid - n_base) / V_total
    h3o = Math.abs(diff) / totalVolumeL;
    pH = -Math.log10(h3o);
    ho = 1e-14 / h3o;
  } else {
    // Après l'équivalence : excès de base [HO-] = (n_base - n_acid) / V_total
    ho = diff / totalVolumeL;
    pH = 14.0 + Math.log10(ho);
    h3o = 1e-14 / ho;
  }

  // Bornes pH
  pH = Math.min(Math.max(pH, 0), 14);

  // Calcul de la couleur de l'indicateur
  const indConfig = INDICATORS[indicator];
  const { color, colorLabel } = getIndicatorColor(pH, indConfig);

  return {
    Vb,
    pH: Number(pH.toFixed(2)),
    h3oConcentration: h3o,
    hoConcentration: ho,
    color,
    colorLabel,
    indicatorName: indConfig.nom,
    isEquivalence,
  };
}

/**
 * Calcul le dégradé de couleur et la description textuelle selon la zone de virage.
 */
function getIndicatorColor(pH: number, ind: IndicatorConfig): { color: string; colorLabel: string } {
  if (pH < ind.pHMin) {
    return { color: ind.colorBefore, colorLabel: ind.nameBefore };
  }
  if (pH > ind.pHMax) {
    return { color: ind.colorAfter, colorLabel: ind.nameAfter };
  }

  // Zone de virage
  const ratio = (pH - ind.pHMin) / (ind.pHMax - ind.pHMin);
  
  if (ind.id === 'phenolphthalein') {
    // Incolore vers rose fuchsia
    const opacity = 0.2 + ratio * 0.75;
    return {
      color: `rgba(219, 39, 119, ${opacity})`,
      colorLabel: ind.nameTransition,
    };
  }

  if (ratio < 0.5) {
    return { color: ind.colorBefore, colorLabel: ind.nameTransition };
  }
  return { color: ind.colorAfter, colorLabel: ind.nameTransition };
}
