import { forwardRef } from 'react';

/** Emplacement de la scène SVG pilotée par le moteur d’animation. */
export const BenchStage = forwardRef<HTMLDivElement, { className?: string }>(function BenchStage({ className = '' }, ref) {
  return (
    <div className={`flex items-center justify-center rounded-2xl border border-line bg-millimetre p-3 text-[#46526a] ${className}`}>
      <div ref={ref} className="h-full w-full [&_svg]:mx-auto [&_svg]:h-full [&_svg]:max-h-full [&_svg]:w-auto" aria-label="Montage du dosage : burette au-dessus du bécher" role="img" />
    </div>
  );
});
