/**
 * Transforme la proposition d’un enseignant (rédigée avec ses mots) en :
 * - un texte lisible, à envoyer par GitHub, WhatsApp ou e-mail ;
 * - un brouillon de module JSON pour l’équipe technique.
 * L’enseignant ne voit jamais le JSON.
 */

export const REPO = 'Gecnos/wamon';
export const ISSUE_TEMPLATE = 'proposer-un-exercice.yml';

export interface DataRow {
  name: string;
  symbol: string;
  value: string;
  unit: string;
}

export interface Proposal {
  title: string;
  levels: string[];
  statement: string;
  data: DataRow[];
  unknownName: string;
  unknownSymbol: string;
  unknownUnit: string;
  answer: string;
  correction: string;
  experiment: string;
  author: string;
}

export const EMPTY_PROPOSAL: Proposal = {
  title: '',
  levels: [],
  statement: '',
  data: [
    { name: '', symbol: '', value: '', unit: '' },
    { name: '', symbol: '', value: '', unit: '' },
  ],
  unknownName: '',
  unknownSymbol: '',
  unknownUnit: '',
  answer: '',
  correction: '',
  experiment: '',
  author: '',
};

export function missingFields(p: Proposal): string[] {
  const missing: string[] = [];
  if (!p.title.trim()) missing.push('le titre');
  if (!p.statement.trim()) missing.push('l’énoncé');
  if (!p.data.some(d => d.name.trim() && d.value.trim())) missing.push('au moins une donnée');
  if (!p.unknownName.trim()) missing.push('ce que la classe doit trouver');
  if (!p.answer.trim()) missing.push('la réponse attendue');
  return missing;
}

const filledRows = (p: Proposal) => p.data.filter(d => d.name.trim() || d.value.trim());

function dataLines(p: Proposal): string {
  return filledRows(p)
    .map(d => `- ${d.name.trim()}${d.symbol.trim() ? ` (${d.symbol.trim()})` : ''} = ${d.value.trim()} ${d.unit.trim()}`.trimEnd())
    .join('\n');
}

function unknownLabel(p: Proposal): string {
  return `${p.unknownName.trim()}${p.unknownSymbol.trim() ? ` (${p.unknownSymbol.trim()})` : ''}`;
}

/** Texte brut, pour WhatsApp, un e-mail ou un fichier. */
export function toPlainText(p: Proposal): string {
  return [
    `Proposition d’exercice pour Wamon : ${p.title.trim()}`,
    p.levels.length ? `Niveau : ${p.levels.join(', ')}` : '',
    '',
    'ÉNONCÉ',
    p.statement.trim(),
    '',
    'DONNÉES',
    dataLines(p),
    '',
    'CE QUE LA CLASSE DOIT TROUVER',
    `${unknownLabel(p)} = ${p.answer.trim()} ${p.unknownUnit.trim()}`.trimEnd(),
    '',
    p.correction.trim() ? `CORRECTION\n${p.correction.trim()}\n` : '',
    p.experiment.trim() ? `EXPÉRIENCE À MONTRER\n${p.experiment.trim()}\n` : '',
    p.author.trim() ? `Proposé par : ${p.author.trim()}` : '',
  ].filter((line, i, all) => !(line === '' && all[i - 1] === '')).join('\n').trim();
}

const slug = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'exercice';
const toNumber = (s: string) => {
  const n = Number(s.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const LEVEL_IDS: Record<string, string> = { Seconde: '2nde', Première: '1ere', Terminale: 'terminale' };

/** Brouillon de module au format de src/data/modules, à relire par l’équipe. */
export function toModuleDraft(p: Proposal): string {
  const grandeurs: Record<string, unknown> = {};
  const donnees: string[] = [];
  filledRows(p).forEach((d, i) => {
    const key = d.symbol.trim() || `X${i + 1}`;
    const value = toNumber(d.value);
    donnees.push(key);
    grandeurs[key] = { label: `${d.name.trim()} (${key})`, unite: d.unit.trim(), default: value ?? d.value.trim() };
  });
  const inconnue = p.unknownSymbol.trim() || 'X';
  grandeurs[inconnue] = { label: `${p.unknownName.trim()} (${inconnue})`, unite: p.unknownUnit.trim(), default: toNumber(p.answer) ?? p.answer.trim() };
  return JSON.stringify({
    id: slug(p.title),
    version: 1,
    titre: p.title.trim(),
    matiere: 'chimie',
    niveau: p.levels.map(l => LEVEL_IDS[l] ?? l),
    description: p.statement.trim(),
    grandeurs,
    variantes: [{ id: 'A', inconnue, donnees, formule: 'À COMPLÉTER', description: p.statement.trim() }],
    vues: [],
    tolerance: 0.02,
    modele: 'à définir',
  }, null, 2);
}

/**
 * Lien vers le formulaire GitHub prérempli. Chaque paramètre correspond à
 * l’identifiant d’un champ de .github/ISSUE_TEMPLATE/proposer-un-exercice.yml.
 */
export function githubIssueUrl(p: Proposal): string {
  const params = new URLSearchParams({
    template: ISSUE_TEMPLATE,
    title: `Exercice : ${p.title.trim()}`,
    niveau: p.levels.join(', '),
    enonce: p.statement.trim(),
    donnees: dataLines(p),
    reponse: `${unknownLabel(p)} = ${p.answer.trim()} ${p.unknownUnit.trim()}`.trimEnd(),
    correction: p.correction.trim(),
    experience: p.experiment.trim(),
    auteur: p.author.trim(),
    brouillon: toModuleDraft(p),
  });
  return `https://github.com/${REPO}/issues/new?${params.toString()}`;
}

export function whatsappUrl(p: Proposal): string {
  return `https://wa.me/?text=${encodeURIComponent(toPlainText(p))}`;
}

/** Au-delà, GitHub refuse l’adresse : on propose de copier le texte. */
export const MAX_URL_LENGTH = 8000;
