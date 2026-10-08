import { fmt } from '../lib/format';
import { phWeakAcid, universalColor } from '../models/ph';
import { calculExercise, constant, pick, quantity, variant } from './calcul';

/**
 * Exercices de chimie du programme de Terminale D (Bénin) : situation
 * d’apprentissage 2 (solutions aqueuses, cinétique) et 4 (chimie organique).
 * Chaque exercice décrit ses grandeurs, ses variantes, sa correction et le
 * protocole qui aboutit à une figure visible par la classe.
 */

const log = Math.log10;
const within = (answer: number, reference: number, tolerance: number) => Math.abs(answer - reference) / Math.abs(reference) <= tolerance;

// ─── Dilution d’une solution commerciale ─────────────────────

const M_HCL = 36.46;
const P_HCL = 37;
const D_HCL = 1.16;
const volumeCommercial = (C: number, V: number) => (100 * M_HCL * V * C) / (P_HCL * D_HCL * 1000);
const concentrationObtenue = (V0: number, V: number) => (V0 * P_HCL * D_HCL * 1000) / (100 * M_HCL * V);

export const dilutionCommerciale = calculExercise({
  id: 'dilution-commerciale',
  title: 'Diluer une solution commerciale d’acide chlorhydrique',
  short: 'Dilution d’une solution commerciale',
  summary: 'Préparer une solution d’acide chlorhydrique à partir de la solution du commerce (37 %, densité 1,16) : volume à prélever ou concentration obtenue.',
  duration: '25 min',
  context: 'Le laboratoire dispose d’une solution commerciale d’acide chlorhydrique, corrosive et très concentrée, d’une pipette graduée, d’une fiole jaugée et d’un pH-mètre.',
  equipment: ['pipette-jaugee', 'fiole-jaugee', 'becher'],
  quantities: [
    quantity('C', 'C', 'Concentration de la solution à préparer', 'mol/L', 0.05, 1, 0.05, 2),
    quantity('V', 'V', 'Volume de la fiole jaugée', 'mL', 50, 500, 50, 0),
    constant('p', 'p', 'Pourcentage massique d’acide pur', '%', P_HCL, 0),
    constant('d', 'd', 'Densité de la solution commerciale', '', D_HCL, 2),
    constant('M', 'M', 'Masse molaire de HCl', 'g/mol', M_HCL, 2),
    quantity('V0', 'V₀', 'Volume de solution commerciale à prélever', 'mL', 0.1, 100, 0.1, 2),
  ],
  paramKeys: ['C', 'V'],
  defaults: { C: 0.5, V: 200 },
  random: () => ({ C: pick([0.1, 0.2, 0.5, 1]), V: pick([100, 200, 250, 500]) }),
  variants: [
    variant('A', 'V0', ['C', 'V', 'p', 'd', 'M'], 'Calculer le volume V₀ de solution commerciale à prélever pour préparer cette solution diluée. On prendra la masse volumique de l’eau égale à 1000 g/L.'),
    variant('B', 'C', ['V0', 'V', 'p', 'd', 'M'], 'On prélève ce volume V₀ de solution commerciale et on complète jusqu’au trait de jauge. Calculer la concentration C obtenue.'),
  ],
  value: (p, key) => ({ V0: volumeCommercial(p.C, p.V), p: P_HCL, d: D_HCL, M: M_HCL })[key] ?? p[key],
  correction: (p, unknown) => {
    const C0 = (P_HCL * D_HCL * 1000) / (100 * M_HCL);
    const law = `La quantité d’acide se conserve pendant la dilution : C₀ × V₀ = C × V, avec C₀ = p × d × ρ(eau) / (100 × M) = ${fmt(C0, 1)} mol/L pour la solution commerciale.`;
    const note = 'La solution commerciale est corrosive : lunettes et gants. On la verse dans une fiole contenant déjà de l’eau, car la dilution échauffe le mélange.';
    return unknown === 'V0'
      ? { law, formula: 'V₀ = 100 × M × V × C / (p × d × ρ(eau))', numeric: `V₀ = 100 × ${fmt(M_HCL, 2)} × ${fmt(p.V)} × ${fmt(p.C, 2)} / (${P_HCL} × ${fmt(D_HCL, 2)} × 1000) = ${fmt(volumeCommercial(p.C, p.V), 2)} mL`, note }
      : { law, formula: 'C = V₀ × p × d × ρ(eau) / (100 × M × V)', numeric: `C = ${fmt(volumeCommercial(p.C, p.V), 2)} × ${P_HCL} × ${fmt(D_HCL, 2)} × 1000 / (100 × ${fmt(M_HCL, 2)} × ${fmt(p.V)}) = ${fmt(p.C, 2)} mol/L`, note };
  },
  protocol: (p, variantId, answer) => {
    const V0 = variantId === 'A' ? answer : volumeCommercial(p.C, p.V);
    return [
      'Mettre lunettes et gants : la solution commerciale est corrosive',
      `Prélever ${fmt(V0, 2)} mL de solution commerciale à la pipette graduée munie d’un pipeteur`,
      `Verser dans la fiole jaugée de ${fmt(p.V)} mL contenant déjà un peu d’eau distillée`,
      'Compléter à l’eau distillée jusqu’au trait de jauge, boucher et homogénéiser',
      'Plonger la sonde du pH-mètre dans la solution et lire le pH',
    ];
  },
  outcome: (p, variantId, answer) => {
    const obtained = variantId === 'A' ? concentrationObtenue(answer, p.V) : p.C;
    const pH = -log(obtained);
    const target = -log(p.C);
    const agrees = variantId === 'A' ? within(obtained, p.C, 0.03) : within(answer, p.C, 0.03);
    return {
      figure: { type: 'reading', label: 'pH de la solution préparée', value: fmt(pH, 2), color: universalColor(pH), detail: `pH attendu pour ${fmt(p.C, 2)} mol/L : ${fmt(target, 2)}` },
      summary: variantId === 'A' ? `Avec ${fmt(answer, 2)} mL prélevés, on obtient ${fmt(obtained, 3)} mol/L.` : `Avec ${fmt(volumeCommercial(p.C, p.V), 2)} mL prélevés, on obtient ${fmt(p.C, 3)} mol/L.`,
      agrees,
    };
  },
});

// ─── Produit ionique de l’eau ─────────────────────────────────

