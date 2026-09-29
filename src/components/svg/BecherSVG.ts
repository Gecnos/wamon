/**
 * Composant SVG unique du Bécher.
 * Utilisé à la fois dans le catalogue et dans la vue de simulation du titrage.
 * 
 * @param liquidVolume Volume de liquide contenu (mL)
 * @param liquidColor Couleur du liquide (ex: dégradé pH/indicateur)
 * @param colorLabel Libellé textuel de la couleur (ex: "Jaune", "Virage Vert", "Bleu")
 * @param currentPH Affichage du pH courant
 */
export function createBecherSVG(options: {
  liquidVolume?: number;
  maxVolume?: number;
  liquidColor?: string;
  colorLabel?: string;
  currentPH?: number;
  width?: number;
  height?: number;
}): string {
  const {
    liquidVolume = 40,
    maxVolume = 100,
    liquidColor = '#fef08a', // Jaune par défaut (ex: BTB en milieu acide)
    colorLabel = 'Jaune (acide)',
    currentPH,
    width = 200,
    height = 220,
  } = options;

  // Calcul du remplissage
  const fillFraction = Math.min(Math.max(liquidVolume / maxVolume, 0), 1);
  const beakerTopY = 40;
  const beakerBottomY = 190;
  const totalH = beakerBottomY - beakerTopY;

  const liquidH = fillFraction * totalH;
  const liquidTopY = beakerBottomY - liquidH;

  return `
    <svg viewBox="0 0 200 220" width="${width}" height="${height}" class="equipment-svg becher-svg" style="cursor: pointer;" title="Bécher">
      <defs>
        <linearGradient id="beakerGlassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
          <stop offset="25%" stop-color="rgba(240,249,255,0.2)" />
          <stop offset="75%" stop-color="rgba(240,249,255,0.2)" />
          <stop offset="100%" stop-color="rgba(200,225,255,0.5)" />
        </linearGradient>

        <linearGradient id="liquidColorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${liquidColor}" stop-opacity="0.85" />
          <stop offset="50%" stop-color="${liquidColor}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${liquidColor}" stop-opacity="0.8" />
        </linearGradient>
      </defs>

      <!-- Liquide dans le bécher -->
      ${liquidH > 0 ? `
        <rect x="33" y="${liquidTopY}" width="134" height="${liquidH - 3}" fill="url(#liquidColorGrad)" rx="2"/>
        <!-- Surface du liquide / Ménisque -->
        <ellipse cx="100" cy="${liquidTopY}" rx="67" ry="6" fill="${liquidColor}" opacity="0.9"/>
      ` : ''}

      <!-- Barreau aimanté (Agitateur magnétique) au fond -->
      <rect x="80" y="180" width="40" height="7" rx="3.5" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>

      <!-- Parois en verre du bécher -->
      <!-- Bec verseur à gauche: M 25 35 L 32 40 -->
      <path d="M 25 35 L 32 40 L 32 190 C 32 196, 38 200, 45 200 L 155 200 C 162 200, 168 196, 168 190 L 168 40 L 175 35 L 168 40" 
            fill="url(#beakerGlassGrad)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>

      <!-- Graduations du Bécher (indicatives) -->
      <g stroke="currentColor" opacity="0.6" stroke-width="1">
        <line x1="32" y1="160" x2="52" y2="160" />
        <text x="56" y="163" font-size="9" font-family="sans-serif" fill="currentColor">25 mL</text>

        <line x1="32" y1="125" x2="55" y2="125" stroke-width="1.5"/>
        <text x="59" y="128" font-size="10" font-weight="bold" font-family="sans-serif" fill="currentColor">50 mL</text>

        <line x1="32" y1="90" x2="52" y2="90" />
        <text x="56" y="93" font-size="9" font-family="sans-serif" fill="currentColor">75 mL</text>

        <line x1="32" y1="55" x2="55" y2="55" stroke-width="1.5"/>
        <text x="59" y="58" font-size="10" font-weight="bold" font-family="sans-serif" fill="currentColor">100 mL</text>
      </g>

      <!-- Badge de description textuelle du pH et de la couleur (Crucial pour projection & accessibilité) -->
      <g transform="translate(100, 212)">
        <rect x="-85" y="-12" width="170" height="18" rx="9" fill="rgba(15, 23, 42, 0.85)" stroke="#38bdf8" stroke-width="1"/>
        <text x="0" y="1" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#f8fafc">
          ${currentPH !== undefined ? `pH: ${currentPH.toFixed(2)} — ` : ''}${colorLabel}
        </text>
      </g>
    </svg>
  `;
}
