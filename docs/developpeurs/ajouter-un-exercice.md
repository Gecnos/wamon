# Ajouter un exercice

Les professeurs proposent des exercices avec leurs mots, par e-mail (vianneyhoueho@gmail.com). Ce guide explique comment en faire un exercice jouable. Il existe quatre types d’exercices : `titration` (dosage), `preparation` (dilution, dissolution), `ph` (mesure de pH) et `calcul` (tout autre calcul de chimie). Un exercice `calcul` a toujours une **simulation animée** : ajoutez sa scène dans `src/features/calcul/sim/scenes.tsx` (une fonction pure de l’avancement `t`, de 0 à 1, construite avec les éléments de `primitives.tsx` : bécher, burette, pipette, pH-mètre, flamme, courbes…). Un test refuse un exercice de calcul sans scène.

## 1. Partir de la proposition

Une proposition arrive par e-mail ou en ticket GitHub. Elle contient :

- l’énoncé, les données, la réponse attendue et la correction ;
- l’expérience à montrer ;

Avant de coder :

- refaites le calcul et vérifiez les unités ;
- identifiez le type d’expérience : un dosage (`titration`, avec `mirror: true` pour une base faible dosée par un acide fort), une dilution ou une dissolution (`preparation`), une mesure de pH (`ph`), un autre calcul (`calcul`, le plus simple : voir `src/exercises/chimie.ts`), ou une expérience nouvelle.

## 2. Écrire le fichier de données

Créez `src/data/modules/<identifiant>.json` :

```json
{
  "id": "dosage-vinaigre",
  "version": 1,
  "titre": "Dosage du vinaigre du commerce",
  "matiere": "chimie",
  "niveau": ["terminale"],
  "description": "Une phrase qui résume l’exercice dans la liste.",
  "grandeurs": {
    "Ca": { "label": "Concentration du vinaigre dilué (Ca)", "unite": "mol/L", "min": 0.01, "max": 0.5, "step": 0.001, "default": 0.142 }
  },
  "variantes": [
    { "id": "A", "inconnue": "Ve", "donnees": ["Ca", "Va", "Cb"], "formule": "Ca * Va / Cb", "description": "La consigne projetée." }
  ],
  "vues": ["burette", "becher", "courbe-ph"],
  "tolerance": 0.02,
  "modele": "titration.ts"
}
```

- `label` se termine par le symbole entre parenthèses : il est retiré à l’affichage.
- `min`, `max` et `step` bornent les réglages du professeur.
- `description` d’une variante est la question projetée.

## 3. Déclarer l’exercice

### Cas simple : un dosage par la soude

Dans `src/exercises/titrations.ts`, appelez la fabrique `titration()` avec votre JSON :

```ts
export const dosageVinaigre = titration(vinaigreConfig as ModuleConfig, {
  id: 'dosage-vinaigre',
  short: 'Dosage du vinaigre',
  duration: '35 min',
  context: 'On dose du vinaigre dilué dix fois par une solution d’hydroxyde de sodium.',
  acid: { name: 'acide éthanoïque', formula: 'CH₃COOH', pKa: 4.76 },
  base: { name: 'soude', formula: 'Na⁺ + HO⁻' },
  defaultIndicator: 'phenolphthalein',
  equipment: ['burette', 'becher', 'pipette-jaugee', 'statif'],
});
```

### Cas simple : une dilution ou une dissolution

Inspirez-vous de `src/exercises/preparations.ts`. Définissez :

- `value` et `reference` ;
- `experiment` : ce qui est manipulé et la concentration obtenue ;
- `correction`.

Choisissez la couleur du soluté (`solute.rgb`) et l’échelle `Cscale`. `Cscale` est la concentration pour laquelle la solution absorbe environ 63 % de la lumière.

### Nouvelle expérience

Si aucune paillasse existante ne convient :

1. écrivez le modèle dans `src/models/` (fonction pure, équations et unités en commentaire) ;
2. ajoutez un nouveau `kind` dans `src/exercises/types.ts` ;
3. créez la paillasse dans `src/features/<domaine>/` et branchez-la dans `StepExperience.tsx` et `StepComparer.tsx`.

Ouvrez d’abord un ticket pour en discuter.

## 4. L’enregistrer

Ajoutez l’exercice à `EXERCISES` dans `src/exercises/index.ts`, dans l’ordre du programme. Il apparaît alors dans la liste, sur l’accueil et à l’adresse `/#/seance/<id>/enonce`.

## 5. Tester

Les tests de `tests/exercices.test.ts` s’appliquent automatiquement à chaque exercice enregistré :

- la valeur exacte de chaque variante est finie et positive, et elle est jugée cohérente ;
- les tirages au hasard restent dans les bornes ;
- la correction contient une formule et une application numérique.

Ajoutez au moins un test avec une valeur de référence, celle de la proposition du professeur ou celle d’un manuel. Puis lancez :

```bash
npm test
npm run build
npm run dev   # parcourez les quatre étapes, sur ordinateur et sur un écran étroit
```

## 6. Remercier

Dans la pull request, citez le professeur s’il l’a souhaité, et prévenez-le par e-mail quand l’exercice est en ligne.
