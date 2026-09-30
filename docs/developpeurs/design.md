# Principes de design

Wamon est surtout utilisé **projeté au tableau**, souvent avec un vidéoprojecteur fatigué, et parfois **sur le téléphone** d’un élève. Chaque choix de design part de ces deux situations.

## Direction : le cahier de TP

L’interface reprend les objets familiers d’une classe de sciences :

| Élément | Usage |
| --- | --- |
| Papier blanc, encre bleue (`encre`) | Fond et couleur d’action principale |
| Copie d’élève (marge rouge, lignes) | L’énoncé projeté, l’aperçu d’une proposition |
| Papier millimétré (`bg-millimetre`) | Les courbes, la paillasse |
| Stylo rouge (`rouge`) | La correction, la valeur exacte, une réponse à discuter |
| Vert (`vert`) | Une réponse confirmée |
| Surligneur (`surligneur`) | La réponse de la classe |

Le thème est défini dans `src/styles/app.css` (`@theme`). N’ajoutez pas de couleur en dur : utilisez ces jetons.

## Lisibilité en projection

- La police est **Atkinson Hyperlegible**, dessinée pour la lisibilité en basse vision. Sa version mono sert aux nombres et aux formules. Les deux sont embarquées : aucune requête réseau.
- Texte sombre sur fond clair, avec un contraste d’au moins 4,5:1. C’est la combinaison la plus sûre sur un vidéoprojecteur.
- Toutes les tailles sont en `rem`. En mode projection, `html` passe à 125 % : tout grossit d’un coup.
- La variante `projection:` masque ce que la classe n’a pas à voir (`projection:hidden`).
- Les nombres importants sont grands et en chiffres tabulaires (`tabular-nums`).

## Une action principale par écran

Chaque étape de séance a **un seul bouton principal**, dans la barre collée en bas de l’écran. Les actions secondaires utilisent les boutons `secondary` ou `ghost`. Si un écran semble demander deux boutons principaux, c’est souvent qu’il faut une étape de plus.

## Mobile

- Les zones à toucher mesurent au moins 44 px (`min-h-11`).
- Les champs de saisie sont en 16 px, pour éviter le zoom d’iOS.
- Utilisez `100dvh` et les zones sûres (`env(safe-area-inset-*)`) pour l’encoche et la barre d’accueil.
- Les effets de survol n’existent qu’avec une souris : la variante `hover:` de Tailwind 4 ne s’applique que si l’appareil sait survoler.
- Les boutons réagissent tout de suite au toucher avec `active:scale-[0.97]`.
- Testez sur un vrai téléphone : l’émulation du navigateur ne reproduit ni le clavier, ni l’encoche, ni le toucher.

## Animations

- Seulement quand elles expliquent quelque chose : la goutte qui tombe, la fiole qu’on retourne, la courbe qui se trace.
- Uniquement `transform` et `opacity`, pour rester fluides sur un vieil ordinateur.
- Des courbes nerveuses : `--ease-out-strong` pour ce qui apparaît, `--ease-in-out-strong` pour ce qui se déplace.
- Moins de 300 ms pour les animations de l’interface.
- `prefers-reduced-motion` est respecté : la démonstration de l’accueil s’affiche figée, et les animations passent par `motion-safe:`.

## Écriture

- Des phrases courtes, en français, à la deuxième personne du pluriel pour le professeur.
- Un bouton dit ce qu’il fait : « Lancer l’expérience », pas « Valider ».
- Pas de libellé en capitales, et pas de jargon technique face aux professeurs (« fichier JSON », ou « ticket » sans explication).

## Tailwind uniquement

Aucune feuille de style par composant. `src/styles/app.css` ne contient que :

- l’import de Tailwind et des polices ;
- le thème ;
- l’utilitaire `bg-millimetre` ;
- quelques règles de base.

Pour un SVG injecté, utilisez les variantes arbitraires (`[&_svg]:w-full`). Un `style` en ligne n’est acceptable que pour une valeur calculée à l’exécution, comme la couleur d’une solution.
