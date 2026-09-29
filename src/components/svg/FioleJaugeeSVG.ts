/**
 * Composant SVG unique de la Fiole Jaugée.
 */
export function createFioleJaugeeSVG(options: {
  width?: number;
  height?: number;
  volumeLabel?: string;
  liquidColor?: string;
}): string {
  const {
    width = 180,
    height = 280,
    volumeLabel = "100 mL",
    liquidColor = "rgba(59, 130, 246, 0.4)",
  } = options;

  return `
    <svg viewBox="0 0 180 280" width="${width}" height="${height}" class="equipment-svg fiole-svg" style="cursor: pointer;" title="Fiole jaugée">
      <defs>
        <linearGradient id="fioleGlassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
          <stop offset="25%" stop-color="rgba(240,249,255,0.2)" />
          <stop offset="75%" stop-color="rgba(240,249,255,0.2)" />
          <stop offset="100%" stop-color="rgba(200,225,255,0.5)" />
        </linearGradient>
      </defs>

      <!-- Bouchon en plastique à dépolir -->
      <path d="M 75 15 L 105 15 L 100 35 L 80 35 Z" fill="#64748b" stroke="#334155" stroke-width="1.5" rx="1"/>
      <rect x="78" y="35" width="24" height="15" fill="#94a3b8" stroke="#334155" stroke-width="1"/>

      <!-- Col long et étroit -->
      <rect x="82" y="50" width="16" height="90" fill="url(#fioleGlassGrad)" stroke="currentColor" stroke-width="2"/>

      <!-- Trait de jauge rouge sur le col -->
      <line x1="72" y1="95" x2="108" y2="95" stroke="#ef4444" stroke-width="2"/>
      <text x="112" y="98" font-size="9" font-weight="bold" fill="#ef4444" font-family="sans-serif">Trait de jauge</text>

      <!-- Liquide jusqu'au trait de jauge -->
      <path d="M 83 95 L 83 140 L 40 215 C 30 235, 45 255, 65 255 L 115 255 C 135 255, 150 235, 140 215 L 97 140 L 97 95 Z" 
            fill="${liquidColor}" opacity="0.8"/>
      <!-- Ménisque au trait -->
      <ellipse cx="90" cy="95" rx="7" ry="2" fill="${liquidColor}" opacity="0.9"/>

      <!-- Corps piriforme (en poire) de la fiole -->
      <path d="M 82 140 L 38 215 C 25 238, 40 260, 65 260 L 115 260 C 140 260, 155 238, 142 215 L 98 140 Z" 
            fill="url(#fioleGlassGrad)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>

      <!-- Inscription sur la fiole -->
      <text x="90" y="215" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif" fill="currentColor">
        ${volumeLabel}
      </text>
      <text x="90" y="230" font-size="9" text-anchor="middle" font-family="sans-serif" fill="currentColor" opacity="0.8">
        In 20°C ±0.1 mL
      </text>
    </svg>
  `;
}
