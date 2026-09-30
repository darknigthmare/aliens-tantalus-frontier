# V102 — finalisation Ceto et distribution publique

## Périmètre livré

Le rendu des bassins Ceto utilise les huit bandes visibles mesurées dans l'atlas natif. La ligne d'eau et le fond restent alignés avec le bassin ; un retrait horizontal de deux pixels élimine les traits de bord aux raccords. L'image originale est conservée. Le traitement est limité aux dangers de type `flood` de Ceto, avec repli sur le rendu historique si l'atlas attendu n'est pas disponible. Physique, dégâts et sauvegardes ne changent pas.

Le cache applicatif est renouvelé sans effacement des sauvegardes. Les outils de contrôle privés V102 sont explicitement exclus du build. La publication utilise la distribution publique dédiée, distincte de l'historique de travail, avec contrôle de provenance et des fichiers autorisés.

## Fonctions déjà intégrées à vérifier avant publication

- Xeno Trials : 103 combattants, dont 15 synthétiques ; sélection de personnage puis arène, six arènes, introduction, temps de combat, achats et filtres.
- Bibliothèque utilisateur : 108 illustrations originales, dont 89 du nouveau pack et 19 récupérées, conservées avec leurs empreintes et leurs liens Altered.
- Laboratoire de profondeur : comparaison optionnelle 2D / 2.5D sur quatre zones. La campagne 2D n'est pas remplacée.

## Travail artistique restant

Ces 108 illustrations sont des références documentaires, pas 108 sprites de combat prêts à jouer. Les images retenues ou rejetées ne sont pas réadmises automatiquement. La fidélité, le détourage, les dimensions/pivots et les animations nécessitent une validation individuelle. Xeno Trials utilise actuellement des poses fixes animées par le moteur, pas des planches d'animation complètes. Cette finalisation technique ne clôt pas ce chantier artistique.

Les résultats de tests, captures de navigateur et contrôles HTTP sont conservés dans les preuves privées V102. Le statut de publication n'est confirmé qu'après le déploiement réel et ses vérifications ; ce document ne vaut pas reçu de déploiement.
