interface RulerProps {
  /** Nombre de repères marqués. */
  majors?: number;
  /** Graduations fines entre deux repères. */
  minors?: number;
  /** Part remplie en orange, de 0 à 1. */
  progress?: number;
  className?: string;
}

/**
 * Règle graduée, signature de Wamon : les graduations d’une burette servent de
 * séparateur de page et de frise d’étapes. Le trait orange avance avec la séance.
 */
export function Ruler({ majors = 12, minors = 4, progress, className = '' }: RulerProps) {
  const total = majors * minors;
  return (
    <svg viewBox={`-1 0 ${total + 2} 16`} preserveAspectRatio="none" className={`block h-4 w-full text-ink ${className}`} aria-hidden="true">
      {progress !== undefined && <rect x="0" y="11" width={Math.max(0, Math.min(1, progress)) * total} height="5" className="fill-signal" />}
      {Array.from({ length: total + 1 }, (_, i) => {
        const major = i % minors === 0;
        return <line key={i} x1={i} x2={i} y1={major ? 1 : 9} y2="16" stroke="currentColor" strokeWidth={major ? 2 : 1} opacity={major ? 1 : 0.45} vectorEffect="non-scaling-stroke" />;
      })}
      <line x1="0" x2={total} y1="15" y2="15" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
