# Contribuer à Wamon

Merci de votre intérêt ! Wamon avance avec des professeurs et des développeurs qui connaissent les réalités des cours de sciences, en particulier en Afrique de l’Ouest : classes chargées, matériel de laboratoire rare, connexion instable. Toute contribution qui rend l’application plus utile dans ces conditions est la bienvenue.

Il existe plusieurs façons d’aider, et la plupart ne demandent pas de savoir programmer.

- [Proposer un exercice](#proposer-un-exercice)
- [Relire un exercice](#relire-un-exercice)
- [Signaler un problème](#signaler-un-problème)
- [Contribuer au code](#contribuer-au-code)

## Proposer un exercice

**Vous n’avez pas besoin de connaître le format des fichiers ni GitHub.** Écrivez à **vianneyhoueho@gmail.com** (le lien « Nous écrire » de l’application ouvre le message), en décrivant l’exercice comme un sujet de TP : titre, niveau, énoncé, données, ce que la classe doit trouver, réponse attendue, correction et ce que l’expérience doit montrer.

Ce qui aide le plus la relecture :

- l’énoncé complet, avec les unités ;
- une correction détaillée et vérifiable ;
- ce que la classe doit **voir** : un changement de couleur, un précipité, un volume lu sur la burette… ;
- la source de l’exercice si vous l’avez adapté (manuel, sujet d’examen, guide du programme).

## Relire un exercice

Chaque exercice est relu par au moins un professeur avant d’être publié. Pour relire :

- refaites le calcul et vérifiez les unités ;
- vérifiez que les données sont réalistes et que les manipulations sont sans danger ;
- vérifiez que l’énoncé est clair pour un élève du niveau indiqué.

Envoyez vos remarques par e-mail, ou en commentaire de la pull request.

## Signaler un problème

Ouvrez un [ticket](https://github.com/Gecnos/wamon/issues/new/choose) avec le modèle **Signaler un problème**. Indiquez ce que vous faisiez, ce que vous attendiez et ce qui s’est passé. Précisez aussi l’appareil et le navigateur, et joignez une capture d’écran si possible. Une erreur scientifique (un pH faux, une couleur d’indicateur incorrecte) est un problème à signaler au même titre qu’un bouton qui ne marche pas.

## Contribuer au code

### Installer le projet

```bash
git clone https://github.com/Gecnos/wamon.git
cd wamon
npm install
npm run dev
```

Node.js 20.19 ou plus récent est nécessaire.

### Organisation du travail

1. Choisissez un ticket, ou ouvrez-en un pour discuter d’un changement important avant de le coder.
2. Créez une branche depuis `dev` : `feature/…` pour une fonctionnalité, `fix/…` pour une correction, `docs/…` pour la documentation, `chore/…` pour l’outillage.
3. Faites des commits courts, avec un message au format [Conventional Commits](https://www.conventionalcommits.org/fr/), en français : `feat(labo): ajouter l’acide méthanoïque`, `fix(dosage): corriger la couleur du BBT au virage`.
4. Vérifiez avant de pousser :

   ```bash
   npm test
   npm run build
   ```

5. Ouvrez une pull request vers `dev`. Le modèle de description vous guide. `dev` est fusionnée dans `main` pour publier une version.

### Règles du projet

- **Justesse scientifique d’abord.** Un modèle (`src/models/`) est une fonction pure, documentée (équations, unités, hypothèses) et testée sur des valeurs connues. Une valeur de référence trouvée dans un manuel est le meilleur des tests.
- **Lisible en projection, utilisable au doigt.** Les textes et contrastes doivent rester lisibles au fond d’une salle, et les zones à toucher mesurer au moins 44 px. Voir [les principes de design](docs/developpeurs/design.md).
- **Tailwind uniquement.** Pas de nouvelle feuille de style : `src/styles/app.css` ne contient que le thème.
- **Hors ligne.** Aucune ressource externe (police, script, image) chargée au moment de l’exécution.
- **En français.** L’interface, les commentaires et la documentation sont en français. Les identifiants de code peuvent rester en anglais.

### Ajouter un exercice à partir d’une proposition reçue

Suivez [docs/developpeurs/ajouter-un-exercice.md](docs/developpeurs/ajouter-un-exercice.md). Le message du professeur sert de point de départ.

### Outils d’assistance au design (facultatif)

Des « skills » d’agents de code (design d’interface, animations, mobile) sont listés dans `skills-lock.json`. Pour les installer localement :

```bash
npx skills@latest add emilkowalski/skills -a claude-code -s '*' -y
npx skills@latest add anthropics/skills -a claude-code -s frontend-design -s webapp-testing -y
```

Ils sont installés dans `.claude/skills/` et `.agents/`, qui ne sont pas versionnés.

## Licences

En contribuant, vous acceptez que votre code soit publié sous licence [MIT](LICENSE) et vos contenus pédagogiques sous licence [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.fr). Indiquez les sources et les crédits des énoncés, données et schémas adaptés.

## Code de conduite

Ce projet suit un [code de conduite](CODE_OF_CONDUCT.md). En participant, vous vous engagez à le respecter.
