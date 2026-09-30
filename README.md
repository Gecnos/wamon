# Wamon

**Le laboratoire dans la classe.** Wamon est une application libre pour aider les enseignants de physique-chimie du secondaire à transformer les exercices du programme en expériences visibles. Elle est pensée pour être projetée en classe, y compris dans les établissements où le matériel de laboratoire et la connexion Internet sont limités.

## État du projet

Le premier parcours interactif est le dosage d’un acide fort par une base forte. Il existe sous deux formes :

- **Séance guidée** (`/seance/…`), pour l’enseignant qui projette : quatre étapes (faire calculer, entrer la réponse de la classe, lancer l’expérience, comparer), un seul bouton principal par écran, réponses par groupe et correction détaillée à la demande.
- **Labo libre** (`/labo`), pour manipuler soi-même, y compris sur téléphone : choix de l’acide, de la base, des concentrations, de la burette et de l’indicateur, versement goutte à goutte ou robinet ouvert, relevé des mesures et tracé de sa propre courbe.

Un **mode projection** agrandit toute l’interface et masque les réglages. L’application contient aussi un catalogue illustré du matériel (une page par instrument), un guide enseignant et un formulaire qui télécharge un modèle d’exercice JSON.

Le fichier de données de dilution et son modèle de calcul sont présents, mais cet exercice n’est pas encore intégré au parcours de simulation React. Les modules JSON ne sont pas encore chargés automatiquement : ajouter un fichier seul ne le rend pas disponible dans l’application.

## Démarrage rapide

### Prérequis

- Node.js 20.19 ou ultérieur
- npm
- Git

### Installation

```bash
git clone https://github.com/Gecnos/wamon.git
cd wamon
npm install
npm run dev
```

Vite affiche l’adresse locale à ouvrir dans le navigateur.

### Commandes utiles

```bash
npm run dev       # serveur de développement
npm run build     # vérification TypeScript et build de production
npm run preview   # prévisualiser le contenu de dist/
npm test          # tests automatisés Vitest
npm run test:watch
```

Le dépôt utilise React 18, React Router 7, Tailwind CSS 4, TypeScript, Vite 6, le plugin React pour Vite et Vitest 3. Chaque écran et chaque étape de séance a sa propre URL (`HashRouter`, pour fonctionner hors ligne et sur un hébergement statique) : le bouton « retour » du navigateur revient à l’écran précédent. L’état de la séance est conservé dans `sessionStorage`. L’interface est écrite uniquement avec des classes Tailwind ; `src/styles/app.css` ne contient que le thème (couleurs, polices) et la variante `projection:`. `npm run build` est la vérification à lancer avant une proposition de changement. Les configurations TypeScript de l’application et de Vite sont séparées dans `tsconfig.app.json` et `tsconfig.node.json`.

## Architecture du code

L’entrée HTML charge `src/main.tsx`, qui monte `src/App.tsx`. Les routes sont déclarées dans `src/App.tsx` ; `src/pages/AppShell.tsx` affiche l’en-tête, la navigation et le bouton de projection.

| Emplacement | Responsabilité |
| --- | --- |
| `src/pages/` | Accueil, séance guidée, labo libre, matériel, guide et contribution |
| `src/features/seance/` | Étapes de la séance guidée, état partagé et calculs de comparaison |
| `src/features/titration/` | Paillasse animée, courbe, lecture des mesures et choix de l’indicateur |
| `src/ui/` | Composants d’interface réutilisables (boutons, champ numérique, icônes) |
| `src/lib/` | Formatage des nombres, stockage local, mode projection |
| `src/data/modules/` | Données descriptives des exercices au format JSON |
| `src/data/catalog/` | Fiches JSON du matériel de laboratoire |
| `src/models/` | Calculs et modèles scientifiques indépendants de l’interface |
| `src/engine/` | Dessin SVG du montage et animation de l’expérience |
| `src/core/` | Fonctions génériques : validation des résultats, formules et export JSON |
| `src/components/svg/` | Schémas SVG des instruments du catalogue |
| `src/styles/app.css` | Point d’entrée Tailwind et thème |
| `tests/` | Tests des modèles, validations, catalogue et fonctions centrales |
| `public/` | Manifeste et service worker |

La séance guidée (`src/pages/SeanceView.tsx`) lit `src/data/modules/dosage-fort-fort.json` via `src/features/seance/logic.ts`. La séance et le labo pilotent le montage SVG de `src/engine/` par le hook `src/features/titration/useTitration.ts`. Le fichier `src/main.ts` contient une ancienne implémentation impérative : ce n’est pas l’entrée chargée par `index.html`.

## Ajouter un exercice

### Préparer les données pédagogiques

