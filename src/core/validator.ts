import { VerificationResult } from '../types';

/**
 * Vérifie si la valeur saisie par l'élève est cohérente avec la valeur théorique de référence.
 * 
 * @param userValue Valeur proposée par l'élève/classe
 * @param referenceValue Valeur théorique calculée par le modèle
 * @param tolerance Tolérance relative (ex: 0.02 pour 2%)
 */
export function verifyResult(
  userValue: number,
  referenceValue: number,
  tolerance: number = 0.02
): VerificationResult {
  const diffValue = userValue - referenceValue;
  const absDiff = Math.abs(diffValue);
  
  // Différence en pourcentage par rapport à la valeur de référence
  const diffPercent = referenceValue !== 0 
    ? (absDiff / Math.abs(referenceValue)) * 100 
    : absDiff * 100;

  const isCoherent = (absDiff / Math.abs(referenceValue)) <= tolerance;

  const userFormatted = Number(userValue.toFixed(3));
  const refFormatted = Number(referenceValue.toFixed(3));
  const percentFormatted = Number(diffPercent.toFixed(2));

  let details = '';
  if (isCoherent) {
    details = `Résultat cohérent ! La valeur saisie (${userFormatted}) est proche de la valeur théorique (${refFormatted}) à ${percentFormatted}% près (tolérance autorisée : ${(tolerance * 100).toFixed(1)}%).`;
  } else {
    details = `Résultat incohérent. La valeur saisie (${userFormatted}) s'écarte de la valeur théorique (${refFormatted}) de ${percentFormatted}% (écart supérieur à la tolérance de ${(tolerance * 100).toFixed(1)}%).`;
  }

  return {
    isCoherent,
    referenceValue,
    userValue,
    diffValue,
    diffPercent,
    tolerance,
    details
  };
}
