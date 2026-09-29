import type { GroupResult } from '../types';

interface MultiGroupPanelProps {
  groups: GroupResult[];
  unit: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export default function MultiGroupPanel({
  groups,
  unit,
  onAdd,
  onRemove,
}: MultiGroupPanelProps) {
  // Calcul moyenne & écart type des réponses des groupes
  const values = groups.map((g) => g.value);
  const mean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const stdDev =
    values.length > 1
      ? Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / (values.length - 1))
      : 0;

  return (
    <div className="glass-card mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <span>👥</span> Travaux Pratiques en Groupe (TP Class)
        </h2>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onAdd}
          disabled={groups.length >= 6}
        >
          ➕ Ajouter Groupe
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-xs text-muted text-center py-3 border border-dashed border-border rounded-lg">
          Aucun groupe ajouté. Cliquez sur "Ajouter Groupe" pour comparer plusieurs paillasses d'élèves.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2">
            {groups.map((group, idx) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-border"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ background: group.color }}
                  />
                  <span className="text-xs font-bold">{group.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-emerald">
                    {group.value} {unit}
                  </span>
                  <button
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-0.5"
                    onClick={() => onRemove(idx)}
                    title="Supprimer ce groupe"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Synthèse statistique TP */}
          {groups.length >= 2 && (
            <div className="p-3 mt-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex justify-around text-center">
              <div>
                <div className="text-2xs text-muted font-bold uppercase">Moyenne Classe</div>
                <div className="text-sm font-mono font-bold text-emerald">
                  {mean.toFixed(2)} {unit}
                </div>
              </div>
              <div>
                <div className="text-2xs text-muted font-bold uppercase">Écart-Type (σ)</div>
                <div className="text-sm font-mono font-bold text-cyan">
                  ±{stdDev.toFixed(2)} {unit}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
