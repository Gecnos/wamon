# Modèles scientifiques

Les calculs de Wamon vivent dans `src/models/`, sans aucune dépendance à React. Chaque fonction est testée dans `tests/` contre une valeur calculée à la main ou donnée par le programme.

Toutes les grandeurs sont à 25 °C (Ke = 10⁻¹⁴). Les volumes sont en mL, les concentrations en mol/L.

## Dosage acide-base (`models/titration.ts`)

`titrationPoint(setup, Vb, indicateur)` donne le pH, la couleur de l'indicateur et l'état du mélange pour un volume versé `Vb`.

| Cas | Méthode |
| --- | --- |
| Acide fort par base forte | Excès d'ions H₃O⁺ ou HO⁻ : `models/dosageFortFort.ts`. Équivalence à pH = 7. |
| Acide faible par base forte | Électroneutralité résolue par dichotomie (`weakAcidPH`). Valable avant, à et après l'équivalence. |
| Base faible par acide fort (`mirror: true`) | Modèle miroir du cas précédent (voir ci-dessous). |

Dans le setup, `Ca` et `Va` décrivent toujours la solution **dosée** (dans le bécher) et `Cb` la solution **versée** (dans la burette). Le champ `pKa` est celui de l'espèce faible ; pour une base, c'est le pKa de son acide conjugué (9,25 pour NH₄⁺/NH₃).

### Pourquoi pas la formule d'Henderson ?

pH = pKa + log([A⁻]/[AH]) n'est juste qu'au milieu du dosage. Au début et à l'équivalence, elle donne des résultats faux de plusieurs unités. On résout donc l'équation d'électroneutralité

```
[Na⁺] + [H₃O⁺] = [A⁻] + [HO⁻],   [A⁻] = C·Ka / (Ka + h)
```

par dichotomie sur le pH (60 itérations, précision bien meilleure que 10⁻⁹). Les tests vérifient pH = pKa à la demi-équivalence, le pH de l'acide seul et le pH à l'équivalence.

### Le modèle miroir pour les bases faibles

Doser une base faible B (couple BH⁺/B) par un acide fort revient, par symétrie, à doser un acide faible de pKa′ = 14 − pKa par une base forte, avec un pH inversé :

```
pH(base faible) = 14 − pH'(acide faible de pKa' = 14 − pKa)
```

On réutilise ainsi `weakAcidPH` sans second solveur. L'animation, la courbe et le choix de l'indicateur marchent sans changement : seul l'axe des volumes change de libellé (`titrant`).

## pH d'une solution (`models/ph.ts`)

| Fonction | Relation | Domaine |
| --- | --- | --- |
| `phStrongAcid(C)` | pH = −log C | 10⁻⁶ < C < 10⁻¹ mol/L (programme) |
| `phStrongBase(C)` | pH = 14 + log C | idem |
| `phWeakAcid(C, pKa)` | électroneutralité exacte | toute concentration |
| `conjugateBaseConcentration(C, pKa)` | [A⁻] = C·Ka / (Ka + h) | |

L'énoncé demande aux élèves la formule approchée pH = ½ (pKa − log C), valable si peu d'acide a réagi. Le pH-mètre simulé, lui, affiche la valeur exacte. Pour que la réponse juste de la classe reste dans la tolérance, les exercices d'acide faible n'utilisent que des concentrations de 0,05 à 0,2 mol/L (`src/exercises/ph.ts`).

### Arrondis

Le pH affiché dans l'énoncé est arrondi à 0,01, comme sur un afficheur. Quand la classe cherche C à partir de ce pH, son résultat porte donc l'erreur d'arrondi (jusqu'à 2,3 % sur C pour un acide faible, puisque C varie comme 10^(−2 pH)). Les tolérances (3 % pour les acides forts, 5 % pour l'acide faible) en tiennent compte, et un test le vérifie.

### Échelle de teintes

`universalColor(pH)` interpole entre des points de contrôle du rouge (acide) au violet (basique). Elle sert à colorer le bécher et à dessiner l'échelle 0 à 14 (`features/ph/PhScale.tsx`). Elle est indicative : elle ne remplace pas une mesure colorimétrique.

## Préparation de solutions (`models/preparation.ts`)

Dilution (`Cmère × Vmère = Cfille × Vfille`) et dissolution (`m = C × V × M`). `tint(rgb, C, Cscale)` donne la teinte d'une solution colorée en suivant la loi de Beer-Lambert : l'opacité est `1 − exp(−C / Cscale)`, donc doubler la concentration ne double pas la couleur perçue.

## Ajouter ou modifier un modèle

1. Écrire la fonction dans `src/models/`, avec un commentaire sur les hypothèses et le domaine de validité.
2. Ajouter un test dans `tests/` avec une valeur de référence **qui ne vient pas du code lui-même** : le programme, un manuel, un calcul à la main.
3. Si la fonction nourrit un exercice, vérifier que la réponse exacte arrondie comme dans l'énoncé reste dans la tolérance (voir `tests/terminale.test.ts`).
