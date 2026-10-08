import burette from './burette.json';
import becher from './becher.json';
import erlenmeyer from './erlenmeyer.json';
import fioleJaugee from './fiole-jaugee.json';
import pipetteJaugee from './pipette-jaugee.json';
import statif from './statif.json';
import type { CatalogItem } from '../../types';

/** Fiches du matériel, dans l’ordre d’affichage. Ajoutez la vôtre ici. */
export const CATALOG: CatalogItem[] = [burette, becher, erlenmeyer, fioleJaugee, pipetteJaugee, statif] as CatalogItem[];
