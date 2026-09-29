# Contribuer à Wamon

Wamon avance avec les enseignants et les développeurs qui connaissent les réalités des cours de sciences en Afrique de l’Ouest. Les exercices peuvent être proposés en français, avec les unités et les programmes employés dans les établissements concernés.

## Proposer un exercice sans écrire de code

1. Dans Wamon, ouvrez **Contribuer** et téléchargez le fichier de départ. Il contient la structure d’un module au format JSON.
2. Complétez le titre, la matière, le niveau, l’énoncé, les grandeurs (nom, symbole, unité, valeurs permises) et une ou plusieurs variantes de calcul.
3. Joignez l’énoncé complet, la solution expliquée étape par étape, les unités, les hypothèses et les sources pédagogiques utiles.
4. Envoyez le fichier à l’équipe du projet ou ouvrez une proposition de changement dans le dépôt. Une personne de l’équipe l’ajoutera au catalogue après relecture.

Les exercices qui utilisent les types de simulation déjà pris en charge peuvent être préparés comme contenu JSON. Le fichier téléchargé est un brouillon structuré : vérifiez et remplacez les champs d’exemple avant de le proposer. La page Contribuer explique la relecture et indique quand une adaptation technique est nécessaire.

## Ajouter un nouveau type de simulation

Un nouvel exercice peut réutiliser un moteur et des vues existants. S’il demande un nouveau modèle scientifique, une nouvelle animation ou un nouvel instrument, il faut aussi ajouter le modèle correspondant dans `src/models/`, son rendu dans `src/engine/` ou `src/components/`, puis relier le module à ces éléments. Le module de dosage acide fort/base forte sert d’exemple de bout en bout.

Une contribution de nouveau type devrait inclure :

- le raisonnement scientifique et les équations avec unités cohérentes ;
- les cas limites et une solution de référence vérifiable ;
- le dessin de l’expérience ou du matériel requis ;
- les contrôles nécessaires pour que l’enseignant puisse modifier les données ;
- une description de ce que les élèves doivent observer pendant l’expérience.

## Format du module

Les modules sont des fichiers JSON dans `src/data/modules/`. Les champs importants sont :

- `grandeurs` : grandeurs avec `label`, `unite`, `min`, `max`, `step` et `default` ;
- `variantes` : valeur inconnue, grandeurs données, formule et consigne ;
- `vues` : instruments et graphiques utilisés par le rendu ;
- `tolerance` : écart relatif admis pour vérifier la réponse ;
- `modele` : moteur scientifique associé au module.

Les formules doivent utiliser les symboles déclarés dans `grandeurs`. Une personne qui propose seulement du contenu n’a pas à modifier le moteur scientifique.

## Relecture et licences

Chaque proposition est relue pour la justesse des calculs, les unités, la sécurité des manipulations et la clarté des consignes en classe. Le code est sous licence MIT et les contenus pédagogiques sous licence CC BY-SA. Merci d’indiquer les sources et les crédits des schémas ou contenus adaptés.