export const produitIonique = calculExercise({
  id: 'produit-ionique',
  title: 'Produit ionique de l’eau : [H₃O⁺] et [HO⁻]',
  short: 'Produit ionique de l’eau',
  summary: 'À 25 °C, [H₃O⁺] × [HO⁻] = 10⁻¹⁴ : passer du pH aux concentrations en ions, et inversement.',
  duration: '20 min',
  context: 'On mesure le pH d’une solution aqueuse à 25 °C avec un pH-mètre étalonné.',
  quantities: [
    quantity('pH', 'pH', 'pH de la solution', '', 1, 13, 0.1, 1),
    quantity('H', '[H₃O⁺]', 'Concentration en ions oxonium', 'mol/L', 0, Infinity, 0.001, -3),
    quantity('OH', '[HO⁻]', 'Concentration en ions hydroxyde', 'mol/L', 0, Infinity, 0.001, -3),
    constant('Ke', 'Ke', 'Produit ionique de l’eau à 25 °C', '', 1e-14, -2),
  ],
  paramKeys: ['pH'],
  defaults: { pH: 3 },
  random: () => ({ pH: pick([2, 3, 4, 5, 9, 10, 11, 12]) }),
  variants: [
    variant('A', 'H', ['pH'], 'Calculer la concentration en ions oxonium [H₃O⁺] de cette solution.'),
    variant('B', 'OH', ['pH', 'Ke'], 'Calculer la concentration en ions hydroxyde [HO⁻] de cette solution. Utiliser le produit ionique de l’eau.'),
    variant('C', 'pH', ['OH', 'Ke'], 'La concentration en ions hydroxyde [HO⁻] de cette solution est connue. Calculer son pH.'),
  ],
  tolerance: 0.03,
  value: (p, key) => ({ H: 10 ** -p.pH, OH: 10 ** (p.pH - 14), Ke: 1e-14 })[key] ?? p[key],
  correction: (p, unknown) => {
    const law = 'Dans l’eau, [H₃O⁺] × [HO⁻] = Ke = 10⁻¹⁴ à 25 °C, et pH = −log [H₃O⁺], donc [H₃O⁺] = 10^(−pH).';
    const note = 'Un résultat obtenu avec 10^(−pH) s’écrit avec trois chiffres significatifs au plus. Une solution acide a un pH < 7, une solution basique un pH > 7.';
    if (unknown === 'H') return { law, formula: '[H₃O⁺] = 10^(−pH)', numeric: `[H₃O⁺] = 10^(−${fmt(p.pH, 1)}) = ${fmt(10 ** -p.pH, -3)} mol/L`, note };
    if (unknown === 'OH') return { law, formula: '[HO⁻] = Ke / [H₃O⁺] = 10^(pH − 14)', numeric: `[HO⁻] = 10^(${fmt(p.pH, 1)} − 14) = ${fmt(10 ** (p.pH - 14), -3)} mol/L`, note };
    return { law, formula: 'pH = 14 + log [HO⁻]', numeric: `pH = 14 + log(${fmt(10 ** (p.pH - 14), -3)}) = ${fmt(p.pH, 1)}`, note };
  },
  protocol: () => [
    'Étalonner le pH-mètre avec deux solutions tampons',
    'Rincer la sonde puis la plonger dans la solution',
    'Attendre que la valeur se stabilise et lire le pH',
  ],
  outcome: (p, variantId, answer) => {
    const H = 10 ** -p.pH;
    const OH = 10 ** (p.pH - 14);
    const ref = variantId === 'A' ? H : variantId === 'B' ? OH : p.pH;
    return {
      figure: { type: 'reading', label: 'pH mesuré', value: fmt(p.pH, 1), color: universalColor(p.pH), detail: `[H₃O⁺] = ${fmt(H, -3)} mol/L et [HO⁻] = ${fmt(OH, -3)} mol/L` },
      summary: `Le produit [H₃O⁺] × [HO⁻] vaut ${fmt(H * OH, -2)} : c’est bien Ke.`,
      agrees: within(answer, ref, 0.03),
    };
  },
});

// ─── Constante d’acidité ──────────────────────────────────────

const PKA_ETHANOIQUE = 4.76;
const hAcideFaible = (C: number) => 10 ** -phWeakAcid(C, PKA_ETHANOIQUE);

export const constanteAcidite = calculExercise({
  id: 'constante-acidite',
  title: 'Constante d’acidité de l’acide éthanoïque',
  short: 'Constante d’acidité Ka',
  summary: 'Déduire Ka et pKa du pH d’une solution d’acide éthanoïque, et la proportion d’acide qui a réagi avec l’eau.',
  duration: '25 min',
  context: 'On mesure le pH d’une solution d’acide éthanoïque (CH₃COOH). Dans la solution, [CH₃COO⁻] = [H₃O⁺] et [CH₃COOH] = C − [H₃O⁺].',
  quantities: [
    quantity('C', 'C', 'Concentration en acide éthanoïque introduit', 'mol/L', 0.05, 0.2, 0.01, 2),
    quantity('pH', 'pH', 'pH de la solution', '', 2, 4, 0.01, 2),
    quantity('Ka', 'Ka', 'Constante d’acidité du couple', '', 0, Infinity, 1e-6, -3),
    quantity('pKa', 'pKa', 'pKa du couple CH₃COOH / CH₃COO⁻', '', 0, 14, 0.01, 2),
    quantity('tau', 'x', 'Proportion d’acide ayant réagi avec l’eau', '%', 0, 100, 0.1, 1),
  ],
  paramKeys: ['C'],
  defaults: { C: 0.1 },
  random: () => ({ C: pick([0.05, 0.08, 0.1, 0.15, 0.2]) }),
  variants: [
    variant('A', 'Ka', ['C', 'pH'], 'Calculer la constante d’acidité Ka du couple CH₃COOH / CH₃COO⁻.'),
    variant('B', 'pKa', ['C', 'pH'], 'Calculer le pKa du couple CH₃COOH / CH₃COO⁻.'),
    variant('C', 'tau', ['C', 'pH'], 'Quelle proportion de l’acide introduit a réagi avec l’eau ? Donner le rapport [CH₃COO⁻] / C en pourcentage.'),
  ],
  tolerance: 0.05,
  value: (p, key) => {
    const h = hAcideFaible(p.C);
    return ({ pH: Number((-log(h)).toFixed(2)), Ka: 10 ** -PKA_ETHANOIQUE, pKa: PKA_ETHANOIQUE, tau: (h / p.C) * 100 })[key] ?? p[key];
  },
  correction: (p, unknown) => {
    const h = hAcideFaible(p.C);
    const pH = Number((-log(h)).toFixed(2));
    const hRounded = 10 ** -pH;
    const law = 'Ka = [CH₃COO⁻] × [H₃O⁺] / [CH₃COOH], avec [CH₃COO⁻] = [H₃O⁺] = 10^(−pH) et [CH₃COOH] = C − [H₃O⁺].';
    const note = 'Seule une petite part de l’acide a réagi : la réaction avec l’eau est limitée, l’acide éthanoïque est un acide faible. Un acide est d’autant plus fort que son pKa est faible.';
    if (unknown === 'Ka') return { law, formula: 'Ka = [H₃O⁺]² / (C − [H₃O⁺])', numeric: `Ka = (${fmt(hRounded, -3)})² / (${fmt(p.C, 2)} − ${fmt(hRounded, -3)}) = ${fmt(10 ** -PKA_ETHANOIQUE, -3)}`, note };
    if (unknown === 'pKa') return { law, formula: 'pKa = −log Ka', numeric: `pKa = −log(${fmt(10 ** -PKA_ETHANOIQUE, -3)}) = ${fmt(PKA_ETHANOIQUE, 2)}`, note };
    return { law: 'La proportion d’acide ayant réagi est le rapport entre la quantité d’ions éthanoate formés et la quantité d’acide introduite.', formula: 'x = [CH₃COO⁻] / C × 100 = 10^(−pH) / C × 100', numeric: `x = ${fmt(hRounded, -3)} / ${fmt(p.C, 2)} × 100 = ${fmt((h / p.C) * 100, 1)} %`, note };
  },
  protocol: () => [
    'Prélever la solution d’acide éthanoïque dans un bécher',
    'Plonger la sonde du pH-mètre et lire le pH',
    'En déduire [H₃O⁺] = [CH₃COO⁻] et [CH₃COOH] = C − [H₃O⁺]',
  ],
  outcome: (p, variantId, answer) => {
    const h = hAcideFaible(p.C);
    const ref = variantId === 'A' ? 10 ** -PKA_ETHANOIQUE : variantId === 'B' ? PKA_ETHANOIQUE : (h / p.C) * 100;
    return {
      figure: {
        type: 'bars',
        unit: 'mol/L',
        bars: [
          { label: 'CH₃COOH restant', value: p.C - h, color: '#1e44c4' },
          { label: 'CH₃COO⁻ formé', value: h, color: '#c02d1c' },
          { label: 'H₃O⁺ formé', value: h, color: '#127546' },
        ],
      },
      summary: `Le pH mesuré est ${fmt(-log(h), 2)} : ${fmt((h / p.C) * 100, 1)} % de l’acide introduit seulement a réagi.`,
      agrees: within(answer, ref, 0.05),
    };
  },
});

