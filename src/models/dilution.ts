/**
 * Modèle physique du module de Dilution (Validation d'extensibilité du moteur).
 * Formule fondamentale de dilution : C_mere * V_mere = C_fille * V_fille
 */

export interface DilutionState {
  Vmere: number;
  Vfille: number;
  Cmere: number;
  Cfille: number;
  facteurDilution: number;
}

export function calculateDilution(params: {
  Cmere?: number;
  Vmere?: number;
  Cfille?: number;
  Vfille?: number;
}): DilutionState {
  let { Cmere = 1.0, Vmere = 10, Cfille, Vfille = 100 } = params;

  if (Cfille === undefined && Cmere && Vmere && Vfille) {
    Cfille = (Cmere * Vmere) / Vfille;
  } else if (Vmere === undefined && Cmere && Cfille && Vfille) {
    Vmere = (Cfille * Vfille) / Cmere;
  }

  const facteurDilution = Cmere / (Cfille || 0.1);

  return {
    Vmere,
    Vfille,
    Cmere,
    Cfille: Cfille || 0.1,
    facteurDilution: Number(facteurDilution.toFixed(2)),
  };
}
