# Reprise GitHub — 25 novembre 2026

Cette branche sauvegarde la base Blackout v0.7.0 après la perte de l’environnement
d’exécution. Elle est volontairement en brouillon : l’intégration au menu et à
la distribution de Tantalus n’est pas achevée.

## Contenu récupéré sur GitHub

- Programme autonome complet, relu après son envoi.
- 26 scripts, style, entrée modulaire et 41 SVG, issus du programme récupéré.
- Résumé des contrôles exécutés avant la coupure.
- Patches des changements confirmés : menu, navigation clavier/manette,
  inclusion au build, admission des sources et retour avec sauvegarde.
- Inventaire des autres lots locaux repérés, sans les déclarer publiés.

Les patches *.pending.patch ne sont pas actifs. Le patch hôte importe un
manifeste qui reste à produire : ne pas l’appliquer directement sur une branche
de production. Leur préambule détaille les éléments manquants.

## Source complète durable

L’archive originale contenant 400 fichiers est conservée sur
[Google Drive](https://drive.google.com/file/d/1UfPC8srC0FOAfVy-g6yQ8-Y8Xy6GnC84/view?usp=drivesdk).
Son empreinte et sa taille sont dans validation-summary.json. Les gros rapports,
captures, scripts QA et fixtures historiques n’ont pas pu être transférés
individuellement dans ce commit après la coupure.

## Validation et portes de sortie

Les contrôles du module d’origine passent ; ils ne valident pas les nouveaux
raccordements hôtes. Avant fusion :

1. Restaurer les 400 fichiers originaux et les résultats détaillés de QA si
   l’environnement redevient disponible.
2. Appliquer les patches de reprise et terminer leurs éléments ouverts.
3. Générer le manifeste fermé et ses empreintes, en laissant la documentation,
   les archives et les outils hors du build public.
4. Ajouter une succession d’audit datée après V187/Obscura, sans réécrire les
   anciennes empreintes.
5. Vérifier entrée et retour au clavier/manette, sauvegardes séparées, échec du
   stockage et export de secours.
6. Exécuter les suites ciblées, npm run check, npm run build et npm run
   check:built, puis le parcours navigateur.
7. Relire l’état distant et résoudre les éventuels ajouts concurrents avant
   toute fusion.

La v0.8 interrompue est non récupérable à partir des références actuellement
fournies. Ne pas la présenter comme livrée.