// ─── Couple acide-base : forme prédominante ───────────────────

const COUPLES = [
  { acid: 'CH₃COOH', base: 'CH₃COO⁻', pKa: 4.76 },
  { acid: 'HCOOH', base: 'HCOO⁻', pKa: 3.75 },
  { acid: 'NH₄⁺', base: 'NH₃', pKa: 9.25 },
  { acid: 'CH₃NH₃⁺', base: 'CH₃NH₂', pKa: 10.66 },
];

export const predominance = calculExercise({
  id: 'predominance',
  title: 'Forme prédominante d’un couple acide-base',
  short: 'Forme prédominante et pKa',
  summary: 'Comparer le pH d’une solution au pKa d’un couple pour savoir quelle forme domine, et calculer le rapport [A⁻] / [AH].',
  duration: '20 min',
  context: 'Dans une solution de pH connu, on étudie un couple acide-base AH / A⁻ de constante pKa. Le rapport [A⁻] / [AH] vaut 10^(pH − pKa).',
  quantities: [
    quantity('pKa', 'pKa', 'pKa du couple AH / A⁻', '', 2, 11, 0.01, 2),
    quantity('pH', 'pH', 'pH de la solution', '', 0, 14, 0.1, 1),
    quantity('R', 'R', 'Rapport [A⁻] / [AH]', '', 0, Infinity, 0.001, 3),
    quantity('xb', 'x', 'Part de la forme basique A⁻', '%', 0, 100, 0.1, 1),
  ],
  paramKeys: ['pKa', 'pH'],
  defaults: { pKa: 4.76, pH: 5.76 },
  random: () => {
    const couple = pick(COUPLES);
    return { pKa: couple.pKa, pH: Number((couple.pKa + pick([-2, -1, -0.5, 0.5, 1, 2])).toFixed(1)) };
  },
  variants: [
    variant('A', 'R', ['pKa', 'pH'], 'Calculer le rapport [A⁻] / [AH] dans cette solution.'),
    variant('B', 'xb', ['pKa', 'pH'], 'Calculer la part de la forme basique A⁻ parmi l’acide et sa base conjuguée, en pourcentage.'),
  ],
  tolerance: 0.03,
  value: (p, key) => {
    const R = 10 ** (p.pH - p.pKa);
    return ({ R, xb: (100 * R) / (1 + R) })[key] ?? p[key];
  },
  warning: p => (Math.abs(p.pH - p.pKa) > 3 ? 'L’écart entre le pH et le pKa est très grand : une seule forme existe pratiquement. Rapprochez-les.' : null),
  correction: (p, unknown) => {
    const R = 10 ** (p.pH - p.pKa);
    const law = 'Pour le couple AH / A⁻ : pH = pKa + log([A⁻] / [AH]). Si pH > pKa, A⁻ prédomine ; si pH < pKa, AH prédomine ; si pH = pKa, les deux formes sont en quantités égales.';
    return unknown === 'R'
      ? { law, formula: '[A⁻] / [AH] = 10^(pH − pKa)', numeric: `[A⁻] / [AH] = 10^(${fmt(p.pH, 1)} − ${fmt(p.pKa, 2)}) = ${fmt(R, 3)}`, note: `La forme ${R > 1 ? 'basique A⁻' : 'acide AH'} prédomine.` }
      : { law, formula: 'x = 100 × R / (1 + R), avec R = 10^(pH − pKa)', numeric: `x = 100 × ${fmt(R, 3)} / (1 + ${fmt(R, 3)}) = ${fmt((100 * R) / (1 + R), 1)} %`, note: `La forme ${R > 1 ? 'basique A⁻' : 'acide AH'} prédomine.` };
  },
  protocol: p => [
    `Ajouter quelques gouttes d’un indicateur coloré dont le pKa est proche de ${fmt(p.pKa, 1)}`,
    `Régler le pH de la solution à ${fmt(p.pH, 1)}`,
    'Observer la teinte : elle est celle de la forme prédominante',
  ],
  outcome: (p, variantId, answer) => {
    const R = 10 ** (p.pH - p.pKa);
    const xb = (100 * R) / (1 + R);
    return {
      figure: { type: 'bars', unit: '%', bars: [{ label: 'Forme acide AH', value: 100 - xb, color: '#c02d1c' }, { label: 'Forme basique A⁻', value: xb, color: '#1e44c4' }] },
      summary: `À pH = ${fmt(p.pH, 1)} (pKa = ${fmt(p.pKa, 2)}), la forme ${R > 1 ? 'basique A⁻' : 'acide AH'} prédomine : [A⁻] / [AH] = ${fmt(R, 3)}.`,
      agrees: within(answer, variantId === 'A' ? R : xb, 0.03),
    };
  },
});

// ─── Solution tampon ──────────────────────────────────────────

const henderson = (na: number, nb: number) => PKA_ETHANOIQUE + log(nb / na);

