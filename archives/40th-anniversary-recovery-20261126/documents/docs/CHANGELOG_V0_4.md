# 0.4.0 — Les systèmes de survie

## Terrain
18 postes indépendants : Trois dispositifs par épisode, approche physique, inspection préalable, commandes locales et coûts limités.

## Lecture
18 plaques originales : Un onglet Terrain dans le journal, distinct des 60 documents narratifs préexistants.

## Navigation
Plan local et balise de carte : Empreintes des obstacles, état des portes, positions connues ; ni radar omniscient ni téléportation.

## Compagnons
Ordres suivre / attendre / garder : Le point de garde est rejoint par navigation, pas par affectation de position. G rappelle avant le changement de pièce.

## Conservation
36 repères manuels +12 autos : Trois sauvegardes manuelles par couple épisode-vue, confirmation avant remplacement ou chargement.

## Transfert
Archive JSON groupée : Tous les emplacements présents et le registre des fins ; préservation des emplacements occupés par défaut.

## Rendu
Silhouettes et équipements : Humains plus détaillés, drone à côtes et dorsales, postes animés et effets locaux ; dessin Canvas vectoriel provisoire.

## Récit
Contenu 0.3 conservé : 60 pièces, 72 interventions, 24 travaux, 12 appareils et les 12 branches de quatre phases.

## Corrections
Le stockage saturé pouvait refuser une écriture puis rendre une ancienne valeur lors d’une lecture : la nouvelle valeur de l’onglet passe désormais devant cette copie périmée, avec un avertissement. Échap ne fermait pas les panneaux du menu lorsqu’aucune partie n’était active : ce chemin est corrigé et testé. Les avis de sauvegarde recouvraient le titre sur les petits écrans : ils occupent maintenant une ligne propre dans la fenêtre, sans superposition. La vérification de version du test d’intégration attendait encore 0.3 ; son assertion a été actualisée après vérification que le manifeste utilisait déjà la version des données. Les passages d’essai interrompus ou en échec ont été remplacés par des exécutions complètes après corrections.

674 contrôles Node : socle 110, extension 140, résolutions 237, terrain/archives 187. Les 96 configurations complètes passent par la classe 0.4 réellement livrée : 6 épisodes × 2 vues × 2 difficultés × 2 fins × principal ou tous les détours. Les suites anciennes se recoupent avec ce périmètre : leurs parcours ne sont pas ajoutés pour gonfler le nombre de configurations. Douze scénarios supplémentaires rejoignent les trois postes de terrain puis terminent l’histoire avec les détours ; leurs configurations épisode-vue sont déjà comprises dans les 96.
