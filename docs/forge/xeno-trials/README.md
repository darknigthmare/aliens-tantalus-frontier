# Xeno Trials — plan de production V146

**Phase 1 seulement : inventaire et spécification, sans changement du moteur.**
Base de référence : `39bc11e5abe4427ae44c452e9727288e63310ec3`, PR nº 9.
La version applicative reste 143.0.0 et le schéma de sauvegarde reste 52.

## Fichiers de revue

- [Classeur Excel](ALIENS_TANTALUS_XENO_TRIALS_PLAN_V146.xlsx) : 20 onglets, tables filtrables, panneaux figés, statuts éditables et pilotage calculé.
- [Données du plan](xeno-trials-plan-v146.json) : mêmes en-têtes et lignes de détail, lisibles dans les diffs.
- [Manifeste](manifest-v146.json) : SHA-256 des deux fichiers, noms des feuilles et couverture.

Le classeur a été créé avec `artifact_tool`, puis vérifié et exporté. Le transport vers GitHub restaure les octets exacts du fichier revu ; il ne remplace pas le classeur par un pointeur, un CSV ou un script à exécuter.

## Couverture

189 IDs de combattants du dépôt, variantes comprises, et 6 arènes existantes. Les 10 arènes proposées et les 15 candidats hors roster restent explicitement distincts.

Par combattant : 18 emplacements de locomotion/combat/défense, 3 signatures candidates, 2 supers proposés, 2 finitions, 10 événements de présentation (dont victoire/défaite de première manche), 5 lots de production et une fiche de relevé.
Cela représente 3 402 emplacements de moveset, 567 signatures candidates, 378 supers proposés, 378 finitions, 1 890 présentations et 945 lots. **Ce ne sont pas autant d’attaques canoniques distinctes ou de nouvelles animations implémentées.**

Le plan comprend aussi 122 dossiers d’identité, 192 postes d’animation d’arène, 33 règles de compatibilité, 22 critères de recette, 18 décisions et 6 profils numériques du moteur actuel. Les 8 616 lignes de détail sont une couverture de préproduction, pas un score d’avancement du jeu.

## Références et fidélité

**Aucun kit n’est certifié 1:1 dans ce livrable.** Le tableau de bord indique zéro approbation et zéro lot terminé. Les futurs coûts, timings et dommages ne sont pas inventés : ils restent à décider ou à relever.

L’onglet Sources comporte 65 entrées : 21 consultées (dont quatre fichiers du dépôt), un extrait indexé limité, deux accès bloqués et 41 références héritées à vérifier. Une fiche de distributeur, une figurine licenciée ou un synopsis ne prouve pas un moveset complet. Les limites de chaque lien sont écrites à côté de la source ; aucun timecode, page de combat ou planche approuvée n’est fabriqué.

Les descriptions des gestes non relevés sont des **candidats**. Les supers, intros/outros et finitions ajoutés pour la simulation Xeno Trials restent des adaptations originales, même lorsqu’ils emploient un geste attesté. Aucun média de référence protégé n’est redistribué.

Manche 1 : recovery, repli ou diagnostic, sans conséquence irréversible avant la reprise. Finisher : uniquement après une victoire terminale, avec prise en compte des ancrages, tailles, fluides et organes de la cible ; option d’ellipse et aucune deuxième récompense.

## Utilisation

Commencer par `00_LisezMoi`, puis filtrer le roster et les dossiers. Compléter les repères dans `17_RelevesReference` avant d’approuver les silhouettes et les gestes. Affecter les lots dans `13_Production` ; les statuts et les formules alimentent `01_Pilotage`. Les chiffres du tableau de bord mesurent le plan, pas une certification de contenu.

`03_ContratsActuels` et `19_TimingsActuels` décrivent le code existant. Les tailles estimées et les statistiques de tournoi restent celles du projet, jamais des mesures canoniques. La conversion en ticks utilise l’horloge de 120 Hz du moteur ; elle n’est pas un relevé des œuvres.

## Vérification

```sh
npm run test:trials:plan
```

La recette documentaire compare tous les IDs au registre réellement importé, contrôle la couverture par combattant, les références, les marqueurs de phase et les empreintes. Elle ouvre l’archive XLSX avec la bibliothèque standard pour vérifier les 20 onglets, les tables, les formules, les compteurs cachés et l’absence de macros/liens externes Excel. Ce n’est pas un test de gameplay ou une preuve visuelle de fidélité.

Le JSON et le classeur constituent une version revue ensemble : lors d’une révision, mettre à jour les deux fichiers et leurs empreintes dans le manifeste. Un changement de roster oblige à réconcilier la couverture avant de republier le plan.

## Hors de cette livraison

Pas d’implémentation des nouvelles attaques, pas de génération des animations, pas de campagne ni nouveau stage jouable, pas de modification des sauvegardes, du cloud, des protections de branche ou de fusion de PR. Le plan est conservé sous `docs/forge` et n’est pas ajouté au paquet du jeu par le build existant.