export const tampon = calculExercise({
  id: 'solution-tampon',
  title: 'Préparer une solution tampon',
  short: 'Solution tampon',
  summary: 'Mélanger acide éthanoïque et éthanoate de sodium : calculer le pH du tampon ou le volume à mélanger, puis constater qu’il résiste à la dilution et à l’ajout d’acide.',
  duration: '30 min',
  context: 'On mélange un volume Va d’acide éthanoïque (pKa = 4,76) et un volume Vb d’éthanoate de sodium, de même concentration molaire.',
  equipment: ['pipette-jaugee', 'becher'],
  quantities: [
    quantity('Ca', 'Ca', 'Concentration de l’acide éthanoïque', 'mol/L', 0.05, 0.5, 0.01, 2),
    quantity('Va', 'Va', 'Volume d’acide éthanoïque', 'mL', 10, 100, 5, 0),
    quantity('Cb', 'Cb', 'Concentration de l’éthanoate de sodium', 'mol/L', 0.05, 0.5, 0.01, 2),
    quantity('Vb', 'Vb', 'Volume d’éthanoate de sodium', 'mL', 10, 100, 5, 1),
    constant('pKa', 'pKa', 'pKa du couple CH₃COOH / CH₃COO⁻', '', PKA_ETHANOIQUE, 2),
    quantity('pH', 'pH', 'pH du mélange', '', 3, 6, 0.01, 2),
  ],
  paramKeys: ['Ca', 'Va', 'Cb', 'Vb'],
  defaults: { Ca: 0.1, Va: 50, Cb: 0.1, Vb: 25 },
  random: () => ({ Ca: pick([0.1, 0.2]), Va: pick([20, 40, 50]), Cb: pick([0.1, 0.2]), Vb: pick([20, 25, 40, 50]) }),
  variants: [
    variant('A', 'pH', ['Ca', 'Va', 'Cb', 'Vb', 'pKa'], 'Calculer le pH de ce mélange. Utiliser la relation entre le pH, le pKa et le rapport des quantités de base et d’acide.'),
    variant('B', 'Vb', ['Ca', 'Va', 'Cb', 'pH', 'pKa'], 'Calculer le volume Vb d’éthanoate de sodium à ajouter pour obtenir un tampon de ce pH.'),
  ],
  tolerance: 0.03,
  value: (p, key) => ({ pH: Number(henderson(p.Ca * p.Va, p.Cb * p.Vb).toFixed(2)), pKa: PKA_ETHANOIQUE })[key] ?? p[key],
  warning: p => (Math.abs(log((p.Cb * p.Vb) / (p.Ca * p.Va))) > 1 ? 'Le rapport base / acide doit rester entre 0,1 et 10 pour que le mélange soit un bon tampon.' : null),
  correction: (p, unknown) => {
    const law = 'Un mélange d’un acide faible et de sa base conjuguée en quantités voisines est une solution tampon : pH = pKa + log(n(base) / n(acide)).';
    const na = p.Ca * p.Va;
    const nb = p.Cb * p.Vb;
    const note = 'Le pH d’un tampon change très peu par dilution (le rapport nb / na ne change pas) et par ajout d’une petite quantité d’acide ou de base. C’est le rôle des tampons dans les milieux biologiques.';
    return unknown === 'pH'
      ? { law, formula: 'pH = pKa + log(Cb × Vb / (Ca × Va))', numeric: `pH = 4,76 + log(${fmt(p.Cb, 2)} × ${fmt(p.Vb)} / (${fmt(p.Ca, 2)} × ${fmt(p.Va)})) = ${fmt(henderson(na, nb), 2)}`, note }
      : { law, formula: 'Vb = Ca × Va × 10^(pH − pKa) / Cb', numeric: `Vb = ${fmt(p.Ca, 2)} × ${fmt(p.Va)} × 10^(${fmt(henderson(na, nb), 2)} − 4,76) / ${fmt(p.Cb, 2)} = ${fmt(p.Vb, 1)} mL`, note };
  },
  protocol: (p, variantId, answer) => [
    `Verser ${fmt(p.Va)} mL d’acide éthanoïque dans un bécher`,
    `Ajouter ${fmt(variantId === 'B' ? answer : p.Vb, 1)} mL d’éthanoate de sodium et mélanger`,
    'Mesurer le pH du tampon, puis d’un échantillon dilué dix fois',
    'Ajouter 1 mL d’acide chlorhydrique à 0,1 mol/L au tampon, puis à la même quantité d’eau pure',
  ],
  outcome: (p, variantId, answer) => {
    const Vb = variantId === 'B' ? answer : p.Vb;
    const na = p.Ca * p.Va;
    const nb = p.Cb * Vb;
    const pH0 = henderson(na, nb);
    const total = p.Va + Vb;
    const apres = nb - 0.1 > 0 ? henderson(na + 0.1, nb - 0.1) : 0;
    const eau = -log(0.1 / (total + 1));
    return {
      figure: {
        type: 'bars',
        unit: 'pH',
        bars: [
          { label: 'Tampon', value: pH0, color: '#1e44c4' },
          { label: 'Tampon dilué 10 fois', value: pH0, color: '#1e44c4' },
          { label: 'Tampon + 1 mL d’acide', value: apres, color: '#127546' },
          { label: 'Eau pure + 1 mL d’acide', value: eau, color: '#c02d1c' },
        ],
      },
      summary: `Le pH du tampon vaut ${fmt(pH0, 2)} et ne change pas à la dilution. Avec 1 mL d’acide il passe à ${fmt(apres, 2)}, alors que l’eau pure passe de 7 à ${fmt(eau, 2)}.`,
      agrees: variantId === 'A' ? within(answer, Number(henderson(na, p.Cb * p.Vb).toFixed(2)), 0.03) : within(answer, p.Vb, 0.03),
    };
  },
});

// ─── Cinétique : vitesse de formation ─────────────────────────

const C_MAX = 5; // mmol/L de diiode au bout d’un temps infini
const TAU = 10; // min
const diiode = (t: number) => C_MAX * (1 - Math.exp(-t / TAU));

export const vitesseFormation = calculExercise({
  id: 'vitesse-formation',
  title: 'Vitesse de formation du diiode',
  short: 'Vitesse de formation',
  summary: 'Action des ions peroxodisulfate sur les ions iodure : suivre [I₂] au cours du temps et calculer une vitesse moyenne de formation.',
  duration: '25 min',
  context: 'On mélange des solutions d’iodure de potassium et de peroxodisulfate de potassium (2 I⁻ + S₂O₈²⁻ → I₂ + 2 SO₄²⁻). Le volume reste constant et on suit la concentration en diiode I₂.',
  quantities: [
    quantity('t1', 't₁', 'Date de la première mesure', 'min', 0, 20, 1, 0),
    quantity('t2', 't₂', 'Date de la seconde mesure', 'min', 5, 40, 1, 0),
    quantity('C1', '[I₂]₁', 'Concentration en diiode à la date t₁', 'mmol/L', 0, 5, 0.01, 2),
    quantity('C2', '[I₂]₂', 'Concentration en diiode à la date t₂', 'mmol/L', 0, 5, 0.01, 2),
    quantity('v', 'v', 'Vitesse moyenne de formation du diiode', 'mmol/L/min', 0, 5, 0.001, 3),
  ],
  paramKeys: ['t1', 't2'],
  defaults: { t1: 0, t2: 10 },
  random: () => {
    const t1 = pick([0, 2, 5, 10]);
    return { t1, t2: t1 + pick([5, 10, 15]) };
  },
  variants: [
    variant('A', 'v', ['t1', 't2', 'C1', 'C2'], 'Calculer la vitesse moyenne de formation du diiode entre les dates t₁ et t₂.'),
    variant('B', 'C2', ['t1', 't2', 'C1', 'v'], 'La vitesse moyenne de formation du diiode entre t₁ et t₂ est connue. Calculer la concentration [I₂]₂ à la date t₂.'),
  ],
  tolerance: 0.03,
  warning: p => (p.t2 <= p.t1 ? 'La seconde date doit être postérieure à la première.' : null),
  value: (p, key) => {
    const C1 = Number(diiode(p.t1).toFixed(2));
    const C2 = Number(diiode(p.t2).toFixed(2));
    return ({ C1, C2, v: (C2 - C1) / (p.t2 - p.t1) })[key] ?? p[key];
  },
  correction: (p, unknown) => {
    const C1 = Number(diiode(p.t1).toFixed(2));
    const C2 = Number(diiode(p.t2).toFixed(2));
    const v = (C2 - C1) / (p.t2 - p.t1);
    const law = 'Pour un volume constant, la vitesse moyenne de formation d’un corps entre t₁ et t₂ est la variation de sa concentration divisée par la durée : v = Δ[I₂] / Δt.';
    const note = 'La vitesse diminue au fil du temps : la courbe devient de plus en plus plate parce que les réactifs sont consommés.';
    return unknown === 'v'
      ? { law, formula: 'v = ([I₂]₂ − [I₂]₁) / (t₂ − t₁)', numeric: `v = (${fmt(C2, 2)} − ${fmt(C1, 2)}) / (${fmt(p.t2)} − ${fmt(p.t1)}) = ${fmt(v, 3)} mmol/L/min`, note }
      : { law, formula: '[I₂]₂ = [I₂]₁ + v × (t₂ − t₁)', numeric: `[I₂]₂ = ${fmt(C1, 2)} + ${fmt(v, 3)} × (${fmt(p.t2)} − ${fmt(p.t1)}) = ${fmt(C2, 2)} mmol/L`, note };
  },
  protocol: p => [
    'Mélanger volumes égaux de solutions d’iodure de potassium et de peroxodisulfate de potassium',
    'Noter la couleur jaune puis brune qui apparaît : c’est le diiode',
    `Relever la concentration en diiode aux dates t₁ = ${fmt(p.t1)} min et t₂ = ${fmt(p.t2)} min`,
    'Tracer la courbe [I₂] = f(t) et la sécante entre les deux points',
  ],
  outcome: (p, variantId, answer) => {
    const C1 = Number(diiode(p.t1).toFixed(2));
    const C2 = Number(diiode(p.t2).toFixed(2));
    const v = (C2 - C1) / (p.t2 - p.t1);
    const points = Array.from({ length: 81 }, (_, i) => ({ x: i * 0.5, y: diiode(i * 0.5) }));
    return {
      figure: { type: 'curve', xLabel: 'Temps t (min)', yLabel: '[I₂] (mmol/L)', points, secant: { x1: p.t1, y1: C1, x2: p.t2, y2: C2 } },
      summary: `Entre ${fmt(p.t1)} et ${fmt(p.t2)} min, [I₂] passe de ${fmt(C1, 2)} à ${fmt(C2, 2)} mmol/L : la vitesse moyenne de formation vaut ${fmt(v, 3)} mmol/L/min.`,
      agrees: within(answer, variantId === 'A' ? v : C2, 0.03),
    };
  },
});

