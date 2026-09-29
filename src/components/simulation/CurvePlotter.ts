import { TitrationState } from '../../models/dosageFortFort';

/**
 * Tracé dynamique vectoriel SVG de la courbe de titrage pH = f(Vb).
 * 
 * @param points Ensemble des points (Vb, pH) calculés
 * @param currentVb Volume actuellement versé
 * @param maxVb Volume maximal de l'axe X (ex: 2 * Ve ou 40 mL)
 * @param equivalencePoint Point d'équivalence théorique (Ve, pH=7)
 */
export function createCurvePlotterSVG(options: {
  points: { Vb: number; pH: number }[];
  currentVb: number;
  maxVb?: number;
  targetVe?: number;
  width?: number;
  height?: number;
}): string {
  const {
    points,
    currentVb,
    maxVb = 40,
    targetVe,
    width = 380,
    height = 280,
  } = options;

  const margin = { top: 30, right: 30, bottom: 40, left: 45 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // Fonctions de projection
  const scaleX = (Vb: number) => margin.left + (Math.min(Vb, maxVb) / maxVb) * plotW;
  const scaleY = (pH: number) => margin.top + plotH - (Math.min(Math.max(pH, 0), 14) / 14) * plotH;

  // Ligne de la courbe jusqu'à currentVb
  const visiblePoints = points.filter(p => p.Vb <= currentVb + 0.05);
  const pathD = visiblePoints.length > 0
    ? visiblePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.Vb).toFixed(1)} ${scaleY(p.pH).toFixed(1)}`).join(' ')
    : '';

  // Graduations Axe Y (pH de 0 à 14 par pas de 2)
  let yAxisTicks = '';
  for (let ph = 0; ph <= 14; ph += 2) {
    const y = scaleY(ph);
    yAxisTicks += `
      <line x1="${margin.left - 4}" y1="${y}" x2="${margin.left}" y2="${y}" stroke="currentColor" opacity="0.6"/>
      <line x1="${margin.left}" y1="${y}" x2="${margin.left + plotW}" y2="${y}" stroke="currentColor" stroke-dasharray="2,2" opacity="0.15"/>
      <text x="${margin.left - 8}" y="${y + 3}" font-size="9" text-anchor="end" font-family="sans-serif" fill="currentColor">${ph}</text>
    `;
  }

  // Graduations Axe X (Vb de 0 à maxVb par pas de 5 ou 10)
  let xAxisTicks = '';
  const stepX = maxVb <= 30 ? 5 : 10;
  for (let v = 0; v <= maxVb; v += stepX) {
    const x = scaleX(v);
    xAxisTicks += `
      <line x1="${x}" y1="${margin.top + plotH}" x2="${x}" y2="${margin.top + plotH + 4}" stroke="currentColor" opacity="0.6"/>
      <line x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + plotH}" stroke="currentColor" stroke-dasharray="2,2" opacity="0.15"/>
      <text x="${x}" y="${margin.top + plotH + 16}" font-size="9" text-anchor="middle" font-family="sans-serif" fill="currentColor">${v}</text>
    `;
  }

  // Point d'équivalence E (Ve, 7)
  let equivalenceMarker = '';
  if (targetVe && targetVe <= maxVb) {
    const eqX = scaleX(targetVe);
    const eqY = scaleY(7.0);
    const isReached = currentVb >= targetVe;

    equivalenceMarker = `
      <!-- Lignes projetées de l'équivalence -->
      <line x1="${eqX}" y1="${margin.top + plotH}" x2="${eqX}" y2="${eqY}" stroke="#ef4444" stroke-dasharray="3,3" stroke-width="1.5" opacity="${isReached ? '0.9' : '0.4'}"/>
      <line x1="${margin.left}" y1="${eqY}" x2="${eqX}" y2="${eqY}" stroke="#ef4444" stroke-dasharray="3,3" stroke-width="1.5" opacity="${isReached ? '0.9' : '0.4'}"/>
      <!-- Point E -->
      <circle cx="${eqX}" cy="${eqY}" r="${isReached ? '5' : '3.5'}" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>
      <text x="${eqX + 6}" y="${eqY - 6}" font-size="11" font-weight="bold" fill="#ef4444" font-family="sans-serif">
        E (${targetVe.toFixed(1)} mL, pH 7)
      </text>
    `;
  }

  // Point courant instantané
  const currentPoint = points.reduce((prev, curr) => 
    Math.abs(curr.Vb - currentVb) < Math.abs(prev.Vb - currentVb) ? curr : prev, points[0] || { Vb: 0, pH: 1 });
  
  const curX = scaleX(currentVb);
  const curY = scaleY(currentPoint ? currentPoint.pH : 7);

  return `
    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="curve-plotter-svg">
      <defs>
        <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="50%" stop-color="#818cf8" />
          <stop offset="100%" stop-color="#c084fc" />
        </linearGradient>
      </defs>

      <!-- Fond du graphique -->
      <rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" fill="rgba(15, 23, 42, 0.4)" rx="4"/>

      <!-- Grille et Axes -->
      ${yAxisTicks}
      ${xAxisTicks}

      <!-- Titre des axes -->
      <text x="${margin.left + plotW / 2}" y="${height - 5}" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif" fill="currentColor">
        Volume de base versé Vb (mL)
      </text>
      <text x="12" y="${margin.top + plotH / 2}" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif" fill="currentColor" transform="rotate(-90 12 ${margin.top + plotH / 2})">
        pH
      </text>

      <!-- Traceur de la courbe -->
      ${pathD ? `<path d="${pathD}" fill="none" stroke="url(#curveGrad)" stroke-width="3" stroke-linecap="round"/>` : ''}

      <!-- Marqueur d'équivalence -->
      ${equivalenceMarker}

      <!-- Curseur de progression courante -->
      ${visiblePoints.length > 0 ? `
        <circle cx="${curX}" cy="${curY}" r="4.5" fill="#38bdf8" stroke="#fff" stroke-width="1.5">
          <animate attributeName="r" values="4.5;6;4.5" dur="1.2s" repeatCount="indefinite" />
        </circle>
      ` : ''}
    </svg>
  `;
}
