export type Matiere = 'chimie' | 'physique';

export interface GrandeurConfig {
  label: string;
  unite: string;
  min?: number;
  max?: number;
  step?: number;
  default?: number;
}

export interface VarianteConfig {
  id: string;
  nom?: string;
  inconnue: string;
  donnees: string[];
  formule: string;
  description?: string;
}

export interface ModuleConfig {
  id: string;
  version: number;
  titre: string;
  matiere: Matiere;
  niveau: string[];
  grandeurs: Record<string, GrandeurConfig>;
  variantes: VarianteConfig[];
  vues: string[];
  tolerance: number; // default e.g. 0.02 (2%)
  modele: string;
  description?: string;
}

export interface GroupResult {
  id: string;
  name: string; // e.g. "Groupe 1"
  value: number;
  color: string;
}

export interface VerificationResult {
  isCoherent: boolean;
  referenceValue: number;
  userValue: number;
  diffValue: number;
  diffPercent: number;
  tolerance: number;
  details: string;
}

export interface CatalogItem {
  id: string;
  nom: string;
  categorie: 'mesure-volume' | 'contenants-reaction' | 'chauffage-agitation' | 'mesure' | 'supports-accessoires' | 'produits-securite';
  schema: string;
  role: string;
  precision: string;
  utilisation: string[];
  erreurs_frequentes: string[];
  securite: string[];
  niveaux: string[];
  utilise_dans: string[];
}