// ─── Cinétique : vitesses et stœchiométrie ────────────────────

export const vitessesStoechiometrie = calculExercise({
  id: 'vitesses-stoechiometrie',
  title: 'Vitesses de disparition et de formation, et stœchiométrie',
  short: 'Vitesses et stœchiométrie',
  summary: 'Permanganate et acide oxalique : relier la vitesse de disparition d’un réactif aux vitesses des autres espèces grâce aux coefficients de l’équation.',
  duration: '20 min',
  context: 'L’acide oxalique réduit les ions permanganate en milieu acide : 2 MnO₄⁻ + 5 H₂C₂O₄ + 6 H₃O⁺ → 2 Mn²⁺ + 10 CO₂ + 14 H₂O. Les vitesses de formation et de disparition sont toutes positives.',
  quantities: [
    quantity('vMnO4', 'v(MnO₄⁻)', 'Vitesse de disparition des ions permanganate', 'mmol/L/min', 0.1, 2, 0.1, 2),
    quantity('vOx', 'v(H₂C₂O₄)', 'Vitesse de disparition de l’acide oxalique', 'mmol/L/min', 0, Infinity, 0.01, 2),
    quantity('vMn', 'v(Mn²⁺)', 'Vitesse de formation des ions manganèse(II)', 'mmol/L/min', 0, Infinity, 0.01, 2),
    quantity('vCO2', 'v(CO₂)', 'Vitesse de formation du dioxyde de carbone', 'mmol/L/min', 0, Infinity, 0.01, 2),
  ],
  paramKeys: ['vMnO4'],
  defaults: { vMnO4: 0.4 },
  random: () => ({ vMnO4: pick([0.2, 0.4, 0.6, 0.8, 1]) }),
  variants: [
    variant('A', 'vOx', ['vMnO4'], 'Calculer la vitesse de disparition de l’acide oxalique.'),
    variant('B', 'vMn', ['vMnO4'], 'Calculer la vitesse de formation des ions manganèse(II).'),
    variant('C', 'vCO2', ['vMnO4'], 'Calculer la vitesse de formation du dioxyde de carbone.'),
  ],
  tolerance: 0.02,
  value: (p, key) => ({ vOx: 2.5 * p.vMnO4, vMn: p.vMnO4, vCO2: 5 * p.vMnO4 })[key] ?? p[key],
  correction: (p, unknown) => {
    const x = p.vMnO4 / 2;
    const law = 'Les vitesses sont proportionnelles aux coefficients de l’équation : v(MnO₄⁻) / 2 = v(H₂C₂O₄) / 5 = v(Mn²⁺) / 2 = v(CO₂) / 10.';
    const note = `Chacun de ces rapports vaut ${fmt(x, 2)} mmol/L/min : c’est la vitesse volumique de la réaction. Le manganèse(II) formé catalyse la réaction : on parle d’autocatalyse.`;
    if (unknown === 'vOx') return { law, formula: 'v(H₂C₂O₄) = 5 / 2 × v(MnO₄⁻)', numeric: `v(H₂C₂O₄) = 5 / 2 × ${fmt(p.vMnO4, 2)} = ${fmt(2.5 * p.vMnO4, 2)} mmol/L/min`, note };
    if (unknown === 'vMn') return { law, formula: 'v(Mn²⁺) = 2 / 2 × v(MnO₄⁻)', numeric: `v(Mn²⁺) = ${fmt(p.vMnO4, 2)} mmol/L/min`, note };
    return { law, formula: 'v(CO₂) = 10 / 2 × v(MnO₄⁻)', numeric: `v(CO₂) = 5 × ${fmt(p.vMnO4, 2)} = ${fmt(5 * p.vMnO4, 2)} mmol/L/min`, note };
  },
  protocol: () => [
    'Mélanger la solution de permanganate de potassium acidifiée et la solution d’acide oxalique',
    'Chauffer légèrement : la décoloration, très lente à froid, devient rapide à 70 °C',
    'Suivre la disparition des ions permanganate (violet) et en déduire sa vitesse',
    'Comparer avec les vitesses des autres espèces grâce aux coefficients de l’équation',
  ],
  outcome: (p, variantId, answer) => {
    const unknown = variantId === 'A' ? 'vOx' : variantId === 'B' ? 'vMn' : 'vCO2';
    const ref = ({ vOx: 2.5 * p.vMnO4, vMn: p.vMnO4, vCO2: 5 * p.vMnO4 })[unknown] ?? 0;
    return {
      figure: {
        type: 'bars',
        unit: 'mmol/L/min',
        bars: [
          { label: 'MnO₄⁻ (disparition)', value: p.vMnO4, color: '#7c3aed' },
          { label: 'H₂C₂O₄ (disparition)', value: 2.5 * p.vMnO4, color: '#1e44c4' },
          { label: 'Mn²⁺ (formation)', value: p.vMnO4, color: '#127546' },
          { label: 'CO₂ (formation)', value: 5 * p.vMnO4, color: '#c02d1c' },
        ],
      },
      summary: `Le rapport v / coefficient est le même pour toutes les espèces : ${fmt(p.vMnO4 / 2, 2)} mmol/L/min.`,
      agrees: within(answer, ref, 0.02),
    };
  },
});

// ─── Rendement d’une estérification ───────────────────────────

const M_ESTER = 88.11; // éthanoate d’éthyle, g/mol
const RENDEMENT = 67; // % pour un mélange équimolaire d’acide et d’alcool primaire

