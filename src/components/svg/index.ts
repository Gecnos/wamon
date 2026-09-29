export { createBuretteSVG } from './BuretteSVG';
export { createBecherSVG } from './BecherSVG';
export { createPipetteJaugeeSVG } from './PipetteJaugeeSVG';
export { createFioleJaugeeSVG } from './FioleJaugeeSVG';
export { createErlenmeyerSVG } from './ErlenmeyerSVG';
export { createStatifSVG } from './StatifSVG';

import { createBuretteSVG } from './BuretteSVG';
import { createBecherSVG } from './BecherSVG';
import { createPipetteJaugeeSVG } from './PipetteJaugeeSVG';
import { createFioleJaugeeSVG } from './FioleJaugeeSVG';
import { createErlenmeyerSVG } from './ErlenmeyerSVG';
import { createStatifSVG } from './StatifSVG';

/**
 * Fonction générique de rendu SVG d'un équipement à partir de son ID de schéma.
 */
export function renderEquipmentSVG(schemaId: string, options: Record<string, any> = {}): string {
  switch (schemaId) {
    case 'burette':
      return createBuretteSVG(options);
    case 'becher':
      return createBecherSVG(options);
    case 'pipette-jaugee':
      return createPipetteJaugeeSVG(options);
    case 'fiole-jaugee':
      return createFioleJaugeeSVG(options);
    case 'erlenmeyer':
      return createErlenmeyerSVG(options);
    case 'statif':
      return createStatifSVG(options);
    default:
      return `<div class="p-4 text-red-500">Schéma SVG non trouvé: ${schemaId}</div>`;
  }
}
