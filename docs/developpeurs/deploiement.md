# Déploiement

Le build (`npm run build`) produit un site statique dans `dist/`. N’importe quel hébergement statique convient ; le projet est configuré pour Cloudflare Workers.

## Cloudflare Workers

La configuration est dans `wrangler.jsonc` : elle sert `dist/` et contient le bloc `previews` requis par `wrangler preview`.

Dans le tableau de bord Cloudflare, sous **Workers & Pages → wamon → Settings → Builds** :

| Réglage | Valeur |
| --- | --- |
| Build command | `npm run build` |
| Deploy command (branche de production) | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler preview` |

La commande de build doit être réglée dans le tableau de bord, car `wrangler preview` n’exécute pas le `build.command` du fichier de configuration.

Pour vérifier la configuration sans rien publier :

```bash
npx wrangler deploy --dry-run
```

## Mode hors ligne

`public/sw.js` n’est enregistré qu’en production (`src/main.tsx`). Sa stratégie de cache :

- **pages** : réseau d’abord, cache en secours. Une nouvelle version publiée est visible dès le rechargement suivant ;
- **fichiers du build** (JS, CSS, polices) : cache d’abord. Leur nom contient un hachage, donc chaque build produit de nouveaux fichiers.

Si vous changez la stratégie de cache, incrémentez `CACHE` dans `sw.js` : les anciens caches sont supprimés à l’activation.

Pour tester le mode hors ligne :

1. lancez `npm run build && npm run preview` ;
2. ouvrez le site ;
3. coupez le réseau dans les outils de développement, puis rechargez la page.