export const rendementEsterification = calculExercise({
  id: 'rendement-esterification',
  title: 'Rendement d’une estérification',
  short: 'Rendement d’une estérification',
  summary: 'Acide éthanoïque et éthanol : masse d’ester obtenue et rendement d’une réaction limitée.',
  duration: '25 min',
  context: 'On chauffe à reflux n₀ mol d’acide éthanoïque et n₀ mol d’éthanol avec un peu d’acide sulfurique : CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O. L’état d’équilibre est atteint.',
  quantities: [
    quantity('n0', 'n₀', 'Quantité d’acide éthanoïque (et d’éthanol) introduite', 'mol', 0.1, 1, 0.1, 1),
    constant('M', 'M', 'Masse molaire de l’éthanoate d’éthyle', 'g/mol', M_ESTER, 2),
    quantity('r', 'r', 'Rendement de la réaction', '%', 0, 100, 1, 0),
    quantity('m', 'm', 'Masse d’ester obtenue', 'g', 0, Infinity, 0.01, 2),
  ],
  paramKeys: ['n0'],
  defaults: { n0: 0.5 },
  random: () => ({ n0: pick([0.1, 0.2, 0.3, 0.5, 1]) }),
  variants: [
    variant('A', 'r', ['n0', 'M', 'm'], 'On obtient cette masse m d’ester. Calculer le rendement r de l’estérification.'),
    variant('B', 'm', ['n0', 'M', 'r'], 'Le rendement de l’estérification est connu. Calculer la masse m d’ester obtenue.'),
  ],
  tolerance: 0.03,
  value: (p, key) => ({ M: M_ESTER, r: RENDEMENT, m: (RENDEMENT / 100) * p.n0 * M_ESTER })[key] ?? p[key],
  correction: (p, unknown) => {
    const law = 'Le rendement est le rapport entre la quantité d’ester réellement formée et la quantité maximale que donnerait une réaction totale : r = n(ester obtenu) / n(ester théorique) × 100. Ici n(ester théorique) = n₀.';
    const note = 'Le mélange équimolaire d’un acide et d’un alcool primaire donne environ 67 % d’ester à l’équilibre. Chauffer accélère la réaction mais ne déplace pas l’équilibre ; un excès de l’un des réactifs ou l’élimination de l’eau augmente le rendement.';
    const m = (RENDEMENT / 100) * p.n0 * M_ESTER;
    return unknown === 'r'
      ? { law, formula: 'r = (m / M) / n₀ × 100', numeric: `r = (${fmt(m, 2)} / ${fmt(M_ESTER, 2)}) / ${fmt(p.n0, 1)} × 100 = ${RENDEMENT} %`, note }
      : { law, formula: 'm = r × n₀ × M / 100', numeric: `m = ${RENDEMENT} × ${fmt(p.n0, 1)} × ${fmt(M_ESTER, 2)} / 100 = ${fmt(m, 2)} g`, note };
  },
  protocol: p => [
    `Introduire ${fmt(p.n0, 1)} mol d’acide éthanoïque et ${fmt(p.n0, 1)} mol d’éthanol dans un ballon`,
    'Ajouter quelques gouttes d’acide sulfurique concentré et des grains de pierre ponce',
    'Chauffer à reflux : la réaction est lente sans chauffage',
    'Refroidir, laver, décanter et peser l’ester obtenu',
  ],
  outcome: (p, variantId, answer) => {
    const nObtenu = (RENDEMENT / 100) * p.n0;
    const nClasse = variantId === 'A' ? (answer / 100) * p.n0 : answer / M_ESTER;
    const ref = variantId === 'A' ? RENDEMENT : nObtenu * M_ESTER;
    return {
      figure: {
        type: 'bars',
        unit: 'mol',
        bars: [
          { label: 'Ester théorique (réaction totale)', value: p.n0, color: '#46526a' },
          { label: 'Ester obtenu (expérience)', value: nObtenu, color: '#127546' },
          { label: 'Ester selon la classe', value: nClasse, color: '#1e44c4' },
        ],
      },
      summary: `On obtient ${fmt(nObtenu * M_ESTER, 2)} g d’ester, soit ${RENDEMENT} % du maximum : la réaction est limitée.`,
      agrees: within(answer, ref, 0.03),
    };
  },
});

// ─── Dosage de l’éthanol dans un vin ──────────────────────────

const M_ETHANOL = 46.07;
const RHO_ETHANOL = 789;
const V2 = 10;
const V3 = 20;
const C3 = 0.1;
const C4 = 0.2;
const c1Ethanol = (pct: number) => (pct * 10 * RHO_ETHANOL / 1000) / M_ETHANOL;
const v4Equivalent = (pct: number) => (6 * C3 * V3 - (4 * c1Ethanol(pct) * V2) / 10) / C4;
const pctFromV4 = (V4: number) => (((10 * (6 * C3 * V3 - C4 * V4)) / (4 * V2)) * M_ETHANOL * 100) / RHO_ETHANOL;

