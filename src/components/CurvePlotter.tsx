export interface Point {
  Vb: number;
  pH: number;
}

interface CurvePlotterProps {
  points: Point[];
  currentVb: number;
  maxVb: number;
  targetVe?: number;
  width?: number;
  height?: number;
}

export default function CurvePlotter({
  points,
  currentVb,
  maxVb,
  targetVe,
  width = 330,
  height = 290,
}: CurvePlotterProps) {
  const pad = { top: 20, right: 20, bottom: 35, left: 35 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;

  const minX = 0;
  const maxX = maxVb;
  const minY = 0;
  const maxY = 14;

  const toX = (v: number) => pad.left + ((v - minX) / (maxX - minX)) * W;
  const toY = (p: number) => pad.top + H - ((p - minY) / (maxY - minY)) * H;

  // Calcul du path SVG de la courbe pH complète
  const pathD = points.reduce((acc, pt, idx) => {
    const x = toX(pt.Vb);
    const y = toY(pt.pH);
    return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
  }, '');

  // Calcul du path de la partie déjà versée (surbrillance)
  const pouredPoints = points.filter(p => p.Vb <= currentVb + 0.01);
  const pouredD = pouredPoints.reduce((acc, pt, idx) => {
    const x = toX(pt.Vb);
    const y = toY(pt.pH);
    return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
  }, '');

  // Point courant
  const curPt = points.reduce((prev, curr) =>
    Math.abs(curr.Vb - currentVb) < Math.abs(prev.Vb - currentVb) ? curr : prev
  , points[0] || { Vb: 0, pH: 7 });

  const curX = toX(curPt.Vb);
  const curY = toY(curPt.pH);

  // Graduations X (0, 5, 10, 15, 20, 25 mL)
  const xTicks = [0, 5, 10, 15, 20, 25];
  // Graduations Y (pH 0, 2, 4, 6, 7, 8, 10, 12, 14)
  const yTicks = [0, 2, 4, 7, 10, 12, 14];

  return (
    <div className="curve-plotter-wrap relative flex flex-col items-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="curve-svg">
        <defs>
          <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f7958" />
            <stop offset="55%" stopColor="#6c8a66" />
            <stop offset="100%" stopColor="#c4773d" />
          </linearGradient>
        </defs>

        {/* Quadrillage Y */}
        {yTicks.map(yVal => {
          const y = toY(yVal);
          return (
            <g key={`y-${yVal}`}>
              <line
                x1={pad.left}
                y1={y}
                x2={pad.left + W}
                y2={y}
                stroke="#dfe3db"
                strokeDasharray={yVal === 7 ? "4 4" : undefined}
              />
              <text
                x={pad.left - 6}
                y={y + 4}
                fill="#78857b"
                fontSize="10"
                textAnchor="end"
                fontFamily="'JetBrains Mono', monospace"
              >
                {yVal}
              </text>
            </g>
          );
        })}

        {/* Quadrillage X */}
        {xTicks.map(xVal => {
          const x = toX(xVal);
          return (
            <g key={`x-${xVal}`}>
              <line
                x1={x}
                y1={pad.top}
                x2={x}
                y2={pad.top + H}
                stroke="#e5e7df"
              />
              <text
                x={x}
                y={pad.top + H + 16}
                fill="#78857b"
                fontSize="10"
                textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
              >
                {xVal}
              </text>
            </g>
          );
        })}

        {/* Axes principaux */}
        <line
          x1={pad.left}
          y1={pad.top}
          x2={pad.left}
          y2={pad.top + H}
          stroke="#8c9a8f"
          strokeWidth="1.5"
        />
        <line
          x1={pad.left}
          y1={pad.top + H}
          x2={pad.left + W}
          y2={pad.top + H}
          stroke="#8c9a8f"
          strokeWidth="1.5"
        />

        {/* Ligne pointillée équivalence théorique */}
        {targetVe !== undefined && (
          <line
            x1={toX(targetVe)}
            y1={pad.top}
            x2={toX(targetVe)}
            y2={pad.top + H}
            stroke="#c4773d"
            strokeDasharray="4 3"
            strokeWidth="1.2"
            opacity="0.8"
          />
        )}

        {/* Courbe pH théorique complète (semi-transparente) */}
        <path
          d={pathD}
          fill="none"
          stroke="#b8c2b7"
          strokeWidth="2"
        />

        {/* Courbe versée (lumineuse) */}
        {pouredD && (
          <path
            d={pouredD}
            fill="none"
            stroke="url(#curveGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}

        {/* Lignes de repère du point courant */}
        <line
          x1={curX}
          y1={pad.top + H}
          x2={curX}
          y2={curY}
          stroke="#c4773d"
          strokeDasharray="3 3"
          opacity="0.7"
        />
        <line
          x1={pad.left}
          y1={curY}
          x2={curX}
          y2={curY}
          stroke="#c4773d"
          strokeDasharray="3 3"
          opacity="0.7"
        />

        {/* Point mobile sur la courbe */}
        <circle
          cx={curX}
          cy={curY}
          r="6"
          fill="#c4773d"
          stroke="#fffefa"
          strokeWidth="2"
        />

        {/* Légendes des axes */}
        <text
          x={pad.left + W / 2}
          y={height - 5}
          fill="#65776b"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          Volume versé Vb (mL)
        </text>
        <text
          x={12}
          y={pad.top + H / 2}
          fill="#65776b"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
          transform={`rotate(-90 12 ${pad.top + H / 2})`}
        >
          pH
        </text>
      </svg>
    </div>
  );
}
