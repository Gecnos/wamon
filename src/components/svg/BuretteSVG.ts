/**
 * Composant SVG unique de la Burette Graduée.
 * Utilisé à la fois dans le catalogue et dans la simulation de dosage.
 * 
 * @param levelVolume Volume versé en mL (entre 0 et maxVolume)
 * @param maxVolume Volume total de la burette (par défaut 25 mL)
 * @param isFlowing Vrai si la burette laisse couler une goutte/un flux
 * @param interactive Permet d'ouvrir une modale d'information au clic
 */
export function createBuretteSVG(options: {
  levelVolume?: number;
  maxVolume?: number;
  isFlowing?: boolean;
  fluidColor?: string;
  width?: number;
  height?: number;
  showTicks?: boolean;
  onClick?: () => void;
}): string {
  const {
    levelVolume = 0,
    maxVolume = 25,
    isFlowing = false,
    fluidColor = 'rgba(59, 130, 246, 0.4)',
    width = 140,
    height = 420,
    showTicks = true,
  } = options;

  // Hauteur utile de la colonne graduée en pixels dans l'espace SVG (viewBox 0 0 140 420)
  const topY = 40;
  const bottomY = 320;
  const totalH = bottomY - topY;

  // Calcul de la position du ménisque (le volume versé fait descendre le niveau du liquide)
  const pouredFraction = Math.min(Math.max(levelVolume / maxVolume, 0), 1);
  const liquidTopY = topY + pouredFraction * totalH;
  const liquidH = bottomY - liquidTopY;

  // Graduations
  let ticksSVG = '';
  if (showTicks) {
    for (let v = 0; v <= maxVolume; v++) {
      const y = topY + (v / maxVolume) * totalH;
      const isMajor = v % 5 === 0;
      const tickLength = isMajor ? 14 : 7;
      ticksSVG += `
        <line x1="${70 - tickLength}" y1="${y}" x2="70" y2="${y}" stroke="currentColor" stroke-width="${isMajor ? 1.5 : 0.8}" opacity="0.7" />
        ${isMajor ? `<text x="${70 - tickLength - 4}" y="${y + 3}" font-size="9" font-family="sans-serif" text-anchor="end" fill="currentColor" opacity="0.9">${v}</text>` : ''}
      `;
    }
  }

  // Animation de la goutte si isFlowing est vrai
  const dropSVG = isFlowing ? `
    <g class="burette-drop-group">
      <circle cx="70" cy="375" r="3.5" fill="${fluidColor}">
        <animate attributeName="cy" from="365" to="410" dur="0.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;1;0" dur="0.5s" repeatCount="indefinite" />
      </circle>
    </g>
  ` : '';

  return `
    <svg viewBox="0 0 140 420" width="${width}" height="${height}" class="equipment-svg burette-svg" style="cursor: pointer;" title="Burette graduée">
      <defs>
        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.6)" />
          <stop offset="30%" stop-color="rgba(255,255,255,0.1)" />
          <stop offset="70%" stop-color="rgba(255,255,255,0.2)" />
          <stop offset="100%" stop-color="rgba(200,220,255,0.4)" />
        </linearGradient>
        <linearGradient id="liquidGradBurette" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${fluidColor}" stop-opacity="0.8" />
          <stop offset="50%" stop-color="${fluidColor}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${fluidColor}" stop-opacity="0.7" />
        </linearGradient>
      </defs>

      <!-- Support supérieur / Entonnoir discret -->
      <path d="M 55 15 L 85 15 L 75 35 L 65 35 Z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>

      <!-- Contenu liquide -->
      ${liquidH > 0 ? `
        <rect x="58" y="${liquidTopY}" width="24" height="${liquidH}" fill="url(#liquidGradBurette)" rx="1"/>
        <!-- Ménisque -->
        <ellipse cx="70" cy="${liquidTopY}" rx="12" ry="2.5" fill="${fluidColor}" opacity="0.9"/>
      ` : ''}

      <!-- Tube principal en verre de la burette -->
      <rect x="57" y="30" width="26" height="300" fill="url(#glassGradient)" stroke="currentColor" stroke-width="2" rx="2" opacity="0.85"/>

      <!-- Graduations et nombres -->
      <g class="ticks-group">
        ${ticksSVG}
      </g>

      <!-- Bas de la burette et Robinet -->
      <path d="M 64 330 L 64 345 L 67 350 L 73 350 L 76 345 L 76 330 Z" fill="url(#glassGradient)" stroke="currentColor" stroke-width="1.5"/>
      
      <!-- Clef du Robinet -->
      <g class="valve-group">
        <rect x="54" y="342" width="32" height="6" rx="2" fill="${isFlowing ? '#10b981' : '#ef4444'}" stroke="currentColor" stroke-width="1.2"/>
        <circle cx="70" cy="345" r="4" fill="#374151" stroke="#fff" stroke-width="1"/>
      </g>

      <!-- Embout effilé d'écoulement -->
      <path d="M 68 350 L 68 365 L 72 365 L 72 350 Z" fill="url(#glassGradient)" stroke="currentColor" stroke-width="1.2"/>

      <!-- Goutte d'eau animée -->
      ${dropSVG}
    </svg>
  `;
}