export const dosageVin = calculExercise({
  id: 'dosage-ethanol-vin',
  title: 'Dosage de l’éthanol dans un vin',
  short: 'Éthanol d’un vin',
  summary: 'Après distillation, l’éthanol est oxydé par le dichromate en excès, dosé en retour par le sel de Mohr : volume à verser ou degré alcoolique du vin.',
  duration: '35 min',
  context: 'On distille le vin puis on dose l’éthanol : oxydation par le dichromate de potassium en excès (Cr₂O₇²⁻ → Cr³⁺), puis dosage de l’excès par les ions fer(II) du sel de Mohr. Le virage de l’indicateur va du vert au rouge vineux.',
  equipment: ['burette', 'pipette-jaugee', 'fiole-jaugee', 'becher'],
  quantities: [
    quantity('pct', '% vol', 'Degré alcoolique de l’étiquette', '% vol', 5, 17, 0.5, 1),
    constant('V2', 'V₂', 'Volume de solution diluée S₂ dosée', 'mL', V2, 1),
    constant('V3', 'V₃', 'Volume de dichromate ajouté', 'mL', V3, 1),
    constant('c3', 'c₃', 'Concentration du dichromate de potassium', 'mol/L', C3, 4),
    constant('c4', 'c₄', 'Concentration du sel de Mohr', 'mol/L', C4, 4),
    constant('M', 'M', 'Masse molaire de l’éthanol', 'g/mol', M_ETHANOL, 2),
    constant('rho', 'ρ', 'Masse volumique de l’éthanol pur à 20 °C', 'g/L', RHO_ETHANOL, 0),
    quantity('V4', 'V₄', 'Volume de sel de Mohr versé à l’équivalence', 'mL', 1, 50, 0.1, 2),
  ],
  paramKeys: ['pct'],
  defaults: { pct: 10 },
  random: () => ({ pct: pick([8, 10, 11, 12, 13, 14]) }),
  variants: [
    variant('A', 'V4', ['pct', 'V2', 'V3', 'c3', 'c4', 'M', 'rho'], 'Le vin porte l’indication donnée sur l’étiquette. Calculer le volume théorique V₄ de sel de Mohr qu’on doit verser pour atteindre l’équivalence. On sait que S₂ est dix fois plus diluée que S₁.'),
    variant('B', 'pct', ['V4', 'V2', 'V3', 'c3', 'c4', 'M', 'rho'], 'On a versé ce volume V₄ de sel de Mohr à l’équivalence. Calculer le degré alcoolique du vin, en % en volume.'),
  ],
  tolerance: 0.03,
  value: (p, key) => ({ V2, V3, c3: C3, c4: C4, M: M_ETHANOL, rho: RHO_ETHANOL, V4: Number(v4Equivalent(p.pct).toFixed(2)) })[key] ?? p[key],
  correction: (p, unknown) => {
    const law = 'Bilan en électrons : 1 mol de dichromate en capte 6, 1 mol d’éthanol en cède 4 et 1 mol de Fe²⁺ en cède 1. Donc 6 c₃V₃ = 4 c₂V₂ + c₄V₄, avec c₂ = c₁ / 10 (S₂ est S₁ diluée dix fois).';
    const note = 'La concentration c₁ en éthanol donne la masse par litre (c₁ × M), puis le volume d’alcool pur (masse / ρ) : % vol = 100 × c₁ × M / ρ. Un vin à 10 % vol correspond à c₁ ≈ 1,71 mol/L.';
    const V4 = Number(v4Equivalent(p.pct).toFixed(2));
    return unknown === 'V4'
      ? { law, formula: 'V₄ = (6 c₃V₃ − 4 c₂V₂) / c₄, avec c₂ = c₁ / 10 et c₁ = % vol × ρ / (100 × M)', numeric: `V₄ = (6 × ${C3} × ${V3} − 4 × ${fmt(c1Ethanol(p.pct) / 10, 3)} × ${V2}) / ${C4} = ${fmt(V4, 2)} mL`, note }
      : { law, formula: '% vol = 100 × c₁ × M / ρ, avec c₁ = 10 c₂ et c₂ = (6 c₃V₃ − c₄V₄) / (4 V₂)', numeric: `% vol = 100 × ${fmt(c1Ethanol(p.pct), 3)} × ${M_ETHANOL} / ${RHO_ETHANOL} = ${fmt(p.pct, 1)} % vol`, note };
  },
  protocol: () => [
    'Distiller 100,0 mL de vin et compléter le distillat à 100,0 mL : solution S₁',
    'Diluer dix fois S₁ : solution S₂',
    'Prélever V₂ = 10,0 mL de S₂ dans un erlenmeyer',
    'Ajouter V₃ = 20,0 mL de dichromate à 0,1000 mol/L, puis environ 10 mL d’acide sulfurique concentré (lunettes et gants)',
    'Ajouter quelques gouttes de diphénylamine sulfonate et laisser agir 10 à 15 minutes',
    'Verser le sel de Mohr à 0,2000 mol/L jusqu’au virage du vert au rouge vineux',
  ],
  outcome: (p, variantId, answer) => {
    const V4 = v4Equivalent(p.pct);
    if (variantId === 'A') {
      const reached = answer >= V4 - 0.05;
      return {
        figure: {
          type: 'reading',
          label: `Après ${fmt(answer, 2)} mL de sel de Mohr`,
          value: reached ? 'Rouge vineux' : 'Vert',
          color: reached ? '#7a1f3d' : '#3a7d44',
          detail: reached ? `L’équivalence est atteinte à ${fmt(V4, 2)} mL.` : `Le dichromate est encore en excès : l’équivalence est à ${fmt(V4, 2)} mL.`,
        },
        summary: reached ? 'Le virage a lieu : le dichromate en excès est entièrement réduit.' : 'La solution reste verte : il faut verser davantage de sel de Mohr.',
        agrees: within(answer, V4, 0.03),
      };
    }
    return {
      figure: { type: 'reading', label: 'Degré alcoolique du vin', value: `${fmt(p.pct, 1)} % vol`, color: '#7a1f3d', detail: `Le virage a lieu à V₄ = ${fmt(V4, 2)} mL (c₁ = ${fmt(c1Ethanol(p.pct), 2)} mol/L).` },
      summary: `La classe trouve ${fmt(answer, 1)} % vol. Le virage observé à V₄ = ${fmt(V4, 2)} mL correspond à ${fmt(pctFromV4(V4), 1)} % vol.`,
      agrees: within(answer, p.pct, 0.03),
    };
  },
});

// ─── Préparation d’un savon ───────────────────────────────────

const RHO_HUILE = 0.91; // g/mL
const M_HUILE = 885.4; // trioléine, g/mol
const M_SAVON = 304.4; // oléate de sodium, g/mol
const C_SOUDE = 3; // mol/L
const nHuile = (Vh: number) => (Vh * RHO_HUILE) / M_HUILE;
const nSoudeNecessaire = (Vh: number) => 3 * nHuile(Vh);
const nSavon = (Vh: number, Vs: number) => Math.min(3 * nHuile(Vh), (C_SOUDE * Vs) / 1000);

export const saponification = calculExercise({
  id: 'saponification',
  title: 'Préparer un savon : la saponification',
  short: 'Préparation d’un savon',
  summary: 'Huile d’olive et soude : quantité de soude nécessaire ou masse de savon que l’on peut former, en repérant le réactif limitant.',
  duration: '30 min',
  context: 'On chauffe à reflux de l’huile d’olive (assimilée à la trioléine, M = 885,4 g/mol, masse volumique 0,91 g/mL) avec une solution de soude à 3 mol/L et de l’éthanol. Chaque molécule d’huile réagit avec 3 HO⁻ et donne 3 ions oléate (le savon, M = 304,4 g/mol) et du glycérol.',
  quantities: [
    quantity('Vh', 'Vh', 'Volume d’huile d’olive', 'mL', 10, 40, 5, 0),
    quantity('Vs', 'Vs', 'Volume de solution de soude', 'mL', 10, 40, 5, 0),
    constant('Cs', 'Cs', 'Concentration de la soude', 'mol/L', C_SOUDE, 0),
    constant('rho', 'ρ', 'Masse volumique de l’huile', 'g/mL', RHO_HUILE, 2),
    constant('Mh', 'Mh', 'Masse molaire de l’huile (trioléine)', 'g/mol', M_HUILE, 1),
    constant('Ms', 'Ms', 'Masse molaire du savon (oléate de sodium)', 'g/mol', M_SAVON, 1),
    quantity('nNaOH', 'n(HO⁻)', 'Quantité de soude nécessaire', 'mol', 0, Infinity, 0.001, 4),
    quantity('mSavon', 'm', 'Masse maximale de savon', 'g', 0, Infinity, 0.01, 2),
  ],
  paramKeys: ['Vh', 'Vs'],
  defaults: { Vh: 20, Vs: 20 },
  random: () => ({ Vh: pick([10, 15, 20, 25]), Vs: pick([15, 20, 30, 40]) }),
  variants: [
    variant('A', 'nNaOH', ['Vh', 'rho', 'Mh'], 'Calculer la quantité de soude nécessaire pour saponifier toute l’huile.'),
    variant('B', 'mSavon', ['Vh', 'Vs', 'Cs', 'rho', 'Mh', 'Ms'], 'Calculer la masse maximale de savon que l’on peut former. Repérer d’abord le réactif limitant.'),
  ],
  tolerance: 0.03,
  value: (p, key) => ({ Cs: C_SOUDE, rho: RHO_HUILE, Mh: M_HUILE, Ms: M_SAVON, nNaOH: nSoudeNecessaire(p.Vh), mSavon: nSavon(p.Vh, p.Vs) * M_SAVON })[key] ?? p[key],
  correction: (p, unknown) => {
    const law = 'Équation : huile + 3 HO⁻ → glycérol + 3 oléate. n(huile) = V × ρ / M ; il faut 3 mol de HO⁻ par mole d’huile, et chaque mole d’huile donne 3 mol de savon.';
    const note = 'Le savon est précipité par l’eau salée (relargage), puis filtré. Une solution de soude concentrée est corrosive : gants et lunettes.';
    if (unknown === 'nNaOH') return { law, formula: 'n(HO⁻) = 3 × Vh × ρ / Mh', numeric: `n(HO⁻) = 3 × ${fmt(p.Vh)} × ${fmt(RHO_HUILE, 2)} / ${fmt(M_HUILE, 1)} = ${fmt(nSoudeNecessaire(p.Vh), 4)} mol`, note };
    const introduite = (C_SOUDE * p.Vs) / 1000;
    const limitant = introduite < nSoudeNecessaire(p.Vh) ? 'la soude' : 'l’huile';
    return { law: `${law} Réactif limitant ici : ${limitant}.`, formula: 'm = min(3 n(huile) ; n(HO⁻)) × Ms', numeric: `m = min(${fmt(nSoudeNecessaire(p.Vh), 4)} ; ${fmt(introduite, 4)}) × ${fmt(M_SAVON, 1)} = ${fmt(nSavon(p.Vh, p.Vs) * M_SAVON, 2)} g`, note };
  },
  protocol: p => [
    `Dans un ballon, introduire ${fmt(p.Vh)} mL d’huile d’olive, 20 mL d’éthanol et ${fmt(p.Vs)} mL de soude à 3 mol/L (gants et lunettes)`,
    'Adapter un réfrigérant à eau et porter à ébullition douce pendant 30 minutes',
    'Laisser refroidir légèrement puis verser dans un grand bécher d’eau froide saturée en sel',
    'Filtrer le savon, le mouler et le laisser sécher',
  ],
  outcome: (p, variantId, answer) => {
    const necessaire = nSoudeNecessaire(p.Vh);
    const introduite = (C_SOUDE * p.Vs) / 1000;
    const m = nSavon(p.Vh, p.Vs) * M_SAVON;
    return {
      figure: {
        type: 'bars',
        unit: 'mol',
        bars: [
          { label: 'Huile introduite', value: nHuile(p.Vh), color: '#c4902f' },
          { label: 'Soude nécessaire', value: necessaire, color: '#1e44c4' },
          { label: 'Soude introduite', value: introduite, color: introduite < necessaire ? '#c02d1c' : '#127546' },
        ],
      },
      summary: `${introduite < necessaire ? 'La soude est le réactif limitant' : 'L’huile est le réactif limitant'} : on forme au plus ${fmt(m, 2)} g de savon.`,
      agrees: within(answer, variantId === 'A' ? necessaire : m, 0.03),
    };
  },
});

