# Alien: Covenant — sprites et bible V0.15

Date : 26 novembre 2026. Base conservée : commit `806a9c387477b5d972846df92016ac3537b3f402`.

## Production livrée

Cette continuation ajoute **22 PNG originaux** : huit phases de marche de Ricks, huit d’Oram et six équipements. Les fichiers ont tous été récupérés avec leurs octets exacts après une interruption de l’environnement. Leurs SHA256, tailles, dimensions et empreintes des blobs Git ont été vérifiés. Le total passe de 103 à **125 PNG présents dans les sources**.

| Mesure | État de cette continuation |
|---|---:|
| Nouveaux PNG générés, récupérés et inclus | 22 |
| PNG de ce lot encore à récupérer | 0 |
| PNG cumulés dans les sources | 125 |
| PNG utilisés par le runtime V0.14 | 72 |
| PNG hors runtime | 53 |
| Cycles / phases utilisés par le jeu | 5 / 40 |
| Cycles de marche supplémentaires au catalogue | 2 / 16 phases |
| Nouvelles admissions dans le jeu | 0 |
| Images certifiées identiques à 1:1 | 0 |

Les 22 nouveaux PNG totalisent **38 556 637 octets**. Les 103 originaux V011–V014 restent conservés.

## Deux séries de marche

**Ricks :** huit phases en tenue de bord. Les contacts 01/05 et les appuis 03/07 alternent les jambes. Les phases 05/06 ont été corrigées après une inversion de la jambe proche ; les bras 03/07 ont ensuite été rapprochés de la position neutre de passage. La phase 05 conserve sa dimension native **1024 × 1535** ; les sept autres mesurent 1024 × 1536. Aucun original n’a été redimensionné.

**Oram :** huit phases en tenue de bord, toutes en 1024 × 1536. Les bras des passages 03/07 ont été corrigés. Les huit fichiers finaux, d’abord inaccessibles, ont ensuite été retrouvés ; leurs empreintes correspondent au checkpoint antérieur à l’incident. Les noms des originaux et les prompts finaux sont conservés dans le manifeste. Les prompts des premiers essais 03/07, remplacés et rejetés, restent explicitement non récupérés.

Les deux séries ont été revues sur des planches finales reconstruites depuis les vrais originaux, avec une seconde lecture indépendante. Les corps sont entiers, les mains libres et les appuis alternés lisibles. Les grandes foulées, les plis, certains détails du visage et des poches, ainsi que l’orientation du torse varient entre phases. Les pivots et cadences proposés restent provisoires.

Les cibles documentées sont `ricks-bridge` et `oram-bridge` dans `bridge`. Les seize images sont au catalogue ; leur raccord et leur animation continue dans le jeu restent à valider.

## Six équipements

| PNG | Référence et limite de raccord |
|---|---|
| Console principale du pont du Covenant | Ensemble de commandes d’après une planche de production ; les actions de la console native restent à préserver. |
| Console principale du Lander | Cockpit distinct, commandes et écrans documentés ; remplacement natif non validé. |
| Table centrale du pont | Mobilier sans hologramme ajouté ; aucun consommateur autonome démontré. |
| Table médicale avec colonne | Ensemble complet ; sa colonne ne correspond pas directement à la table native du Lander. |
| Siège du Covenant | Sellerie noire et entretoises bleues ; aucun siège natif autonome identifié. |
| Siège du Lander | Sellerie jaune et barre avant ; comparaison au décor final encore nécessaire. |

Les planches de production de Jeremy Love guident les formes. Elles ne suffisent pas à certifier leur identité avec le décor final du film. La revue indépendante confirme des assemblages entiers et isolés ; les petits graphismes demeurent reconstruits. Les six équipements restent au catalogue documentaire.

## Bible détaillée

Les [fiches Markdown V015](BIBLE_COVENANT_V015.md), la [vue HTML V015](BIBLE_COVENANT_V015.html) et l’[inventaire JSON V015](BIBLE_COVENANT_V015.json) prolongent les **315 références** de V014 : personnages, lieux, armes, props, véhicules, vaisseaux, terrains et planètes.

Les données historiques sont conservées, notamment les 23 profils, 126 familles de props / 630 occurrences, 57 fiches spatiales, 67 liaisons, 134 seuils, sept familles d’armes, 16 familles de terrains et trois fiches planétaires. Les ajouts datés précisent l’apparence, les références, les images présentes, les états manquants, les liens avec la campagne et la prochaine action. La bible principale et le README Covenant renvoient à cette version.

Cette livraison fournit les formats Markdown, HTML et JSON. Le [classeur V014](BIBLE_COVENANT_V014.xlsx) demeure le dernier XLSX finalisé ; aucun XLSX ni pack ZIP V015 n’est inclus.

## Vérifications et portée

Les 22 fichiers ont été relus après le retour de l’environnement : octets, SHA256, dimensions et canal alpha. Au seuil alpha ≥ 32, chaque silhouette possède des marges libres ; les pixels de bord ont un alpha maximal compris entre 0 et 2. Les originaux conservent leurs pixels de génération. Les planches de contrôle sont des aperçus dérivés et ne remplacent pas ces originaux.

Le manifeste sépare `assets` (22 PNG), `catalogueCycles` (deux séries) et `cycles` (vide pour les nouvelles admissions). `pendingRecovery` est vide. Le checkpoint Oram antérieur est conservé uniquement sous `recoveryHistory`, avec son état historique et la résolution de la récupération.

La distribution garde le runtime V0.14, ses 72 PNG, cinq cycles et 40 phases. Les chemins V015 sont admis uniquement dans les sources et refusés dans la distribution. Les contrôles de cette publication portent sur la conservation des fichiers et cette séparation. Le workflow de rendu existant conserve ses parcours et son catalogue V014 ; il ne constitue pas une validation des nouvelles marches dans le jeu.

## Manques encore ouverts

Les **15 profils mobiles de PNJ sans marche intégrée** restent ouverts. Parmi eux, **13 n’ont pas encore de série PNG de marche publiée** ; Ricks et Oram possèdent maintenant leurs huit phases, mais leur raccord manque. Les quatre profils joueurs sans course PNG, les sept familles d’armes sans PNG et les autres besoins documentés restent suivis dans la bible.

La cible reste la fidélité aux références disponibles. Les détails cachés, le bas de certains costumes, les plis, les contacts des pieds et les éléments issus de concepts comprennent des reconstructions. **Aucune fidélité filmique 1:1 n’est certifiée.** Cette continuation ne clôture pas tous les manquants du DLC. La PR reste en brouillon.
