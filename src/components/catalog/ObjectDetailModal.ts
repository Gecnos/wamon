import { CatalogItem } from '../../types';
import { renderEquipmentSVG } from '../svg';

export function createObjectDetailModalHTML(item: CatalogItem): string {
  return `
    <div class="modal-overlay modal-fullscreen active" id="equipment-detail-modal">
      <div class="modal-content glass-modal project-card">
        <!-- En-tête avec gros titre lisible en projection -->
        <div class="modal-header">
          <div class="header-left">
            <span class="badge badge-projection">${item.categorie.toUpperCase()}</span>
            <h1 class="projection-title">${item.nom}</h1>
          </div>
          <button class="btn-close-modal" id="btn-close-modal" title="Fermer (Échap)">✕</button>
        </div>

        <div class="modal-grid">
          <!-- Colonne SVG interactive grand format -->
          <div class="modal-svg-col">
            <div class="projection-svg-frame">
              ${renderEquipmentSVG(item.schema, { width: 260, height: 380 })}
            </div>
            <div class="precision-box">
              <strong>🎯 Précision :</strong> ${item.precision}
            </div>
          </div>

          <!-- Colonne Informations et Protocole -->
          <div class="modal-info-col">
            <!-- Rôle -->
            <div class="info-block">
              <h3>📌 Rôle en TP :</h3>
              <p class="role-text">${item.role}</p>
            </div>

            <!-- Utilisation / Protocole -->
            <div class="info-block">
              <h3>🧪 Protocole d'utilisation correcte :</h3>
              <ol class="protocol-list">
                ${item.utilisation.map(step => `<li>${step}</li>`).join('')}
              </ol>
            </div>

            <!-- Erreurs fréquentes -->
            <div class="info-block warning-block">
              <h3>⚠️ Erreurs fréquentes à éviter :</h3>
              <ul class="error-list">
                ${item.erreurs_frequentes.map(err => `<li>${err}</li>`).join('')}
              </ul>
            </div>

            <!-- Consignes de sécurité -->
            <div class="info-block safety-block">
              <h3>🛡️ Consignes de Sécurité :</h3>
              <ul class="safety-list">
                ${item.securite.map(sec => `<li>${sec}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary-large" id="btn-modal-close">Fermer la fiche</button>
        </div>
      </div>
    </div>
  `;
}