// ─── Dosage d’oxydoréduction : permanganate et acide oxalique ─

const C_PERMANGANATE = 0.02;
const volumeEquivalentOxalique = (Cox: number, Vox: number) => (0.4 * Cox * Vox) / C_PERMANGANATE;

export const dosagePermanganate = calculExercise({
  id: 'dosage-permanganate',
  title: 'Dosage de l’acide oxalique par le permanganate',
  short: 'Dosage permanganate / acide oxalique',
  summary: 'Dosage d’oxydoréduction : le permanganate violet se décolore tant qu’il réagit, puis une teinte rose persiste à l’équivalence.',
  duration: '30 min',
  context: 'On dose un volume Vox d’acide oxalique (H₂C₂O₄) acidifié et chauffé par une solution de permanganate de potassium à 0,020 mol/L : 2 MnO₄⁻ + 5 H₂C₂O₄ + 6 H₃O⁺ → 2 Mn²⁺ + 10 CO₂ + 14 H₂O.',
  equipment: ['burette', 'pipette-jaugee', 'becher', 'statif'],
  quantities: [
    quantity('Cox', 'Cox', 'Concentration de l’acide oxalique', 'mol/L', 0.02, 0.2, 0.01, 2),
    quantity('Vox', 'Vox', 'Volume d’acide oxalique dosé', 'mL', 5, 25, 5, 0),
    constant('Cm', 'Cm', 'Concentration du permanganate de potassium', 'mol/L', C_PERMANGANATE, 3),
    quantity('Ve', 'Ve', 'Volume de permanganate versé à l’équivalence', 'mL', 1, 50, 0.1, 2),
  ],
  paramKeys: ['Cox', 'Vox'],
  defaults: { Cox: 0.05, Vox: 10 },
  random: () => ({ Cox: pick([0.04, 0.05, 0.06, 0.08, 0.1]), Vox: pick([10, 15, 20]) }),
  variants: [
    variant('A', 'Ve', ['Cox', 'Vox', 'Cm'], 'Calculer le volume équivalent Ve de permanganate de potassium à verser.'),
    variant('B', 'Cox', ['Vox', 'Cm', 'Ve'], 'Le virage est observé pour ce volume équivalent Ve. Calculer la concentration Cox de l’acide oxalique.'),
  ],
  tolerance: 0.03,
  value: (p, key) => ({ Cm: C_PERMANGANATE, Ve: Number(volumeEquivalentOxalique(p.Cox, p.Vox).toFixed(2)) })[key] ?? p[key],
  warning: p => (volumeEquivalentOxalique(p.Cox, p.Vox) > 45 ? 'Le volume équivalent dépasse la burette : diminuez Cox ou Vox.' : null),
  correction: (p, unknown) => {
    const law = 'À l’équivalence, les réactifs sont dans les proportions de l’équation : n(MnO₄⁻) / 2 = n(H₂C₂O₄) / 5, soit Cm × Ve / 2 = Cox × Vox / 5.';
    const note = 'Le permanganate, violet, se décolore tant qu’il réagit ; à l’équivalence, la première goutte en excès donne une teinte rose persistante. La réaction est lente au début, puis les ions Mn²⁺ formés la catalysent : c’est une autocatalyse.';
    const Ve = Number(volumeEquivalentOxalique(p.Cox, p.Vox).toFixed(2));
    return unknown === 'Ve'
      ? { law, formula: 'Ve = 2 × Cox × Vox / (5 × Cm)', numeric: `Ve = 2 × ${fmt(p.Cox, 2)} × ${fmt(p.Vox)} / (5 × ${fmt(C_PERMANGANATE, 3)}) = ${fmt(Ve, 2)} mL`, note }
      : { law, formula: 'Cox = 5 × Cm × Ve / (2 × Vox)', numeric: `Cox = 5 × ${fmt(C_PERMANGANATE, 3)} × ${fmt(Ve, 2)} / (2 × ${fmt(p.Vox)}) = ${fmt(p.Cox, 2)} mol/L`, note };
  },
  protocol: p => [
    `Prélever ${fmt(p.Vox)} mL d’acide oxalique, acidifier avec de l’acide sulfurique et chauffer vers 60 °C`,
    'Remplir la burette de permanganate de potassium à 0,020 mol/L',
    'Verser goutte à goutte : chaque goutte se décolore de plus en plus vite (autocatalyse)',
    'Arrêter à la première teinte rose qui persiste',
  ],
  outcome: (p, variantId, answer) => {
    const Ve = volumeEquivalentOxalique(p.Cox, p.Vox);
    const poured = variantId === 'A' ? answer : Ve;
    const reached = poured >= Ve - 0.05;
    return {
      figure: {
        type: 'reading',
        label: `Après ${fmt(poured, 2)} mL de permanganate`,
        value: reached ? 'Rose persistant' : 'Incolore',
        color: reached ? '#d46aa8' : '#f4f6fa',
        detail: reached ? `L’équivalence est atteinte à ${fmt(Ve, 2)} mL.` : `Le permanganate est encore consommé : l’équivalence est à ${fmt(Ve, 2)} mL.`,
      },
      summary: reached ? 'Le permanganate n’est plus consommé : la teinte rose persiste.' : 'Le permanganate versé est entièrement consommé : la solution reste incolore.',
      agrees: within(answer, variantId === 'A' ? Ve : p.Cox, 0.03),
    };
  },
});

export const EXERCICES_CHIMIE = [dilutionCommerciale, produitIonique, constanteAcidite, predominance, tampon, vitesseFormation, vitessesStoechiometrie, rendementEsterification, dosageVin, saponification, dosagePermanganate];

