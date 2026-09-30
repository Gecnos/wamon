# Architecture du code

Wamon est une application React monopage, sans serveur. Tout le calcul se fait dans le navigateur ; le build est un ensemble de fichiers statiques qui fonctionne hors ligne.

## Vue d’ensemble

```
index.html → src/main.tsx → src/App.tsx (routes)
                               │
          ┌────────────────────┼─────────────────────────┐
     src/pages/           src/features/            src/exercises/
  (un fichier par écran)  (blocs d’interface       (registre des exercices :
                           par domaine)             données + comportement)
                               │                         │
                          src/engine/               src/data/modules/*.json
                        (animation SVG du dosage)   src/models/ (science pure)
```

## Dossiers

| Dossier | Rôle |
| --- | --- |
| `src/pages/` | Un composant par route : accueil, exercices, séance, labo, matériel, guide, contribution. |
| `src/features/seance/` | La séance guidée : état partagé, frise des étapes, les quatre étapes. |
| `src/features/titration/` | Paillasse animée du dosage, courbe de pH, lecture des mesures, choix de l’indicateur. |
| `src/features/preparation/` | Paillasse de dilution et de dissolution, protocole pas à pas. |
| `src/features/contribution/` | Transformation d’une proposition d’enseignant en texte, en lien GitHub et en brouillon JSON. |
| `src/exercises/` | Le registre des exercices (`EXERCISES`). Chaque exercice combine son fichier JSON et son comportement. |
| `src/data/modules/` | Données des exercices : grandeurs, unités, bornes, variantes, consignes. |
| `src/data/catalog/` | Fiches du matériel de laboratoire (`CATALOG`). |
| `src/models/` | Modèles scientifiques : fonctions pures et testées, sans React. |
| `src/engine/` | Dessin SVG de la burette et du bécher, et moteur d’animation des gouttes. |
| `src/components/svg/` | Schémas SVG des instruments du catalogue. |
| `src/ui/` | Composants génériques : boutons, champ numérique, icônes. |
| `src/lib/` | Formatage des nombres, stockage local, mode projection. |
| `src/core/` | Vérification d’une réponse (tolérance), évaluation de formules. |
| `tests/` | Tests Vitest des modèles, des exercices et du catalogue. |
| `public/` | Manifeste, icône et service worker. |

## Routes

Le routage utilise `HashRouter` (`/#/exercices`) : les adresses fonctionnent sans configuration serveur, depuis un fichier local ou un hébergement statique.

| Adresse | Écran |
| --- | --- |
| `/` | Accueil |
| `/exercices` | Liste des exercices (filtre `?niveau=2de`) |
| `/seance/:exercice/:etape` | Séance guidée ; `etape` vaut `enonce`, `reponse`, `experience` ou `comparer` |
| `/labo` | Labo libre (dosage) |
| `/materiel`, `/materiel/:id` | Catalogue du matériel |
| `/guide` | Guide pour la classe |
| `/contribuer` | Proposer un exercice |

Chaque étape de séance a sa propre adresse : le bouton « retour » du navigateur revient à l’étape précédente.

## État

- **Séance** : `SeanceProvider` (`src/features/seance/SeanceContext.tsx`) garde un état par exercice (variante, données, indicateur, réponses). Il est enregistré dans `sessionStorage` : un rechargement ne perd rien.
- **Labo libre et brouillon de proposition** : `localStorage`, pour retrouver ses réglages.
- **Mode projection** : `ProjectionProvider` pose la classe `projection` sur `<html>`. La taille de base passe à 125 % et la variante Tailwind `projection:` s’active.

Tous les accès au stockage passent par `src/lib/storage.ts`, qui tolère un stockage indisponible (navigation privée).

## Le registre des exercices

Un exercice (`src/exercises/types.ts`) est de l’un de ces types :

- `titration` : dosage d’un acide (fort, ou faible si `acid.pKa` est donné) par la soude. Il réutilise la paillasse animée et la courbe de pH.
- `preparation` : dilution ou dissolution. Il réutilise la paillasse de préparation et l’échelle de teintes.

Chaque exercice fournit :

- ses grandeurs et variantes, lues dans le JSON ;
- les grandeurs réglables (`paramKeys`) ;
- la valeur de n’importe quelle grandeur (`value`) et la valeur exacte de l’inconnue (`reference`) ;
- la correction et ce que l’expérience doit montrer.

Les écrans de séance sont génériques : ils ne connaissent aucun exercice en particulier.

## Modèles scientifiques

| Fichier | Contenu |
| --- | --- |
| `models/dosageFortFort.ts` | pH d’un acide fort dosé par une base forte ; couleurs des indicateurs. |
| `models/titration.ts` | Point d’entrée des dosages. Pour un acide faible, l’électroneutralité est résolue exactement par dichotomie : le pH est juste au début, à la demi-équivalence et à l’équivalence. |
| `models/preparation.ts` | Dilution, dissolution, et teinte d’une solution selon la loi de Beer-Lambert. |
| `models/dilution.ts` | Ancien modèle de dilution, conservé pour ses tests. |

## Rendu du dosage

- `engine/TitrationCanvas.ts` produit le SVG du montage.
- `engine/AnimationEngine.ts` fait tomber les gouttes, baisse le niveau de la burette et colore le bécher.
- Le hook `features/titration/useTitration.ts` relie ce moteur à React.

Le moteur est un singleton : une seule paillasse de dosage est affichée à la fois.
