/**
 * Composant SVG unique du Statif avec support et pince à burette.
 */
export function createStatifSVG(options: {
  width?: number;
  height?: number;
  showBurette?: boolean;
}): string {
  const { width = 160, height = 380, showBurette = true } = options;

  return `
    <svg viewBox="0 0 160 380" width="${width}" height="${height}" class="equipment-svg statif-svg" style="cursor: pointer;" title="Statif avec support">
      <defs>
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#475569" />
          <stop offset="50%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#334155" />
        </linearGradient>
      </defs>

      <!-- Base en lourde fonte rectangulaire -->
      <path d="M 20 340 L 140 340 L 145 365 C 145 370, 138 372, 130 372 L 30 372 C 22 372, 15 370, 15 365 Z" 
            fill="url(#metalGrad)" stroke="#1e293b" stroke-width="2"/>

      <!-- Tige métallique verticale -->
      <rect x="35" y="30" width="8" height="315" fill="url(#metalGrad)" stroke="#1e293b" stroke-width="1.5" rx="2"/>

      <!-- Noix de serrage inférieure -->
      <rect x="30" y="180" width="18" height="14" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
      <circle cx="26" cy="187" r="4" fill="#94a3b8" stroke="#0f172a"/>

      <!-- Bras et Pince à burette -->
      <rect x="44" y="184" width="40" height="6" fill="url(#metalGrad)" stroke="#0f172a"/>

      <!-- Mâchoires de la pince encerclant la burette -->
      <path d="M 84 175 C 98 175, 106 182, 106 187 C 106 192, 98 199, 84 199" fill="none" stroke="#ef4444" stroke-width="3"/>
      <circle cx="104" cy="187" r="3" fill="#334155"/>

      ${showBurette ? `
        <!-- Burette maintenue en transparence esquissée -->
        <rect x="94" y="50" width="12" height="260" fill="rgba(224, 242, 254, 0.6)" stroke="#0284c7" stroke-width="1.2" rx="1"/>
        <line x1="100" y1="310" x2="100" y2="330" stroke="#0284c7" stroke-width="2"/>
      ` : ''}
    </svg>
  `;
}
