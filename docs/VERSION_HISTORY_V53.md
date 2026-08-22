# Historique de version — v53.0.0

## Objet

v53 est la release de vérité visuelle et de proportions physiques. Elle conserve l’architecture et la sauvegarde v52, puis corrige les substitutions d’identité, les orientations incohérentes, les dimensions de portes/props et plusieurs couches bitmap non consommées.

## Livré

- orientation source par plaque; Drone combat audité comme master gauche;
- calcul de miroir commun aux joueurs, PNJ, ennemis, armes et véhicules couverts;
- plaque combat joueur mise en quarantaine tant que son identité ne correspond pas au master locomotion;
- registre déterministe des 52 archétypes / 568 profils, lignes legacy fixes et télémétrie des approximations;
- Combat Synthetic rendu depuis son atlas au lieu du Working Joe;
- 16 profils de salle hub avec scale, floor ratio et collider de prop;
- parallaxe des viewports du hub réellement consommée;
- obstacles génériques superposés retirés des decks profilés;
- portes hub et mission utilisant les mêmes bounds au rendu et en collision;
- clé `barricade` inexistante remplacée par `cover`;
- maintenance pipe, ceiling cables et foreground pipes chargés et dessinés dans les missions de vaisseau;
- inventaire JSON/Markdown généré depuis les registres, avec gates anti-dérive;
- cache PWA et version publique passés à v53.0.0.

## Non déclaré terminé

- la génération OpenAI de la nouvelle plaque combat n’a produit aucun fichier à cause du blocage ACL des références;
- 297 profils ennemis n’ont pas d’art dédié et 205 partagent encore une famille authored;
- 278 profils véhicules n’ont pas de bitmap exact;
- les sets mission complets des 16 PNJ restent à produire;
- les hazards non-acide et les couches par zone/salle restent à produire.

Ces dettes sont détaillées dans `ASSET_RUNTIME_INVENTORY_V53.md` et restent visibles dans les tests et la télémétrie.
