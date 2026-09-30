// Le stockage peut être indisponible (navigation privée, stockage bloqué) :
// l’application doit continuer à fonctionner sans lui.

export function readJSON<T>(storage: 'local' | 'session', key: string): T | null {
  try {
    const raw = (storage === 'local' ? localStorage : sessionStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(storage: 'local' | 'session', key: string, value: unknown): void {
  try {
    (storage === 'local' ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
  } catch {
    // Rien à faire : l’état reste en mémoire.
  }
}
