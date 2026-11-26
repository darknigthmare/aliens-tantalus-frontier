# 0.3.0 — Les chemins sous pression

## Campagne et lieux

Les 46 salles, 53 liaisons, 18 chapitres et 33 objectifs de la 0.2 sont conservés. Seize salles reçoivent une implantation de collision propre ; trois relevés sont déplacés pour ne plus se trouver dans les nouveaux volumes. Les données de décoration passent à 331 placements de 52 familles, les obstacles à 108 et les dossiers à 80.

## Jouabilité

Les coups au contact disposent d’un préavis et d’une empreinte verrouillée. L’esquive directionnelle par Ctrl coûte de l’endurance et respecte les collisions. Neuf sources cycliques signalées alternent calme, préavis et danger ; leurs états peuvent être consignés. Quatre nouvelles vannes et deux caisses de renforts enrichissent les salles existantes. K répare un brancard arrêté avec un coût à l’achèvement. La carte et le HUD peuvent guider vers un prochain seuil connu, sans autopilote ni révélation de positions ennemies.

L’acide possède un contour et un avertissement rapproché plus lisibles. Le plan local des dangers utilise désormais leur véritable profondeur, pas une bande de hauteur uniforme. La progression partielle, les attaques en cours, les phases et le repère survivent à l’export/import. Les sauvegardes 0.1/0.2 migrent en schéma 3 avec copies de secours via Reprendre.

## Validation

118 tests Node ; 41 contrôles de navigateur hérités et 40 nouveaux ; 92 rendus de salles. Six parcours automatisés prudents terminent les trois difficultés et les deux présentations avec toutes les annexes, et reprennent 33 sauvegardes chacun pendant le trajet. Le pilote de base, sans les mêmes précautions, échoue encore sur deux combinaisons difficiles : ces essais sont conservés. Un scénario de vapeur/réparation reprend une vraie sauvegarde, provoque les dégâts normalement et répare avec une seule pièce.

Le rapport comporte 13 captures de la version. Les positions des acteurs des captures principales ne sont pas arrangées ; elles viennent des sauvegardes des parcours ou du scénario ciblé. Le rendu est figé pour la photographie. Les contrôles unitaires et certaines captures de régression ont toujours des états préparés, signalés séparément.

## Statut

Prototype autonome non officiel, pas intégration du moteur hôte. Aucun push ou déploiement. Graphisme vectoriel provisoire et pas de partie humaine complète. Les navigations file/localhost sont bloquées dans l’environnement de validation : aucune certification de persistance native, aucun contournement de politique.
