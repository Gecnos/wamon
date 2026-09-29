import { VerificationResult } from '../../types';

export function createSolutionModalHTML(
  verif: VerificationResult,
  varianteId: string,
  params: Record<string, number>
): string {
  const isVariantA = varianteId === 'A';

  return `
    <div class="modal-overlay active" id="solution-modal">
      <div class="modal-content glass-modal solution-card max-w-2xl">
        <div class="modal-header">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <span>💡</span> Solution Détaillée de l'Exercice
          </h2>
          <button class="btn-close-modal" id="btn-close-solution">✕</button>
        </div>

        <div class="solution-body p-4 space-y-4 text-slate-100">
          <!-- Rappel du principe physico-chimique -->
          <div class="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
            <h3 class="font-bold text-sky-400 mb-1">1. Principe de l'Équivalence Acido-Basique :</h3>
            <p class="text-sm">
              À l'équivalence d'un dosage acide fort / base forte, les réactifs ont été introduits dans les proportions stœchiométriques :
            </p>
            <div class="text-center font-mono my-2 text-lg text-emerald-400">
              n(acide) = n(base) &nbsp; ⟺ &nbsp; Ca × Va = Cb × Ve
            </div>
          </div>

          <!-- Formule littérale et Application numérique -->
          <div class="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
            <h3 class="font-bold text-sky-400 mb-1">2. Résolution pas-à-pas :</h3>
            ${isVariantA ? `
              <p class="text-sm mb-2">On cherche le volume équivalent <strong>Ve</strong> :</p>
              <div class="font-mono text-center my-2 text-yellow-300">
                Ve = (Ca × Va) / Cb
              </div>
              <p class="text-sm">Application numérique :</p>
              <div class="font-mono text-center my-2 text-slate-200">
                Ve = (${params.Ca} mol/L × ${params.Va} mL) / ${params.Cb} mol/L = <strong>${verif.referenceValue.toFixed(2)} mL</strong>
              </div>
            ` : `
              <p class="text-sm mb-2">On cherche la concentration de l'acide <strong>Ca</strong> :</p>
              <div class="font-mono text-center my-2 text-yellow-300">
                Ca = (Cb × Ve) / Va
              </div>
              <p class="text-sm">Application numérique :</p>
              <div class="font-mono text-center my-2 text-slate-200">
                Ca = (${params.Cb} mol/L × ${params.Ve} mL) / ${params.Va} mL = <strong>${verif.referenceValue.toFixed(3)} mol/L</strong>
              </div>
            `}
          </div>

          <!-- Analyse de la réponse élève -->
          <div class="p-3 rounded-lg border ${verif.isCoherent ? 'bg-emerald-950/60 border-emerald-500/50' : 'bg-rose-950/60 border-rose-500/50'}">
            <h3 class="font-bold mb-1 ${verif.isCoherent ? 'text-emerald-400' : 'text-rose-400'}">
              3. Analyse du résultat proposé :
            </h3>
            <ul class="text-sm space-y-1">
              <li><strong>Valeur théorique de référence :</strong> ${verif.referenceValue.toFixed(3)}</li>
              <li><strong>Valeur proposée par la classe :</strong> ${verif.userValue.toFixed(3)}</li>
              <li><strong>Écart absolu :</strong> ${Math.abs(verif.diffValue).toFixed(3)}</li>
              <li><strong>Écart relatif :</strong> ${verif.diffPercent.toFixed(2)} %</li>
              <li><strong>Diagnostic :</strong> ${verif.isCoherent ? 'COHÉRENT (dans la tolérance)' : 'INCOHÉRENT (hors tolérance)'}</li>
            </ul>
          </div>
        </div>

        <div class="modal-footer p-4 border-t border-slate-700 flex justify-end">
          <button class="btn-primary" id="btn-modal-close-solution">Fermer la solution</button>
        </div>
      </div>
    </div>
  `;
}
