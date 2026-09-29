/**
 * TitrationCanvas — SVG statique de la scène de titrage.
 */

export interface TitrationCanvasOptions {
  initialVb?: number;
  maxVb?: number;
  initialVa?: number;
  initialColor?: string;
  width?: number;
  height?: number;
  buretteFluidColor?: string;
}

export function createTitrationCanvasSVG(opts: TitrationCanvasOptions = {}): string {
  const {
    initialVb = 0,
    maxVb = 25,
    initialVa = 20,
    initialColor = '#fef08a',
    width = 340,
    height = 560,
    buretteFluidColor = 'rgba(196, 119, 61, 0.82)',
  } = opts;

  const BUR = {
    cx: 215,
    tubeLeft: 202,
    tubeRight: 228,
    tubeWidth: 26,
    tubeTop: 55,
    tubeBottom: 320,
    valveY: 325,
    tipTop: 333,
    tipBottom: 353,
  };

  const gradH = BUR.tubeBottom - BUR.tubeTop;

  const poured0 = Math.min(Math.max(initialVb / maxVb, 0), 1);
  const liqTopY0 = BUR.tubeTop + poured0 * gradH;
  const liqH0 = BUR.tubeBottom - liqTopY0;

  const BCH = {
    cx: 215,
    left: 140,
    right: 300,
    bottom: 505,
    top: 390,
    innerLeft: 143,
    innerRight: 297,
    fillTop: 505 - ((initialVa / 120) * (505 - 395)),
  };

  const bchTotalH = BCH.bottom - BCH.top + 10;
  const fillFrac0 = Math.min(Math.max(initialVa / 120, 0), 1);
  const bchLiqTopY0 = BCH.bottom - fillFrac0 * bchTotalH;

  let ticks = '';
  for (let v = 0; v <= maxVb; v++) {
    const y = BUR.tubeTop + (v / maxVb) * gradH;
    const major = v % 5 === 0;
    const tickLen = major ? 12 : 6;
    ticks += `<line x1="${BUR.tubeLeft - tickLen}" y1="${y}" x2="${BUR.tubeLeft}" y2="${y}"
      stroke="currentColor" stroke-width="${major ? 1.4 : 0.7}" opacity="0.65"/>`;
    if (major) {
      ticks += `<text x="${BUR.tubeLeft - tickLen - 3}" y="${y + 3.5}"
        font-size="9" font-family="'JetBrains Mono',monospace" text-anchor="end"
        fill="currentColor" opacity="0.85">${v}</text>`;
    }
  }

  return `
<svg id="titration-canvas-svg"
     viewBox="0 0 340 560"
     width="${width}" height="${height}"
     xmlns="http://www.w3.org/2000/svg"
     style="overflow:visible; display:block; margin: 0 auto;">

  <defs>
    <linearGradient id="tc-glass-bur" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
      <stop offset="30%" stop-color="rgba(255,255,255,0.08)"/>
      <stop offset="70%" stop-color="rgba(255,255,255,0.12)"/>
      <stop offset="100%" stop-color="rgba(200,230,255,0.38)"/>
    </linearGradient>

    <linearGradient id="tc-liq-bur" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${buretteFluidColor}" stop-opacity="0.80"/>
      <stop offset="50%" stop-color="${buretteFluidColor}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${buretteFluidColor}" stop-opacity="0.70"/>
    </linearGradient>

    <linearGradient id="tc-glass-bch" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.60)"/>
      <stop offset="25%" stop-color="rgba(240,249,255,0.15)"/>
      <stop offset="75%" stop-color="rgba(240,249,255,0.15)"/>
      <stop offset="100%" stop-color="rgba(200,225,255,0.48)"/>
    </linearGradient>

    <filter id="tc-drop-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <clipPath id="tc-bch-clip">
      <rect x="${BCH.innerLeft}" y="${BCH.top}"
            width="${BCH.innerRight - BCH.innerLeft}"
            height="${BCH.bottom - BCH.top + 4}" rx="2"/>
    </clipPath>

    <clipPath id="tc-bur-clip">
      <rect x="${BUR.tubeLeft + 1}" y="${BUR.tubeTop}"
            width="${BUR.tubeWidth - 2}"
            height="${BUR.tubeBottom - BUR.tubeTop}"/>
    </clipPath>
  </defs>

  <path d="M ${BUR.cx - 20} 18 L ${BUR.cx + 20} 18 L ${BUR.cx + 12} ${BUR.tubeTop - 5} L ${BUR.cx - 12} ${BUR.tubeTop - 5} Z"
        fill="url(#tc-glass-bur)" stroke="currentColor" stroke-width="1.4" opacity="0.5"/>

  <g clip-path="url(#tc-bur-clip)">
    <rect id="tc-bur-liquid"
          x="${BUR.tubeLeft + 1}"
          y="${liqTopY0}"
          width="${BUR.tubeWidth - 2}"
          height="${Math.max(liqH0, 0)}"
          fill="url(#tc-liq-bur)"/>
    <ellipse id="tc-bur-meniscus"
             cx="${BUR.cx}" cy="${liqTopY0}"
             rx="${(BUR.tubeWidth - 2) / 2}" ry="3"
             fill="${buretteFluidColor}" opacity="0.95"/>
  </g>

  <rect x="${BUR.tubeLeft}" y="${BUR.tubeTop - 5}"
        width="${BUR.tubeWidth}" height="${BUR.tubeBottom - BUR.tubeTop + 5}"
        fill="url(#tc-glass-bur)" stroke="currentColor" stroke-width="1.8" rx="2" opacity="0.80"/>

  <g class="burette-ticks" color="currentColor">${ticks}</g>

  <path d="M ${BUR.cx - 7} ${BUR.tubeBottom}
           L ${BUR.cx - 7} ${BUR.valveY - 8}
           L ${BUR.cx - 5} ${BUR.valveY}
           L ${BUR.cx + 5} ${BUR.valveY}
           L ${BUR.cx + 7} ${BUR.valveY - 8}
           L ${BUR.cx + 7} ${BUR.tubeBottom} Z"
        fill="url(#tc-glass-bur)" stroke="currentColor" stroke-width="1.3"/>

  <g id="tc-valve">
    <rect id="tc-valve-body"
          x="${BUR.cx - 16}" y="${BUR.valveY - 3}"
          width="32" height="6" rx="3"
          fill="#ef4444" stroke="currentColor" stroke-width="1"/>
    <circle cx="${BUR.cx}" cy="${BUR.valveY}"
            r="4" fill="#1e293b" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
  </g>

  <path d="M ${BUR.cx - 4} ${BUR.valveY + 3}
           L ${BUR.cx - 3} ${BUR.tipBottom}
           L ${BUR.cx + 3} ${BUR.tipBottom}
           L ${BUR.cx + 4} ${BUR.valveY + 3} Z"
        fill="url(#tc-glass-bur)" stroke="currentColor" stroke-width="1"/>

  <g id="tc-drops-container"/>

  <line id="tc-stream-line"
        x1="${BUR.cx}" y1="${BUR.tipBottom}"
        x2="${BCH.cx}" y2="${BCH.top + 5}"
        stroke="${buretteFluidColor}"
        stroke-width="2.5"
        stroke-linecap="round"
        opacity="0"/>

  <g clip-path="url(#tc-bch-clip)">
    <rect id="tc-bch-liquid"
          x="${BCH.innerLeft}"
          y="${bchLiqTopY0}"
          width="${BCH.innerRight - BCH.innerLeft}"
          height="${BCH.bottom - bchLiqTopY0 + 4}"
          fill="${initialColor}"/>
    <ellipse id="tc-bch-meniscus"
             cx="${BCH.cx}" cy="${bchLiqTopY0}"
             rx="${(BCH.innerRight - BCH.innerLeft) / 2}" ry="7"
             fill="${initialColor}" opacity="0.95"/>
  </g>

  <rect x="${BCH.cx - 22}" y="${BCH.bottom - 10}"
        width="44" height="8" rx="4"
        fill="#f8fafc" stroke="#475569" stroke-width="1.4"/>

  <path d="M ${BCH.left - 5} ${BCH.top - 10}
           L ${BCH.innerLeft} ${BCH.top}
           L ${BCH.innerLeft} ${BCH.bottom}
           C ${BCH.innerLeft} ${BCH.bottom + 8}, ${BCH.left + 14} ${BCH.bottom + 12}, ${BCH.left + 24} ${BCH.bottom + 12}
           L ${BCH.right - 24} ${BCH.bottom + 12}
           C ${BCH.right - 14} ${BCH.bottom + 12}, ${BCH.innerRight} ${BCH.bottom + 8}, ${BCH.innerRight} ${BCH.bottom}
           L ${BCH.innerRight} ${BCH.top}
           L ${BCH.right + 5} ${BCH.top - 10} L ${BCH.innerRight} ${BCH.top}"
        fill="url(#tc-glass-bch)"
        stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>

  <g stroke="currentColor" opacity="0.55" stroke-width="1" font-family="'JetBrains Mono',monospace">
    <line x1="${BCH.innerLeft}" y1="${BCH.bottom - (25/120)*(BCH.bottom-BCH.top+10)}" x2="${BCH.innerLeft + 18}" y2="${BCH.bottom - (25/120)*(BCH.bottom-BCH.top+10)}"/>
    <text x="${BCH.innerLeft + 22}" y="${BCH.bottom - (25/120)*(BCH.bottom-BCH.top+10) + 3.5}" font-size="9" fill="currentColor">25 mL</text>

    <line x1="${BCH.innerLeft}" y1="${BCH.bottom - (50/120)*(BCH.bottom-BCH.top+10)}" x2="${BCH.innerLeft + 22}" y2="${BCH.bottom - (50/120)*(BCH.bottom-BCH.top+10)}" stroke-width="1.5"/>
    <text x="${BCH.innerLeft + 26}" y="${BCH.bottom - (50/120)*(BCH.bottom-BCH.top+10) + 3.5}" font-size="10" font-weight="bold" fill="currentColor">50 mL</text>

    <line x1="${BCH.innerLeft}" y1="${BCH.bottom - (75/120)*(BCH.bottom-BCH.top+10)}" x2="${BCH.innerLeft + 18}" y2="${BCH.bottom - (75/120)*(BCH.bottom-BCH.top+10)}"/>
    <text x="${BCH.innerLeft + 22}" y="${BCH.bottom - (75/120)*(BCH.bottom-BCH.top+10) + 3.5}" font-size="9" fill="currentColor">75 mL</text>

    <line x1="${BCH.innerLeft}" y1="${BCH.bottom - (100/120)*(BCH.bottom-BCH.top+10)}" x2="${BCH.innerLeft + 22}" y2="${BCH.bottom - (100/120)*(BCH.bottom-BCH.top+10)}" stroke-width="1.5"/>
    <text x="${BCH.innerLeft + 26}" y="${BCH.bottom - (100/120)*(BCH.bottom-BCH.top+10) + 3.5}" font-size="10" font-weight="bold" fill="currentColor">100 mL</text>
  </g>

  <g id="tc-ph-badge" transform="translate(${BCH.cx}, ${BCH.bottom + 22})">
      <rect x="-95" y="-13" width="190" height="24" rx="12"
          fill="rgba(255,254,250,0.96)" stroke="rgba(72,122,123,0.50)" stroke-width="1.2"/>
    <text id="tc-ph-text" x="0" y="4"
          font-size="11" font-weight="bold" font-family="'Outfit',sans-serif"
          text-anchor="middle" fill="#17342c">
      pH: — | Couleur: —
    </text>
  </g>

  <g transform="translate(${BUR.cx}, 8)">
    <text id="tc-vb-label"
          x="0" y="0"
          font-size="11" font-weight="700" font-family="'JetBrains Mono',monospace"
          text-anchor="middle" fill="#487a7b">
      Vb = 0.0 mL
    </text>
  </g>

</svg>`;
}

export const CANVAS_GEOMETRY = {
  burette: {
    tipX: 215,
    tipY: 353,
    tubeTop: 55,
    tubeBottom: 320,
    tubeLeft: 202,
    tubeWidth: 26,
    cx: 215,
  },
  becher: {
    cx: 215,
    innerLeft: 143,
    innerRight: 297,
    bottom: 505,
    top: 390,
  },
  maxVb: 25,
} as const;
