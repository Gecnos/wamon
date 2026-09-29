/**
 * Composant SVG unique de l'Erlenmeyer.
 */
export function createErlenmeyerSVG(options: {
  width?: number;
  height?: number;
  liquidVolume?: number;
  liquidColor?: string;
  volumeLabel?: string;
}): string {
  const {
    width = 180,
    height = 240,
    liquidColor = "rgba(251, 191, 36, 0.5)",
    volumeLabel = "250 mL",
  } = options;

  return `
    <svg viewBox="0 0 180 240" width="${width}" height="${height}" class="equipment-svg erlenmeyer-svg" style="cursor: pointer;" title="Erlenmeyer">
      <defs>
        <linearGradient id="erlenGlassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
          <stop offset="25%" stop-color="rgba(240,249,255,0.2)" />
          <stop offset="75%" stop-color="rgba(240,249,255,0.2)" />
          <stop offset="100%" stop-color="rgba(200,225,255,0.5)" />
        </linearGradient>
      </defs>

      <!-- Liquide dans l'erlenmeyer -->
      <path d="M 76 110 L 76 130 L 40 195 C 32 210, 42 225, 60 225 L 120 225 C 138 225, 148 210, 140 195 L 104 130 L 104 110 Z" 
            fill="${liquidColor}" opacity="0.85"/>
      <ellipse cx="90" cy="110" rx="14" ry="3" fill="${liquidColor}" opacity="0.9"/>

      <!-- Col cylindrique supérieur -->
      <rect x="73" y="30" width="34" height="60" fill="url(#erlenGlassGrad)" stroke="currentColor" stroke-width="2"/>
      <!-- Bord évasé supérieur -->
      <ellipse cx="90" cy="30" rx="19" ry="5" fill="none" stroke="currentColor" stroke-width="2"/>

      <!-- Parois coniques du corps -->
      <path d="M 73 90 L 35 195 C 25 215, 38 230, 60 230 L 120 230 C 142 230, 155 215, 145 195 L 107 90" 
            fill="url(#erlenGlassGrad)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>

      <!-- Graduations indicatives -->
      <g stroke="currentColor" opacity="0.6" stroke-width="1.2">
        <line x1="58" y1="180" x2="78" y2="180"/>
        <text x="82" y="183" font-size="9" font-family="sans-serif" fill="currentColor">100 mL</text>

        <line x1="68" y1="145" x2="88" y2="145"/>
        <text x="92" y="148" font-size="9" font-family="sans-serif" fill="currentColor">200 mL</text>
      </g>

      <!-- Label volume maximum -->
      <text x="90" y="210" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif" fill="currentColor" opacity="0.7">
        ${volumeLabel}
      </text>
    </svg>
  `;
}
