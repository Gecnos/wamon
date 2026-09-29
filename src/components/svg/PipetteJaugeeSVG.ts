/**
 * Composant SVG unique de la Pipette Jaugée.
 */
export function createPipetteJaugeeSVG(options: {
  width?: number;
  height?: number;
  volumeLabel?: string;
}): string {
  const { width = 120, height = 360, volumeLabel = "20 mL" } = options;

  return `
    <svg viewBox="0 0 120 360" width="${width}" height="${height}" class="equipment-svg pipette-svg" style="cursor: pointer;" title="Pipette jaugée">
      <defs>
        <linearGradient id="pipetteGlassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
          <stop offset="30%" stop-color="rgba(240,249,255,0.2)" />
          <stop offset="70%" stop-color="rgba(240,249,255,0.3)" />
          <stop offset="100%" stop-color="rgba(200,225,255,0.5)" />
        </linearGradient>
        <linearGradient id="pipetteLiquidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(59, 130, 246, 0.7)" />
          <stop offset="100%" stop-color="rgba(37, 99, 235, 0.85)" />
        </linearGradient>
      </defs>

      <!-- Embout supérieur pour poire à pipeter -->
      <path d="M 54 20 L 66 20 L 65 50 L 55 50 Z" fill="url(#pipetteGlassGrad)" stroke="currentColor" stroke-width="1.5"/>

      <!-- Tube supérieur mince -->
      <rect x="56" y="50" width="8" height="100" fill="url(#pipetteGlassGrad)" stroke="currentColor" stroke-width="1.5"/>

      <!-- Trait de jauge supérieur -->
      <line x1="48" y1="90" x2="72" y2="90" stroke="#ef4444" stroke-width="2"/>
      <text x="76" y="93" font-size="9" font-weight="bold" fill="#ef4444" font-family="sans-serif">Trait de jauge</text>

      <!-- Bulbe central étalonné -->
      <path d="M 56 150 C 40 170, 35 190, 35 210 C 35 230, 40 250, 56 270 L 64 270 C 80 250, 85 230, 85 210 C 85 190, 80 170, 64 150 Z" 
            fill="url(#pipetteGlassGrad)" stroke="currentColor" stroke-width="2"/>
      
      <!-- Liquide dans le bulbe -->
      <path d="M 56 160 C 44 175, 40 192, 40 210 C 40 228, 44 245, 56 260 L 64 260 C 76 245, 80 228, 80 210 C 80 192, 76 175, 64 160 Z" 
            fill="url(#pipetteLiquidGrad)" opacity="0.6"/>

      <!-- Inscription sur le bulbe -->
      <text x="60" y="210" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif" fill="currentColor">
        ${volumeLabel}
      </text>
      <text x="60" y="222" font-size="8" text-anchor="middle" font-family="sans-serif" fill="currentColor" opacity="0.8">
        Ex 20°C ±0,03
      </text>

      <!-- Tube inférieur effilé -->
      <rect x="56" y="270" width="8" height="60" fill="url(#pipetteGlassGrad)" stroke="currentColor" stroke-width="1.5"/>
      <path d="M 56 330 L 58 350 L 62 350 L 64 330 Z" fill="url(#pipetteGlassGrad)" stroke="currentColor" stroke-width="1.2"/>
    </svg>
  `;
}
