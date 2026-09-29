/**
 * Évaluateur sécurisé de formules mathématiques simples pour le moteur d'exercice.
 * Supporte +, -, *, /, (), les puissances ^, et les identificateurs de variables.
 */
export function evaluateFormula(formula: string, scope: Record<string, number>): number {
  // Remplacement des variables par leurs valeurs
  let sanitized = formula.trim();

  // Trier les clés par longueur décroissante pour éviter qu'une sous-chaîne ne soit remplacée partiellement
  const keys = Object.keys(scope).sort((a, b) => b.length - a.length);

  // Remplacer les variables par des valeurs parenthésées si positives/négatives
  for (const key of keys) {
    const val = scope[key];
    if (val === undefined || isNaN(val)) {
      throw new Error(`La variable '${key}' n'est pas définie dans le contexte.`);
    }
    // Remplacement par mot entier (regex boundary \b)
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    sanitized = sanitized.replace(regex, `(${val})`);
  }

  // Évaluation d'expressions arithmétiques sécurisée (parseur par descente récursive)
  return parseArithmetic(sanitized);
}

function parseArithmetic(expr: string): number {
  let pos = 0;
  const str = expr.replace(/\s+/g, '');

  function parseExpression(): number {
    let left = parseTerm();
    while (pos < str.length && (str[pos] === '+' || str[pos] === '-')) {
      const op = str[pos++];
      const right = parseTerm();
      if (op === '+') left += right;
      else left -= right;
    }
    return left;
  }

  function parseTerm(): number {
    let left = parseFactor();
    while (pos < str.length && (str[pos] === '*' || str[pos] === '/' || str[pos] === '%')) {
      const op = str[pos++];
      const right = parseFactor();
      if (op === '*') left *= right;
      else if (op === '/') {
        if (right === 0) throw new Error('Division par zéro');
        left /= right;
      }
      else left %= right;
    }
    return left;
  }

  function parseFactor(): number {
    if (pos >= str.length) throw new Error('Expression invalide');

    if (str[pos] === '-') {
      pos++;
      return -parseFactor();
    }
    if (str[pos] === '+') {
      pos++;
      return parseFactor();
    }

    if (str[pos] === '(') {
      pos++; // skip '('
      const val = parseExpression();
      if (pos >= str.length || str[pos] !== ')') {
        throw new Error('Parenthèse fermante manquante');
      }
      pos++; // skip ')'
      return val;
    }

    const start = pos;
    while (pos < str.length && (/[0-9.]/).test(str[pos])) {
      pos++;
    }

    if (start === pos) {
      throw new Error(`Caractère inattendu : ${str[pos]}`);
    }

    const numStr = str.slice(start, pos);
    const val = parseFloat(numStr);
    if (isNaN(val)) throw new Error(`Nombre invalide : ${numStr}`);

    // Prise en compte de la puissance '^'
    if (pos < str.length && str[pos] === '^') {
      pos++;
      const exponent = parseFactor();
      return Math.pow(val, exponent);
    }

    return val;
  }

  const result = parseExpression();
  if (pos < str.length) {
    throw new Error(`Caractères superflus après l'expression : ${str.slice(pos)}`);
  }
  return result;
}