La page **Contribuer** télécharge un JSON de départ. Le schéma est défini dans `src/types.ts` (`ModuleConfig`). Un module comprend notamment :

- `id`, `version`, `titre`, `matiere`, `niveau` et `description` ;
- `grandeurs`, une table de symboles avec intitulé, unité, bornes et valeur par défaut ;
- `variantes`, qui précise l’inconnue, les grandeurs fournies, la formule et la consigne ;
- `vues`, les instruments et graphiques prévus ;
- `tolerance`, l’écart relatif admis ;
- `modele`, une référence documentaire au modèle scientifique.

Les expressions de formule prises en charge par `src/core/formulaEvaluator.ts` sont l’addition, la soustraction, la multiplication, la division, le modulo, les parenthèses et les puissances `^`. Les noms de variables doivent correspondre aux clés de `grandeurs`.

### Brancher l’exercice à l’application

Le chargement dynamique des modules n’est pas encore implémenté. Pour rendre un nouvel exercice interactif, il faut donc également :

1. Ajouter ou adapter les données dans `src/data/modules/`.
2. Écrire le calcul scientifique dans `src/models/` et tester les cas limites.
3. Relier les données et le modèle à la vue de simulation. La sélection du module et de ses variantes doit être intégrée à `src/features/seance/`.
4. Ajouter ou réutiliser les composants de `src/ui/` et `src/features/`.
5. Si l’expérience nécessite un montage ou une animation, compléter le rendu SVG et le moteur dans `src/engine/`.
6. Ajouter des tests dans `tests/`, puis lancer `npm test` et `npm run build`.

Un exercice qui réutilise un modèle et un rendu existants peut demander peu de code, mais le fichier JSON seul ne suffit pas encore à l’enregistrer dans l’interface. Pour ajouter un nouveau type d’expérience, documentez les équations, unités, hypothèses, cas limites, observations attendues et consignes de sécurité.

## Ajouter un instrument au catalogue

Les fiches sont dans `src/data/catalog/`. Elles décrivent le rôle, la précision, les étapes d’utilisation, les erreurs fréquentes, la sécurité et les niveaux concernés. Les schémas sont dans `src/components/svg/`; le catalogue et ses fiches sont rendus par `src/pages/CatalogView.tsx` (`/materiel` et `/materiel/:id`). Ajoutez un test si vous modifiez le format ou le comportement des fiches.

## Contribution au projet

1. Créez une branche dédiée à votre changement (`feature/...` ou `fix/...`).
2. Gardez les changements concentrés et documentez les décisions pédagogiques ou scientifiques.
3. Ajoutez ou mettez à jour les tests utiles.
4. Lancez `npm test` et `npm run build`.
5. Ouvrez une pull request avec le contexte, les étapes pour vérifier le changement et, pour les exercices, les sources et la solution de référence.

Les propositions sont relues pour leur justesse scientifique, les unités, la sécurité des manipulations, l’accessibilité et l’adéquation aux programmes des classes visées. Les détails pour les contributions pédagogiques sont dans [CONTRIBUTING.md](CONTRIBUTING.md).

## Déploiement et fonctionnement hors ligne

Le projet se construit avec `npm run build` dans `dist/`. Wrangler peut détecter le projet Vite ; Vite 6 est requis par sa configuration automatique. Pour un déploiement Cloudflare, configurez la commande de build `npm run build` et le dossier de sortie `dist`.

Un service worker est fourni dans `public/sw.js`. Il met en cache la page d’entrée et le manifeste et peut retourner la page d’entrée pour une navigation hors ligne. Il ne met pas actuellement en cache de façon explicite tous les bundles générés ni les polices distantes. La disponibilité hors ligne complète doit donc être vérifiée sur l’hébergement ciblé avant une utilisation sans connexion.

## Licences

- Code : MIT.
- Contenus pédagogiques : CC BY-SA.

Merci d’indiquer les sources et les crédits des contenus, données et schémas adaptés. Vérifiez la licence des contributions avant de les intégrer.

## Déploiement (Cloudflare Workers)

Le site est servi comme contenu statique par Cloudflare Workers. La configuration est dans `wrangler.jsonc` : elle sert `dist/`, et le bloc `previews` est requis par `wrangler preview`.

Dans le tableau de bord Cloudflare, sous **Workers & Pages → wamon → Settings → Builds** :

| Réglage | Valeur |
| --- | --- |
| Build command | `npm run build` |
| Deploy command (branche de production) | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler preview` |

La commande de build doit être réglée dans le tableau de bord, car `wrangler preview` n'exécute pas le `build.command` du fichier de configuration. `wrangler deploy`, lui, l'exécute.

Pour vérifier la configuration sans rien publier : `npx wrangler deploy --dry-run`.
