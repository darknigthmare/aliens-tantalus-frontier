# V0.9.0 — À bout de bras

Base cumulative : V0.8.0, sources locales conservées dans une nouvelle version. Aucun changement distant.

## Jouable

Six mobiles dans des aires locales : atelier, réserves, roulage, pompage, échangeurs, quarantaine. Deux types procéduraux : servante et benne. Quatre placements transformés et deux ajouts. X maintenu depuis une poignée latérale déplace le personnage et le chariot ensemble ; X relâché freine. N consulte les objets observés, sans commande distante. Commande tactile à deux contacts et carte M cohérente.

## Moteur

Géométrie dérivée par carnet, cache de navigation indexé sur la géométrie et invalidé après transformation. Déplacement balayé de l’objet et de l’acteur. Protection des portes, commandes, mobilier, acteurs et enregistreur. Bruit de roues seulement après déplacement accepté. Ligne de vue, navigation et obstruction utilisent les transformations. Prise interdite avec les mains occupées ; dommage et actions incompatibles interrompent la prise.

Schéma 9, imports 1–9, anciennes clés de collection conservées. Trente-deux vrais instantanés V0.1–V0.8 dans les fixtures. Filtrage des transformations invalides, reprise sans poignées maintenues, acteur repris dans un espace devenu libre sans correction indue.

## Corrections et vérifications

Marge de collision du joueur alignée avec le planificateur ; pilote de campagne utilise les détours publics au lieu d’un axe fixe. Dix parcours moteur, dont deux avec les six chariots réellement manipulés. Les anciens tests de métadonnées ont été mis à jour pour viser la version/schéma courant sans retirer les essais de migration des anciens formats. UI : sélecteur de bouton de chapitre distingué du conteneur HUD dans la suite de test.

216 fiches, 48 familles, 316 placements ; 38 pièces, 49 liaisons et 48 objectifs inchangés. Aucun nouveau scénario canon officiel. Rendu procédural provisoire, aucune fusion native hôte et aucune publication.

Correction tactile issue de l’essai CDP : le bouton d’écoute recouvrait celui des poignées. Les deux zones sont séparées et leur cible de pointeur est vérifiée. Le sous-titre du menu affiche maintenant le nom de la V0.9, pas celui de la V0.8.

Le message de prise ne reste plus affiché après le relâchement : « Freins serrés » remplace immédiatement l’ancien retour de commande. Contrôle navigateur dédié.
