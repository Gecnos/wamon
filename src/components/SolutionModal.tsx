import type { VerificationResult } from '../types';

interface SolutionModalProps {
  result: VerificationResult;
  varianteId: string;
  params: Record<string, number>;
  onClose: () => void;
}

export default function SolutionModal({
  result,
  varianteId,
  params,
  onClose,
}: SolutionModalProps) {
  const { Ca, Va, Cb } = params;
  const theoreticalVe = (Ca * Va) / Cb;
  const isVolumeUnknown = varianteId === 'A';
  const theoreticalValue = isVolumeUnknown ? theoreticalVe : (Cb * (params.Ve ?? 20)) / Va;

  return (
    <div className="modal-overlay flex items-center justify-center p-4">
      <div className="glass-card modal-content max-w-lg w-full p-6 animate-scaleIn">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <h2 className="text-lg font-bold text-emerald flex items-center gap-2">
            <span>💡</span> Démonstration & Solution Détaillée
          </h2>
          <button
            className="text-muted hover:text-white font-bold text-lg"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <h3 className="font-bold text-white mb-1">Équation-Bilan de la Réaction :</h3>
            <div className="font-mono text-emerald font-bold text-sm bg-slate-950 p-2 rounded">
              H₃O⁺(aq) + HO⁻(aq) ➔ 2 H₂O(l)
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <h3 className="font-bold text-white mb-1">Relation à l'Équivalence :</h3>
            <p className="text-muted mb-2">
              À l'équivalence, les réactifs ont été introduits dans les proportions stœchiométriques :
            </p>
            <div className="font-mono text-cyan font-bold text-sm bg-slate-950 p-2 rounded mb-2">
              n(H₃O⁺) = n(HO⁻)  ➔  Cₐ × Vₐ = Cᵦ × Vₑ
            </div>

            <div className="space-y-1 font-mono text-muted">
              <div>Cₐ = {Ca} mol/L</div>
              <div>Vₐ = {Va} mL</div>
              <div>Cᵦ = {Cb} mol/L</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
            <h3 className="font-bold text-emerald mb-1">Calcul du {isVolumeUnknown ? 'Volume d’Équivalence Théorique Vₑ' : 'Concentration Inconnue Cₐ'} :</h3>
            <div className="font-mono font-bold text-sm text-white">
              {isVolumeUnknown ? `Vₑ = (Cₐ × Vₐ) / Cᵦ = (${Ca} × ${Va}) / ${Cb}` : `Cₐ = (Cᵦ × Vₑ) / Vₐ = (${Cb} × ${params.Ve}) / ${Va}`} = <span className="text-emerald">{theoreticalValue.toFixed(2)} {isVolumeUnknown ? 'mL' : 'mol/L'}</span>
            </div>
          </div>

          {result && (
            <div className="p-3 rounded-lg bg-slate-950/60 border border-border">
              <h3 className="font-bold text-white mb-1">Écart avec votre réponse :</h3>
              <div className="flex justify-between font-mono">
                <span>Votre Réponse : <strong>{result.userValue} {isVolumeUnknown ? 'mL' : 'mol/L'}</strong></span>
                <span>Théorique : <strong>{result.referenceValue.toFixed(2)} {isVolumeUnknown ? 'mL' : 'mol/L'}</strong></span>
              </div>
              <div className="mt-2 text-2xs text-muted">
                Statut : <strong className={result.isCoherent ? 'text-emerald' : 'text-rose-400'}>{result.details}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn btn-primary px-6" onClick={onClose}>
            Compris !
          </button>
        </div>
      </div>
    </div>
  );
}
